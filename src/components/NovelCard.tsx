import React from 'react';
import { Novel } from '../types/novel';
import { Heart, BookOpen, Clock, CheckCircle2, Bookmark, FileText } from 'lucide-react';

interface NovelCardProps {
  novel: Novel;
  onSelect: (novel: Novel) => void;
  onRead: (novel: Novel) => void;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const NovelCard: React.FC<NovelCardProps> = ({
  novel,
  onSelect,
  onRead,
  onToggleFavorite
}) => {
  const getStatusBadge = () => {
    switch (novel.status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      case 'sedang_dibaca':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Sedang Dibaca
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
            <Bookmark className="w-3 h-3" /> Belum Dibaca
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(novel)}
      className="group relative flex flex-col bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={novel.coverUrl}
          alt={`Sampul ${novel.title}`}
          onError={(e) => {
            // Fallback cover if image fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-purple-300 border border-purple-500/30">
            {novel.fileType.toUpperCase()}
          </span>

          {/* Favorite Button */}
          <button
            onClick={(e) => onToggleFavorite(e, novel.id)}
            aria-label={novel.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
              novel.isFavorite
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-900/70 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                novel.isFavorite ? 'fill-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Bottom Cover Info */}
        <div className="absolute bottom-3 inset-x-3 flex flex-col gap-1.5 z-10">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-950/80 text-purple-200 border border-purple-800/40 truncate max-w-[70%]">
              {novel.genre}
            </span>
            <span className="text-xs text-slate-400 font-mono">{novel.year}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1 text-base">
            {novel.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
            <span>oleh</span>
            <span className="text-slate-300 font-medium">{novel.author}</span>
          </p>
        </div>

        {/* Reading Progress */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progres</span>
            <span className="font-mono font-medium text-slate-200">
              {novel.progressPercentage}%{' '}
              <span className="text-slate-500">
                ({novel.currentPage}/{novel.totalPages} hal)
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                novel.status === 'selesai'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${Math.max(4, novel.progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Status & Quick Read Action */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>{getStatusBadge()}</div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(novel);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-500 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Baca</span>
          </button>
        </div>
      </div>
    </div>
  );
};
