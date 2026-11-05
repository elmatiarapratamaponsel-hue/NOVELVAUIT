import React, { useState, useMemo } from 'react';
import { Novel, ReadingStatus } from '../types/novel';
import { NovelCard } from './NovelCard';
import { GENRE_LIST } from '../data/sampleNovels';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  BookOpen,
  Heart,
  Clock,
  CheckCircle2,
  Bookmark,
  RotateCcw
} from 'lucide-react';

interface LibraryViewProps {
  novels: Novel[];
  onSelectNovel: (novel: Novel) => void;
  onReadNovel: (novel: Novel) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onOpenAddModal: () => void;
  initialStatusFilter?: ReadingStatus | 'semua';
  initialFavoritesOnly?: boolean;
}

type SortOption = 'terbaru' | 'terlama' | 'judul_asc' | 'judul_desc' | 'progres_desc';

export const LibraryView: React.FC<LibraryViewProps> = ({
  novels,
  onSelectNovel,
  onReadNovel,
  onToggleFavorite,
  onOpenAddModal,
  initialStatusFilter = 'semua',
  initialFavoritesOnly = false
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'semua'>(initialStatusFilter);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(initialFavoritesOnly);
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter & sort novels
  const filteredNovels = useMemo(() => {
    return novels
      .filter((novel) => {
        // Search filter (title, author, synopsis)
        const matchesSearch =
          search.trim() === '' ||
          novel.title.toLowerCase().includes(search.toLowerCase()) ||
          novel.author.toLowerCase().includes(search.toLowerCase()) ||
          novel.genre.toLowerCase().includes(search.toLowerCase());

        // Genre filter
        const matchesGenre =
          selectedGenre === 'Semua Genre' || novel.genre.toLowerCase().includes(selectedGenre.toLowerCase());

        // Status filter
        const matchesStatus =
          statusFilter === 'semua' || novel.status === statusFilter;

        // Favorites filter
        const matchesFavorite = !favoritesOnly || novel.isFavorite;

        return matchesSearch && matchesGenre && matchesStatus && matchesFavorite;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'terbaru':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'terlama':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'judul_asc':
            return a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
          case 'judul_desc':
            return b.title.localeCompare(a.title, 'id', { sensitivity: 'base' });
          case 'progres_desc':
            return b.progressPercentage - a.progressPercentage;
          default:
            return 0;
        }
      });
  }, [novels, search, selectedGenre, statusFilter, favoritesOnly, sortBy]);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedGenre('Semua Genre');
    setStatusFilter('semua');
    setFavoritesOnly(false);
    setSortBy('terbaru');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {favoritesOnly ? 'Koleksi Novel Favorit' : statusFilter === 'sedang_dibaca' ? 'Novel Sedang Dibaca' : statusFilter === 'selesai' ? 'Arsip Novel Selesai' : 'My Library – Koleksi Novel'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Menampilkan <span className="text-purple-300 font-semibold">{filteredNovels.length}</span> dari {novels.length} novel dalam koleksi pribadimu
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Novel Baru</span>
        </button>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
        {/* Row 1: Search & Sort & View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan judul novel atau nama penulis..."
              className="w-full bg-slate-950/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-700/80 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <label htmlFor="sort-select" className="text-slate-400 hidden sm:inline">Urutkan:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="terbaru" className="bg-slate-900 text-slate-200">Terbaru Ditambahkan</option>
                <option value="terlama" className="bg-slate-900 text-slate-200">Terlama Ditambahkan</option>
                <option value="judul_asc" className="bg-slate-900 text-slate-200">Judul (A - Z)</option>
                <option value="judul_desc" className="bg-slate-900 text-slate-200">Judul (Z - A)</option>
                <option value="progres_desc" className="bg-slate-900 text-slate-200">Progres Tertinggi</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Kotak"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Daftar"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Status Filter Tabs & Genre Filter Chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'semua' && !favoritesOnly
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              Semua ({novels.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('belum_dibaca');
                setFavoritesOnly(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'belum_dibaca'
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              Belum Dibaca ({novels.filter((n) => n.status === 'belum_dibaca').length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('sedang_dibaca');
                setFavoritesOnly(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'sedang_dibaca'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <Clock className="w-3 h-3" />
              Sedang Dibaca ({novels.filter((n) => n.status === 'sedang_dibaca').length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('selesai');
                setFavoritesOnly(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'selesai'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Selesai ({novels.filter((n) => n.status === 'selesai').length})
            </button>
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                favoritesOnly
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <Heart className={`w-3 h-3 ${favoritesOnly ? 'fill-rose-400' : ''}`} />
              Favorit Saja ({novels.filter((n) => n.isFavorite).length})
            </button>
          </div>

          {/* Genre Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-purple-400" /> Genre:
            </span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-slate-950/90 text-xs text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {GENRE_LIST.map((genre) => (
                <option key={genre} value={genre} className="bg-slate-900 text-slate-200">
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Novel Display Grid or List */}
      {filteredNovels.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-950/50 text-purple-400 flex items-center justify-center mx-auto border border-purple-800/40">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Tidak ada novel yang cocok</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Tidak ada novel yang sesuai dengan kata kunci atau filter pencarian Anda. Coba atur ulang filter atau tambahkan novel baru.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Novel Baru</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredNovels.map((novel) => (
            <NovelCard
              key={novel.id}
              novel={novel}
              onSelect={onSelectNovel}
              onRead={onReadNovel}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredNovels.map((novel) => (
            <div
              key={`list-${novel.id}`}
              onClick={() => onSelectNovel(novel)}
              className="group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={novel.coverUrl}
                  alt={novel.title}
                  className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                      {novel.genre}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{novel.year}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {novel.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Penulis: <span className="text-slate-200">{novel.author}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                {/* Progress bar in list */}
                <div className="w-36 text-right space-y-1">
                  <div className="text-xs text-slate-300 font-mono">
                    {novel.progressPercentage}% ({novel.currentPage}/{novel.totalPages} hal)
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      style={{ width: `${Math.max(4, novel.progressPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => onToggleFavorite(e, novel.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      novel.isFavorite
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${novel.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReadNovel(novel);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
