import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import {
  checkSupabaseHealth,
  batchUpsertNovelsToSupabase,
  SQL_CREATE_TABLES_SCRIPT,
  SUPABASE_URL,
  SupabaseHealth
} from '../services/supabase';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Upload,
  Download,
  Smartphone,
  Laptop,
  Tablet,
  RotateCcw,
  Sparkles,
  Cloud,
  Check
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onShowToast
}) => {
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [checking, setChecking] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'backup'>('status');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await checkSupabaseHealth();
      setHealth(res);
    } catch {
      setHealth({
        connected: false,
        tableExists: false,
        message: 'Gagal menghubungi server Supabase.'
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_CREATE_TABLES_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    onShowToast('Skrip SQL Supabase berhasil disalin ke clipboard!', 'success');
  };

  const handleMigrateNovels = async () => {
    setMigrating(true);
    try {
      const novels = StorageService.getNovelsCache();
      const res = await batchUpsertNovelsToSupabase(novels);
      if (res.error) {
        onShowToast(`Gagal sinkronisasi: ${res.error}`, 'error');
      } else {
        onShowToast(`Berhasil menyinkronkan ${res.count} novel ke database Supabase Cloud! ☁️`, 'success');
        onRefreshData();
        checkStatus();
      }
    } catch {
      onShowToast('Terjadi kesalahan saat migrasi.', 'error');
    } finally {
      setMigrating(false);
    }
  };

  const handleExport = () => {
    try {
      const json = StorageService.exportLibraryJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novelvault-supabase-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Cadangan perpustakaan Supabase berhasil diunduh!', 'success');
    } catch {
      onShowToast('Gagal mengekspor berkas cadangan.', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const result = await StorageService.importLibraryJson(text);
        if (result.success) {
          onShowToast(`Berhasil memulihkan ${result.count || 0} novel dan tersinkron ke Supabase!`, 'success');
          onRefreshData();
          onClose();
        } else {
          onShowToast(result.error || 'Format berkas tidak sesuai.', 'error');
        }
      } catch {
        onShowToast('Gagal memproses file cadangan.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Koneksi Database Supabase Cloud
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-sm sm:max-w-md">
                {SUPABASE_URL}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realtime Status Indicator Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                health?.tableExists
                  ? 'bg-emerald-400 animate-pulse'
                  : health?.connected
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-400'
              }`}
            />
            <div>
              <span className="text-xs font-bold text-white">
                {health?.tableExists
                  ? 'Database Supabase Aktif & Tersinkronisasi'
                  : health?.connected
                  ? "Koneksi Terhubung • Tabel 'novels' Belum Dibuat"
                  : 'Memeriksa Sambungan Supabase...'}
              </span>
              <p className="text-[11px] text-slate-400">{health?.message}</p>
            </div>
          </div>

          <button
            onClick={checkStatus}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Memeriksa...' : 'Cek Status'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Status & Multi-Device
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Skrip SQL Tabel Supabase
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadangan & Impor JSON
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-slate-300 text-xs sm:text-sm">
          {/* TAB 1: Status & Multi-device */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* If table is not created yet, show prominent quick setup guide */}
              {!health?.tableExists && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertCircle className="w-5 h-5" />
                    <span>Langkah Mudah: Buat Tabel di Supabase Dashboard</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Koneksi API URL dan API Key Supabase Anda telah terpasang dengan benar. Supabase membutuhkan tabel <code className="text-amber-300">public.novels</code> untuk menyimpan data novel secara online.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      onClick={handleCopySql}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Skrip SQL Tersalin!' : '1. Salin Skrip SQL'}</span>
                    </button>
                    <a
                      href="https://supabase.com/dashboard/project/ewvjlektdtsbjvhkgzcn/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>2. Buka Supabase SQL Editor</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Multi-Device Feature Highlight */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-purple-950/30 border border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Laptop className="w-5 h-5 text-emerald-400" />
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <Tablet className="w-5 h-5 text-sky-400" />
                  <span>Sinkronisasi Otomatis Antar Perangkat (Multi-Device)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dengan database Supabase, data koleksi novel, status membaca (*Sedang Dibaca, Selesai*), dan posisi halaman terakhir otomatis tersimpan di cloud. Saat Anda membuka NOVELVAULT dari HP atau laptop lain, koleksi Anda selalu terbarui secara *real-time*.
                </p>
              </div>

              {/* Sync / Migrate Button */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Sinkronkan Koleksi ke Supabase</h4>
                  <p className="text-xs text-slate-400">
                    Kirim semua novel yang ada saat ini ke tabel Supabase Cloud Anda.
                  </p>
                </div>
                <button
                  onClick={handleMigrateNovels}
                  disabled={migrating}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{migrating ? 'Menyinkronkan...' : 'Kirim Koleksi ke Supabase'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SQL Script */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Skrip SQL Pembuatan Tabel</h4>
                  <p className="text-xs text-slate-400">
                    Jalankan skrip ini sekali saja di Supabase SQL Editor:
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-80">
                {SQL_CREATE_TABLES_SCRIPT}
              </pre>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Skrip ini telah mengonfigurasi kolom id, title, author, genre, year, synopsis, cover_url, file_type, status, current_page, total_pages, chapters, dan hak akses Row Level Security (RLS) otomatis.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Backup & Restore JSON */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Unduh Cadangan Perpustakaan</h4>
                    <p className="text-xs text-slate-400">
                      Simpan cadangan offline seluruh novel ke format JSON kapan saja.
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Cadangan JSON</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Impor & Sinkron ke Supabase</h4>
                    <p className="text-xs text-slate-400">
                      Pulihkan berkas JSON cadangan dan unggah langsung ke database Supabase Cloud.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Pilih File untuk Dipulihkan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Kembalikan Data Contoh</span>
                  <p className="text-[11px] text-slate-400">
                    Isi ulang 5 novel contoh karya sastra unggulan.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm('Kembalikan ke data contoh awal?')) {
                      await StorageService.resetToDefault();
                      onRefreshData();
                      onShowToast('Data dikembalikan ke contoh awal!', 'info');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Contoh</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
