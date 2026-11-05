import { createClient } from '@supabase/supabase-js';
import { Novel, ReadingStatus, UserProfile } from '../types/novel';

export const SUPABASE_URL = 'https://ewvjlektdtsbjvhkgzcn.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmpsZWt0ZHRzYmp2aGtnemNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NzQ4MzYsImV4cCI6MjEwOTQ1MDgzNn0.5BE6aaYXxphyzNPzndgtjGa3gJXM2DGryqG3ttOe8N4';
export const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmpsZWt0ZHRzYmp2aGtnemNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg3NDgzNiwiZXhwIjoyMTA5NDUwODM2fQ.CCXDyC2pnTRo_izWNxneWh2IreRGyH0SE2jmDpRBqB8';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SQL_CREATE_TABLES_SCRIPT = `-- ==========================================
-- SKRIP PEMBUATAN TABEL NOVELVAULT DI SUPABASE
-- Buka: https://supabase.com/dashboard/project/ewvjlektdtsbjvhkgzcn/sql/new
-- Tempel (paste) kode ini dan klik "Run"
-- ==========================================

-- 1. Buat Tabel Novels (Koleksi Novel)
CREATE TABLE IF NOT EXISTS public.novels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 2024,
    synopsis TEXT,
    cover_url TEXT,
    file_type TEXT NOT NULL DEFAULT 'pdf',
    file_name TEXT,
    file_size TEXT,
    file_data TEXT,
    status TEXT NOT NULL DEFAULT 'belum_dibaca',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    current_page INTEGER NOT NULL DEFAULT 0,
    total_pages INTEGER NOT NULL DEFAULT 100,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    chapters JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Buat Tabel User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    reading_goal INTEGER NOT NULL DEFAULT 24,
    joined_date TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Atur Keamanan Data (Row Level Security)
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Berikan Hak Akses Penuh untuk Aplikasi secara Aman
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'novels' AND policyname = 'Akses Penuh Novels'
  ) THEN
    CREATE POLICY "Akses Penuh Novels" ON public.novels FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Akses Penuh Profiles'
  ) THEN
    CREATE POLICY "Akses Penuh Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Beri izin hak akses ke role anon dan authenticated
