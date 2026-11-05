import React, { useState } from 'react';
import { Novel, ReadingStatus } from '../types/novel';
import {
  X,
  BookOpen,
  Heart,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  Bookmark,
  Plus,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface NovelDetailModalProps {
  novel: Novel | null;
  isOpen: boolean;
  onClose: () => void;
  onRead: (novel: Novel, chapterIndex?: number) => void;
  onEdit: (novel: Novel) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onUpdateStatus: (id: string, status: ReadingStatus) => void;
  onUpdateProgress: (id: string, page: number) => void;
  onAddNote: (novelId: string, noteText: string, page: number) => void;
}

export const NovelDetailModal: React.FC<NovelDetailModalProps> = ({
  novel,
  isOpen,
  onClose,
  onRead,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateStatus,
  onUpdateProgress,
  onAddNote
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageInput, setPageInput] = useState<number>(novel ? novel.currentPage : 0);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Sync state if novel changes
  React.useEffect(() => {
    if (novel) {
      setPageInput(novel.currentPage);
      setShowDeleteConfirm(false);
      setShowAddNote(false);
      setNewNoteText('');
    }
  }, [novel]);

  if (!isOpen || !novel) return null;

  const handlePageChange = (newPage: number) => {
    const clamped = Math.min(novel.totalPages, Math.max(0, newPage));
    setPageInput(clamped);
    onUpdateProgress(novel.id, clamped);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(novel.id, newNoteText.trim(), novel.currentPage);
    setNewNoteText('');
    setShowAddNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hapus Novel Ini?</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus novel <strong className="text-white">"{novel.title}"</strong> dari perpustakaan? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(novel.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-900/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Novel</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6">
          {/* Main Info Header Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Book Cover */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative aspect-[3/4] w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/30 bg-slate-950 group">
                <img
                  src={novel.coverUrl}
                  alt={`Sampul ${novel.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => onToggleFavorite(e, novel.id)}
                    className={`p-2.5 rounded-full backdrop-blur-md border shadow-lg transition-transform active:scale-95 ${
                      novel.isFavorite
                        ? 'bg-rose-500/30 border-rose-500 text-rose-400'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${novel.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Quick file format indicator */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="uppercase font-mono font-medium text-slate-300">{novel.fileType}</span>
                <span>•</span>
                <span>{novel.fileSize || '2.0 MB'}</span>
              </div>
            </div>

            {/* Details & Actions */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800/40">
                    {novel.genre}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-800/80">
                    Tahun {novel.year}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-800/80">
                    {novel.totalPages} Halaman
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {novel.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Karya: <span className="text-slate-200 font-semibold text-base">{novel.author}</span>
                </p>
              </div>

              {/* Status Selector (Reading Tracker) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Status Membaca:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateStatus(novel.id, 'belum_dibaca')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      novel.status === 'belum_dibaca'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Belum Dibaca</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(novel.id, 'sedang_dibaca')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      novel.status === 'sedang_dibaca'
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sedang Dibaca</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(novel.id, 'selesai')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      novel.status === 'selesai'
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai Dibaca</span>
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    Progres Membaca
                  </span>
                  <span className="font-mono text-purple-300 font-bold text-sm">
                    {novel.progressPercentage}% ({pageInput} / {novel.totalPages} hal)
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={novel.totalPages}
                  value={pageInput}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Halaman 0</span>
                  <span>Tamat: Halaman {novel.totalPages}</span>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onRead(novel)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {novel.currentPage > 0
                      ? `Lanjutkan Membaca (Hal. ${novel.currentPage})`
                      : 'Mulai Membaca'}
                  </span>
                </button>

                <button
                  onClick={() => onEdit(novel)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 hover:border-rose-800/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis Section */}
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Sinopsis Lengkap
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-serif-book whitespace-pre-line">
              {novel.synopsis}
            </p>
          </div>

          {/* Chapters List (if novel has chapters) */}
          {novel.chapters && novel.chapters.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  Daftar Bab Tersedia ({novel.chapters.length} Bab)
                </h3>
                <span className="text-xs text-slate-400">Klik bab untuk langsung membaca</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {novel.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => onRead(novel, index)}
                    className="w-full flex items-center justify-between py-3 px-2 rounded-xl text-left hover:bg-slate-900/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-purple-300 text-xs flex items-center justify-center font-mono font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                        {chapter.title}
                      </span>
                    </div>
                    <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reading Notes / Personal Reflections */}
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  Catatan Membaca Pribadi
                </h3>
              </div>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddNote ? 'Batal' : 'Tambah Catatan'}</span>
              </button>
            </div>

            {showAddNote && (
              <form onSubmit={handleSaveNote} className="space-y-3 p-3 rounded-xl bg-slate-900 border border-purple-900/40">
                <textarea
                  rows={2}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={`Tulis catatan atau kutipan favorit di halaman ${novel.currentPage}...`}
                  className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-400 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            )}

            {novel.notes && novel.notes.length > 0 ? (
              <div className="space-y-2">
                {novel.notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-purple-300">Halaman {note.page}</span>
                      <span className="text-[10px]">
                        {new Date(note.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-slate-200 italic font-serif-book">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Belum ada catatan untuk novel ini. Tulis kutipan menarik atau pemikiran Anda saat membaca.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
