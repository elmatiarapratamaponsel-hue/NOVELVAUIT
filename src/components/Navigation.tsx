import React from 'react';
import {
  LayoutDashboard,
  Library,
  BookOpen,
  CheckCircle2,
  Heart,
  CloudCog,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export type NavTab = 'dashboard' | 'library' | 'reading' | 'finished' | 'favorites' | 'firebase';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  counts: {
    total: number;
    reading: number;
    finished: number;
    favorites: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'library' as NavTab,
      label: 'Koleksi Saya',
      icon: Library,
      badge: counts.total
    },
    {
      id: 'reading' as NavTab,
      label: 'Sedang Dibaca',
      icon: BookOpen,
      badge: counts.reading
    },
    {
      id: 'finished' as NavTab,
      label: 'Selesai Dibaca',
      icon: CheckCircle2,
      badge: counts.finished
    },
    {
      id: 'favorites' as NavTab,
      label: 'Novel Favorit',
      icon: Heart,
      badge: counts.favorites
    },
    {
      id: 'firebase' as NavTab,
      label: 'Sinkron & Cloud',
      icon: CloudCog,
      badge: null
    }
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-slate-950/50 border-r border-slate-800/80 p-4 min-h-[calc(100vh-65px)] justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-purple-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-purple-500/30 text-purple-200 font-semibold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Mini Widget: Reading Goal */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-purple-950/30 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-purple-300">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Target Baca 2026
            </span>
            <span className="font-mono text-emerald-400">
              {counts.finished} / 24
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((counts.finished / 24) * 100))}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {counts.finished >= 12
              ? 'Luar biasa! Target membaca paruh tahun sudah terlampaui.'
              : `${24 - counts.finished} novel lagi untuk mencapai target tahun ini!`}
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 px-2 py-2">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1 truncate max-w-[55px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
