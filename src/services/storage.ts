import { Novel, ReadingStatus, UserProfile } from '../types/novel';
import { SAMPLE_NOVELS } from '../data/sampleNovels';
import {
  checkSupabaseHealth,
  fetchNovelsFromSupabase,
  insertNovelToSupabase,
  updateNovelInSupabase,
  deleteNovelFromSupabase,
  batchUpsertNovelsToSupabase,
  fetchProfileFromSupabase,
  saveProfileToSupabase,
  SupabaseHealth
} from './supabase';

const STORAGE_KEY = 'novelvault_novels_v1';
const PROFILE_KEY = 'novelvault_user_profile_v1';
const DB_NAME = 'novelvault_files_db';
const DB_STORE = 'novel_files';

// Helper to open IndexedDB for large files
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFileInIndexedDB(id: string, fileData: string, fileName: string, fileType: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    store.put({ id, fileData, fileName, fileType, savedAt: new Date().toISOString() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan file ke IndexedDB:', err);
  }
}

export async function getFileFromIndexedDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const request = store.get(id);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result ? request.result.fileData : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    store.delete(id);
  } catch (err) {
    console.warn('Gagal menghapus file dari IndexedDB:', err);
  }
}

export const StorageService = {
  // Synchronous cache read for instantaneous UI rendering
  getNovelsCache(): Novel[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NOVELS));
        return SAMPLE_NOVELS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return SAMPLE_NOVELS;
    } catch {
      return SAMPLE_NOVELS;
    }
  },

  saveNovelsCache(novels: Novel[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novels));
      window.dispatchEvent(new Event('novelvault_storage_updated'));
    } catch (e) {
      console.error('Error saving novels cache:', e);
    }
  },

  // Primary fetch: tries Supabase first; if table exists, syncs cache; else falls back to cache
  async getNovels(): Promise<{ novels: Novel[]; isFromSupabase: boolean; error?: string }> {
    try {
      const health = await checkSupabaseHealth();
      if (health.tableExists) {
        const { data, error } = await fetchNovelsFromSupabase();
        if (data && !error) {
          // If Supabase table is empty on first run, auto-seed with sample novels!
          if (data.length === 0) {
            const cached = this.getNovelsCache();
            await batchUpsertNovelsToSupabase(cached);
            return { novels: cached, isFromSupabase: true };
          }
          this.saveNovelsCache(data);
          return { novels: data, isFromSupabase: true };
        }
      }
    } catch (e) {
      console.warn('Supabase fetch error, using local cache:', e);
    }

    return { novels: this.getNovelsCache(), isFromSupabase: false };
  },

  async addNovel(
    novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage'>
  ): Promise<{ novel: Novel; isSupabaseSaved: boolean }> {
    const now = new Date().toISOString();
    const totalPages = Math.max(1, Number(novelData.totalPages) || 100);
    const currentPage = Math.min(totalPages, Math.max(0, Number(novelData.currentPage) || 0));
    const progress = Math.round((currentPage / totalPages) * 100);

    const newNovel: Novel = {
      ...novelData,
      id: `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      totalPages,
      currentPage,
      progressPercentage: progress,
      createdAt: now,
      updatedAt: now,
      lastReadAt: currentPage > 0 ? now : undefined
    };

    // Update local cache first for instant feedback
    const current = this.getNovelsCache();
    current.unshift(newNovel);
    this.saveNovelsCache(current);

    // Try saving directly to Supabase
    let isSupabaseSaved = false;
    try {
      const res = await insertNovelToSupabase(newNovel);
      if (res.data) {
        isSupabaseSaved = true;
      }
    } catch (err) {
      console.warn('Could not insert to Supabase:', err);
    }

    return { novel: newNovel, isSupabaseSaved };
  },

  async updateNovel(
    id: string,
    updates: Partial<Novel>
  ): Promise<{ novel: Novel | null; isSupabaseUpdated: boolean }> {
    const novels = this.getNovelsCache();
    const index = novels.findIndex((n) => n.id === id);
    if (index === -1) return { novel: null, isSupabaseUpdated: false };

    const current = novels[index];
    const totalPages = updates.totalPages !== undefined ? Math.max(1, Number(updates.totalPages)) : current.totalPages;
    let currentPage = updates.currentPage !== undefined ? Number(updates.currentPage) : current.currentPage;
    currentPage = Math.min(totalPages, Math.max(0, currentPage));
    const progressPercentage = Math.round((currentPage / totalPages) * 100);

    let status = updates.status || current.status;
    if (updates.currentPage !== undefined && !updates.status) {
      if (currentPage >= totalPages) {
        status = 'selesai';
      } else if (currentPage > 0 && status === 'belum_dibaca') {
        status = 'sedang_dibaca';
      }
    }

    const updated: Novel = {
      ...current,
      ...updates,
      totalPages,
      currentPage,
      status,
      progressPercentage,
      updatedAt: new Date().toISOString()
    };

    novels[index] = updated;
    this.saveNovelsCache(novels);

    // Update in Supabase
    let isSupabaseUpdated = false;
    try {
      const res = await updateNovelInSupabase(id, updated);
      if (res.data) isSupabaseUpdated = true;
    } catch (err) {
      console.warn('Could not update in Supabase:', err);
    }

    return { novel: updated, isSupabaseUpdated };
  },

  async deleteNovel(id: string): Promise<{ success: boolean; isSupabaseDeleted: boolean }> {
    const novels = this.getNovelsCache();
    const filtered = novels.filter((n) => n.id !== id);
    if (filtered.length !== novels.length) {
      this.saveNovelsCache(filtered);
      deleteFileFromIndexedDB(id);

      let isSupabaseDeleted = false;
      try {
        const res = await deleteNovelFromSupabase(id);
        isSupabaseDeleted = res.success;
      } catch (err) {
        console.warn('Could not delete from Supabase:', err);
      }

      return { success: true, isSupabaseDeleted };
    }
    return { success: false, isSupabaseDeleted: false };
  },

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean; novel: Novel | null }> {
    const novels = this.getNovelsCache();
    const novel = novels.find((n) => n.id === id);
    if (!novel) return { isFavorite: false, novel: null };

    const newStatus = !novel.isFavorite;
    const { novel: updated } = await this.updateNovel(id, { isFavorite: newStatus });
    return { isFavorite: newStatus, novel: updated };
  },

  async updateProgress(id: string, currentPage: number): Promise<Novel | null> {
    const novels = this.getNovelsCache();
    const novel = novels.find((n) => n.id === id);
    if (!novel) return null;

    let status: ReadingStatus = novel.status;
    if (currentPage >= novel.totalPages) {
      status = 'selesai';
    } else if (currentPage > 0) {
      status = 'sedang_dibaca';
    }

    const { novel: updated } = await this.updateNovel(id, {
      currentPage,
      status,
      lastReadAt: new Date().toISOString()
    });
    return updated;
  },

  async addNote(novelId: string, text: string, page: number, chapterTitle?: string): Promise<Novel | null> {
    const novels = this.getNovelsCache();
    const novel = novels.find((n) => n.id === novelId);
    if (!novel) return null;

    const note = {
      id: `note-${Date.now()}`,
      page,
      chapterTitle,
      text,
      createdAt: new Date().toISOString()
    };

    const notes = novel.notes ? [note, ...novel.notes] : [note];
    const { novel: updated } = await this.updateNovel(novelId, { notes });
    return updated;
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      name: 'Budi Santoso',
      email: 'budi.kolektor@novelvault.id',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      readingGoal: 24,
      joinedDate: 'Januari 2026'
    };
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event('novelvault_profile_updated'));
      await saveProfileToSupabase(profile);
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  exportLibraryJson(): string {
    const novels = this.getNovelsCache();
    const profile = this.getUserProfile();
    const exportData = {
      app: 'NOVELVAULT',
      version: '2.0.0-supabase',
      database: 'Supabase PostgreSQL',
      exportedAt: new Date().toISOString(),
      user: profile,
      totalNovels: novels.length,
      novels
    };
    return JSON.stringify(exportData, null, 2);
  },

  async importLibraryJson(jsonString: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      let list: Novel[] = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && Array.isArray(parsed.novels)) {
        list = parsed.novels;
      } else {
        return { success: false, error: 'Format berkas JSON tidak valid untuk NOVELVAULT.' };
      }

      if (list.length === 0) {
        return { success: false, error: 'Tidak ada data novel yang ditemukan dalam file cadangan.' };
      }

      this.saveNovelsCache(list);
      // Batch sync to Supabase
      try {
        await batchUpsertNovelsToSupabase(list);
      } catch (err) {
        console.warn('Could not sync imported novels to Supabase:', err);
      }

      return { success: true, count: list.length };
    } catch (e) {
      return { success: false, error: 'Gagal mengurai file JSON: ' + (e instanceof Error ? e.message : 'Format rusak') };
    }
  },

  async resetToDefault(): Promise<Novel[]> {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NOVELS));
    try {
      await batchUpsertNovelsToSupabase(SAMPLE_NOVELS);
    } catch {}
    window.dispatchEvent(new Event('novelvault_storage_updated'));
    return SAMPLE_NOVELS;
  }
};
