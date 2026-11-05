import { Novel, ReadingStatus, UserProfile } from '../types/novel';
import { SAMPLE_NOVELS } from '../data/sampleNovels';

const STORAGE_KEY = 'novelvault_novels_v1';
const PROFILE_KEY = 'novelvault_user_profile_v1';
const DB_NAME = 'novelvault_files_db';
const DB_STORE = 'novel_files';

// Helper to open IndexedDB for large novel files (PDF/EPUB)
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
  getNovels(): Novel[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // First initialization
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NOVELS));
        return SAMPLE_NOVELS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return SAMPLE_NOVELS;
    } catch (e) {
      console.error('Error loading novels from storage:', e);
      return SAMPLE_NOVELS;
    }
  },

  getNovelById(id: string): Novel | undefined {
    const list = this.getNovels();
    return list.find((n) => n.id === id);
  },

  saveNovels(novels: Novel[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novels));
      window.dispatchEvent(new Event('novelvault_storage_updated'));
    } catch (e) {
      console.error('Error saving novels:', e);
    }
  },

  addNovel(novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage'>): Novel {
    const novels = this.getNovels();
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

    novels.unshift(newNovel);
    this.saveNovels(novels);
    return newNovel;
  },

  updateNovel(id: string, updates: Partial<Novel>): Novel | null {
    const novels = this.getNovels();
    const index = novels.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const current = novels[index];
    const totalPages = updates.totalPages !== undefined ? Math.max(1, Number(updates.totalPages)) : current.totalPages;
    let currentPage = updates.currentPage !== undefined ? Number(updates.currentPage) : current.currentPage;
    currentPage = Math.min(totalPages, Math.max(0, currentPage));
    const progressPercentage = Math.round((currentPage / totalPages) * 100);

    // Auto-derive status if progress completes or starts
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
    this.saveNovels(novels);
    return updated;
  },

  deleteNovel(id: string): boolean {
    const novels = this.getNovels();
    const filtered = novels.filter((n) => n.id !== id);
    if (filtered.length !== novels.length) {
      this.saveNovels(filtered);
      deleteFileFromIndexedDB(id);
      return true;
    }
    return false;
  },

  toggleFavorite(id: string): boolean {
    const novel = this.getNovelById(id);
    if (!novel) return false;
    const newStatus = !novel.isFavorite;
    this.updateNovel(id, { isFavorite: newStatus });
    return newStatus;
  },

  updateProgress(id: string, currentPage: number): Novel | null {
    const novel = this.getNovelById(id);
    if (!novel) return null;
    
    let status: ReadingStatus = novel.status;
    if (currentPage >= novel.totalPages) {
      status = 'selesai';
    } else if (currentPage > 0) {
      status = 'sedang_dibaca';
    }

    return this.updateNovel(id, {
      currentPage,
      status,
      lastReadAt: new Date().toISOString()
    });
  },

  addNote(novelId: string, text: string, page: number, chapterTitle?: string): Novel | null {
    const novel = this.getNovelById(novelId);
    if (!novel) return null;

    const note = {
      id: `note-${Date.now()}`,
      page,
      chapterTitle,
      text,
      createdAt: new Date().toISOString()
    };

    const notes = novel.notes ? [note, ...novel.notes] : [note];
    return this.updateNovel(novelId, { notes });
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return {
      name: 'Budi Santoso',
      email: 'budi.kolektor@novelvault.id',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      readingGoal: 24,
      joinedDate: 'Januari 2026'
    };
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event('novelvault_profile_updated'));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  exportLibraryJson(): string {
    const novels = this.getNovels();
    const profile = this.getUserProfile();
    const exportData = {
      app: 'NOVELVAULT',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: profile,
      totalNovels: novels.length,
      novels
    };
    return JSON.stringify(exportData, null, 2);
  },

  importLibraryJson(jsonString: string): { success: boolean; count?: number; error?: string } {
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

      // Merge or replace
      this.saveNovels(list);
      return { success: true, count: list.length };
    } catch (e) {
      return { success: false, error: 'Gagal mengurai file JSON: ' + (e instanceof Error ? e.message : 'Format rusak') };
    }
  },

  resetToDefault(): Novel[] {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NOVELS));
    window.dispatchEvent(new Event('novelvault_storage_updated'));
    return SAMPLE_NOVELS;
  }
};
