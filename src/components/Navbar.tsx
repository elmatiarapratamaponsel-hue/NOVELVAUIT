import React from 'react';
import { BookMarked, Search, Plus, CloudOff, User, Sparkles, Database } from 'lucide-react';
import { UserProfile } from '../types/novel';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenFirebaseGuide: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile;
  totalNovels: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenFirebaseGuide,
  onOpenProfile,
  userProfile,
  totalNovels
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                NOVELVAULT
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Library
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Perpustakaan Novel Digital Pribadi
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari judul novel, penulis, atau genre..."
              className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Storage & Supabase Status Indicator */}
          <button
            onClick={onOpenFirebaseGuide}
            title="Koneksi Database Supabase Cloud Aktif (ewvjlektdtsbjvhkgzcn.supabase.co)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-500/50 text-xs text-slate-200 transition-colors shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline font-semibold text-emerald-300">Supabase Cloud</span>
            <span className="md:hidden font-semibold text-emerald-300">Supabase</span>
            <Database className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
          </button>

          {/* Add Novel Primary Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/30 hover:shadow-purple-700/40 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Tambah Novel</span>
            <span className="xs:hidden">Tambah</span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            title={`Profil: ${userProfile.name}`}
            className="relative p-0.5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 hover:scale-105 transition-transform"
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-slate-950"
            />
          </button>
        </div>
      </div>

      {/* Mobile Search Input Bar */}
      <div className="mt-2.5 sm:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari novel, penulis..."
            className="w-full bg-slate-900/90 text-xs text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
    </header>
  );
};