GRANT ALL ON public.novels TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
`;

// Helper: Convert App Model (camelCase) to Supabase Database Row (snake_case)
export function toDbRow(novel: Partial<Novel>) {
  const row: Record<string, any> = {};
  if (novel.id !== undefined) row.id = novel.id;
  if (novel.title !== undefined) row.title = novel.title;
  if (novel.author !== undefined) row.author = novel.author;
  if (novel.genre !== undefined) row.genre = novel.genre;
  if (novel.year !== undefined) row.year = novel.year;
  if (novel.synopsis !== undefined) row.synopsis = novel.synopsis;
  if (novel.coverUrl !== undefined) row.cover_url = novel.coverUrl;
  if (novel.fileType !== undefined) row.file_type = novel.fileType;
  if (novel.fileName !== undefined) row.file_name = novel.fileName;
  if (novel.fileSize !== undefined) row.file_size = novel.fileSize;
  if (novel.fileData !== undefined) row.file_data = novel.fileData;
  if (novel.status !== undefined) row.status = novel.status;
  if (novel.isFavorite !== undefined) row.is_favorite = novel.isFavorite;
  if (novel.currentPage !== undefined) row.current_page = novel.currentPage;
  if (novel.totalPages !== undefined) row.total_pages = novel.totalPages;
  if (novel.progressPercentage !== undefined) row.progress_percentage = novel.progressPercentage;
  if (novel.chapters !== undefined) row.chapters = novel.chapters;
  if (novel.notes !== undefined) row.notes = novel.notes;
  if (novel.lastReadAt !== undefined) row.last_read_at = novel.lastReadAt;
  if (novel.createdAt !== undefined) row.created_at = novel.createdAt;
  if (novel.updatedAt !== undefined) row.updated_at = novel.updatedAt;
  return row;
}

// Helper: Convert Supabase Database Row (snake_case) to App Model (camelCase)
export function fromDbRow(row: any): Novel {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre,
    year: row.year || 2024,
    synopsis: row.synopsis || '',
    coverUrl: row.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    fileType: row.file_type || 'pdf',
    fileName: row.file_name,
    fileSize: row.file_size,
    fileData: row.file_data,
    status: row.status as ReadingStatus,
    isFavorite: !!row.is_favorite,
    currentPage: row.current_page || 0,
    totalPages: row.total_pages || 100,
    progressPercentage: row.progress_percentage || 0,
    chapters: Array.isArray(row.chapters) ? row.chapters : [],
    notes: Array.isArray(row.notes) ? row.notes : [],
    lastReadAt: row.last_read_at,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

export interface SupabaseHealth {
  connected: boolean;
  tableExists: boolean;
  message: string;
}

// Check if Supabase is reachable and if `novels` table exists
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  try {
    const { data, error } = await supabase.from('novels').select('id').limit(1);
    if (!error) {
      return {
        connected: true,
        tableExists: true,
        message: 'Database Supabase aktif & tabel novels terhubung sempurna.'
      };
    }

    if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
      return {
        connected: true,
        tableExists: false,
        message: "Koneksi Supabase aktif, namun tabel 'novels' belum dibuat di SQL Editor."
      };
    }

    return {
      connected: false,
      tableExists: false,
      message: error.message || 'Gagal tersambung ke Supabase.'
    };
  } catch (err) {
    return {
      connected: false,
      tableExists: false,
      message: err instanceof Error ? err.message : 'Kesalahan jaringan Supabase'
    };
  }
}

// Fetch all novels from Supabase
export async function fetchNovelsFromSupabase(): Promise<{ data: Novel[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const parsed: Novel[] = (data || []).map(fromDbRow);
    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Kesalahan fetch Supabase' };
  }
}

// Insert single novel to Supabase
export async function insertNovelToSupabase(novel: Novel): Promise<{ data: Novel | null; error: string | null }> {
  try {
    const dbRow = toDbRow(novel);
    const { data, error } = await supabase
      .from('novels')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: fromDbRow(data), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Gagal simpan ke Supabase' };
  }
}

// Update novel in Supabase
export async function updateNovelInSupabase(id: string, updates: Partial<Novel>): Promise<{ data: Novel | null; error: string | null }> {
  try {
    const dbRow = toDbRow(updates);
    dbRow.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('novels')
      .update(dbRow)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: fromDbRow(data), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Gagal update Supabase' };
  }
}

// Delete novel from Supabase
export async function deleteNovelFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('novels')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal hapus dari Supabase' };
  }
}

// Migrate/Sync multiple novels to Supabase (e.g. initial seed or local backup to cloud)
export async function batchUpsertNovelsToSupabase(novels: Novel[]): Promise<{ count: number; error: string | null }> {
  try {
    if (novels.length === 0) return { count: 0, error: null };
    const rows = novels.map((n) => toDbRow(n));
    const { data, error } = await supabase
      .from('novels')
      .upsert(rows, { onConflict: 'id' })
      .select('id');

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: data?.length || 0, error: null };
  } catch (err) {
    return { count: 0, error: err instanceof Error ? err.message : 'Gagal batch upsert ke Supabase' };
  }
}

// User Profile in Supabase
export async function fetchProfileFromSupabase(profileId: string = 'budi_default'): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      email: data.email || 'budi.kolektor@novelvault.id',
      avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      readingGoal: data.reading_goal || 24,
      joinedDate: data.joined_date || 'Januari 2026'
    };
  } catch {
    return null;
  }
}

export async function saveProfileToSupabase(profile: UserProfile, profileId: string = 'budi_default'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: profileId,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatarUrl,
        reading_goal: profile.readingGoal,
        joined_date: profile.joinedDate,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}
