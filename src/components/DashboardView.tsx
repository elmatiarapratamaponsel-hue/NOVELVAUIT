import React from 'react';
import { Novel, UserProfile } from '../types/novel';
import { NovelCard } from './NovelCard';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
  Search,
  Plus,
  Compass,
  Bookmark
} from 'lucide-react';

interface DashboardViewProps {
  novels: Novel[];
  userProfile: UserProfile;
  onSelectNovel: (novel: Novel) => void;
  onReadNovel: (novel: Novel) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onOpenAddModal: () => void;
  onNavigateToLibrary: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  novels,
  userProfile,
  onSelectNovel,
  onReadNovel,
  onToggleFavorite,
  onOpenAddModal,
  onNavigateToLibrary,
  searchQuery,
  onSearchChange
}) => {
  // Indonesian greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const totalCount = novels.length;
  const readingNovels = novels.filter((n) => n.status === 'sedang_dibaca');
  const finishedNovels = novels.filter((n) => n.status === 'selesai');
  const favoriteNovels = novels.filter((n) => n.isFavorite);

  // Novel currently being read with highest progress or most recent lastReadAt
  const currentlyReadingHero =
    readingNovels.sort((a, b) => {
      const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return timeB - timeA;
    })[0] || null;

  // Recent additions (sorted by createdAt)
  const recentNovels = [...novels]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Recommendations:
  // Pick unread novels, or favorites, or high rated
  const unreadNovels = novels.filter((n) => n.status === 'belum_dibaca');
  const recommendedNovels = (
    unreadNovels.length > 0 ? unreadNovels : novels.filter((n) => n.id !== currentlyReadingHero?.id)
  ).slice(0, 3);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-900/30 p-6 sm:p-8 shadow-xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Perpustakaan Digital Pribadi
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">{userProfile.name}</span>!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Koleksi novelmu tersimpan rapi dan siap dibaca kapan saja. Temukan kembali lembaran petualangan favoritmu tanpa batas.
            </p>

            {/* Quick search input directly in hero */}
            <div className="mt-5 max-w-lg">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Cari cepat judul atau penulis di koleksimu..."
                  className="w-full bg-slate-950/80 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-24 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
                <button
                  onClick={onNavigateToLibrary}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                >
                  Jelajahi
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Novel Baru</span>
            </button>
            <button
              onClick={onNavigateToLibrary}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
            >
              <span>Buka Seluruh Koleksi</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Koleksi */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Koleksi</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalCount}</span>
            <span className="text-xs text-slate-400">novel</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Tersimpan di perpustakaan</p>
        </div>

        {/* Sedang Dibaca */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sedang Dibaca</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">{readingNovels.length}</span>
            <span className="text-xs text-slate-400">aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Dalam proses pembacaan</p>
        </div>

        {/* Selesai Dibaca */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Selesai Dibaca</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{finishedNovels.length}</span>
            <span className="text-xs text-slate-400">tamat</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Koleksi yang telah selesai</p>
        </div>

        {/* Novel Favorit */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Novel Favorit</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500/20" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">{favoriteNovels.length}</span>
            <span className="text-xs text-slate-400">disukai</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Ditandai bintang & hati</p>
        </div>
      </div>

      {/* Hero "Lanjutkan Membaca" Section */}
      {currentlyReadingHero && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-800/40 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
                Lanjutkan Membaca Terakhir
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Terakhir dibuka: {currentlyReadingHero.lastReadAt ? new Date(currentlyReadingHero.lastReadAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Hari ini'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={currentlyReadingHero.coverUrl}
              alt={currentlyReadingHero.title}
              className="w-24 sm:w-28 aspect-[3/4] object-cover rounded-xl shadow-lg border border-purple-500/30 shrink-0"
            />
            <div className="flex-1 w-full flex flex-col justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-200 border border-purple-700/50 mb-1">
                  {currentlyReadingHero.genre}
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {currentlyReadingHero.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Penulis: <span className="text-slate-300 font-medium">{currentlyReadingHero.author}</span>
                </p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 max-w-2xl">
                  {currentlyReadingHero.synopsis}
                </p>
              </div>

              {/* Progress Bar & Page info */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Progres Bacaan</span>
                  <span className="font-mono font-semibold text-purple-300">
                    {currentlyReadingHero.progressPercentage}% • Halaman {currentlyReadingHero.currentPage} dari {currentlyReadingHero.totalPages}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-400 rounded-full"
                    style={{ width: `${Math.max(5, currentlyReadingHero.progressPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                <button
                  onClick={() => onReadNovel(currentlyReadingHero)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-900/30 transition-all hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lanjutkan ke Hal. {currentlyReadingHero.currentPage || 1}</span>
                </button>
                <button
                  onClick={() => onSelectNovel(currentlyReadingHero)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Koleksi Novel Terbaru */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Koleksi Novel Terbaru
            </h2>
          </div>
          <button
            onClick={onNavigateToLibrary}
            className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Lihat Semua ({novels.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentNovels.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Belum ada novel di koleksimu.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium"
            >
              Tambah Novel Pertamamu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentNovels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                onSelect={onSelectNovel}
                onRead={onReadNovel}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {/* Rekomendasi Novel dari Koleksi Pribadi */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Rekomendasi dari Koleksi Pribadimu
              </h2>
              <p className="text-xs text-slate-400">
                Dipilih secara cerdas untuk menemani waktu luang membaca Anda
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendedNovels.map((novel) => (
            <div
              key={`rec-${novel.id}`}
              onClick={() => onSelectNovel(novel)}
              className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex gap-3 group"
            >
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-16 h-24 object-cover rounded-lg shrink-0 shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                    {novel.genre.split('&')[0]}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-purple-300 line-clamp-1 mt-1">
                    {novel.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {novel.author}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">
                    {novel.totalPages} halaman
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReadNovel(novel);
                    }}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    Mulai <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
