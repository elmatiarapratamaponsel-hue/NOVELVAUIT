import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storage';
import {
  X,
  CloudCog,
  Database,
  Smartphone,
  Laptop,
  Tablet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Key,
  Copy,
  Info
} from 'lucide-react';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'guide' | 'security'>('sync');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle JSON export
  const handleExport = () => {
    try {
      const json = StorageService.exportLibraryJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novelvault-cadangan-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Cadangan seluruh koleksi novel berhasil diunduh!', 'success');
    } catch (e) {
      onShowToast('Gagal mengekspor file cadangan.', 'error');
    }
  };

  // Handle JSON import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const result = await StorageService.importLibraryJson(text);
        if (result.success) {
          onShowToast(`Berhasil memulihkan ${result.count || 0} novel ke perpustakaan!`, 'success');
          onRestoreSuccess();
          onClose();
        } else {
          onShowToast(result.error || 'Format file tidak sesuai.', 'error');
        }
      } catch {
        onShowToast('Gagal memproses file cadangan.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const sampleRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Koleksi novel milik pengguna pribadi
    match /users/{userId}/novels/{novelId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(sampleRulesCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Aturan keamanan Firestore disalin ke clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <CloudCog className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Status Database & Sinkronisasi Multi-Device
              </h2>
              <p className="text-xs text-slate-400">
                Pusat kontrol penyimpanan data NOVELVAULT & panduan integrasi Firebase
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

        {/* Current Database Transparency Status Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-300">
                Mode Aktif: Penyimpanan Lokal Terenkripsi (IndexedDB & LocalStorage)
              </span>
              <p className="text-[11px] text-slate-400">
                Data novel, riwayat baca, dan progres tersimpan langsung dan aman di peramban ini tanpa kuota server.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Firebase Cloud: Belum Dikonfigurasi / Ditolak
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sync'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Akses Multi-Device & Cadangan
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Petunjuk Konfigurasi Firebase
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Aturan Keamanan (Rules)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-slate-300 text-xs sm:text-sm">
          {/* TAB 1: Multi-Device Sync & Backup */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Multi-Device Concept Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-800/40 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Laptop className="w-5 h-5 text-purple-400" />
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <Tablet className="w-5 h-5 text-sky-400" />
                  <span>Dukungan Multi-Device Penuh</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NOVELVAULT dirancang responsif untuk digunakan di Smartphone, Tablet, maupun Laptop. Anda dapat memindahkan perpustakaan novel lengkap beserta posisi halaman terakhir yang Anda baca ke perangkat lain kapan pun dalam 1 detik.
                </p>
              </div>

              {/* Instant Backup & Restore Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Ekspor Cadangan Koleksi</h4>
                    <p className="text-xs text-slate-400">
                      Unduh seluruh data novel, sinopsis, status membaca, dan catatan ke file cadangan JSON.
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File Cadangan (.json)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Impor & Pulihkan Koleksi</h4>
                    <p className="text-xs text-slate-400">
                      Buka file cadangan dari HP/laptop lain untuk menyinkronkan seluruh perpustakaan Anda ke sini.
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
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Cadangan untuk Dipulihkan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset to sample data */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Data Demonstrasi Awal</span>
                  <p className="text-[11px] text-slate-400">
                    Ingin mengembalikan data contoh 5 novel unggulan dengan bab bacaan lengkap?
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Kembalikan koleksi ke data contoh awal?')) {
                      StorageService.resetToDefault();
                      onRestoreSuccess();
                      onShowToast('Perpustakaan dikembalikan ke data contoh!', 'info');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Contoh</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Petunjuk Konfigurasi Firebase Lengkap */}
          {activeTab === 'guide' && (
            <div className="space-y-4 leading-relaxed">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-2">
                <span className="font-bold text-purple-300 block">
                  📌 Cara Menghubungkan Firebase ke NOVELVAULT:
                </span>
                <p className="text-slate-300">
                  Untuk mengaktifkan sinkronisasi otomatis Cloud Firestore dan Firebase Auth pada proyek ini, ikuti 5 langkah sederhana berikut:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">
                    1. Buat Proyek Firebase Baru
                  </span>
                  <p className="text-slate-400 text-xs">
                    Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">Firebase Console</a>, klik "Add project" dan beri nama <code>novelvault-app</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">
                    2. Aktifkan Firebase Authentication
                  </span>
                  <p className="text-slate-400 text-xs">
                    Masuk ke menu <strong>Build &gt; Authentication &gt; Sign-in method</strong>, aktifkan penyedia <strong>Google</strong> atau <strong>Email/Password</strong> untuk login pengguna.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">
                    3. Buat Cloud Firestore Database
                  </span>
                  <p className="text-slate-400 text-xs">
                    Pilih menu <strong>Firestore Database</strong>, klik "Create database", pilih lokasi server terdekat (misal: <code>asia-southeast1</code> untuk Indonesia/Singapura).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">
                    4. Aktifkan Firebase Storage (Opsional untuk PDF)
                  </span>
                  <p className="text-slate-400 text-xs">
                    Pilih menu <strong>Storage</strong> untuk menyimpan file PDF, EPUB, dan gambar sampul buku berukuran besar.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1">
                    5. Tambahkan Web App & Dapatkan Kunci
                  </span>
                  <p className="text-slate-400 text-xs">
                    Klik ikon Web (<code>&lt;/&gt;</code>) pada Project Overview, salin objek konfigurasi <code>firebaseConfig</code> ke file <code>firebase-applet-config.json</code> proyek.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security Rules */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Aturan Keamanan Cloud Firestore</h4>
                  <p className="text-xs text-slate-400">
                    Memastikan setiap pengguna hanya dapat membaca dan menulis koleksi novel miliknya sendiri:
                  </p>
                </div>
                <button
                  onClick={copyRulesToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-medium transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Aturan'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {sampleRulesCode}
              </pre>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Dengan aturan ini, data koleksi Budi tidak dapat dibaca oleh pengguna lain yang tidak sah, menjaga privasi koleksi pribadi secara menyeluruh.
                </p>
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
