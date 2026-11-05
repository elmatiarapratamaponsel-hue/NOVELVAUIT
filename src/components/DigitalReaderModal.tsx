import React, { useState, useEffect, useRef } from 'react';
import { Novel, ReaderTheme, ReaderFontFamily } from '../types/novel';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Type,
  Sun,
  Moon,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Share2,
  Sliders,
  Download,
  FileText,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface DigitalReaderModalProps {
  novel: Novel | null;
  isOpen: boolean;
  initialChapterIndex?: number;
  onClose: () => void;
  onUpdateProgress: (id: string, page: number) => void;
  onMarkFinished: (id: string) => void;
}

export const DigitalReaderModal: React.FC<DigitalReaderModalProps> = ({
  novel,
  isOpen,
  initialChapterIndex = 0,
  onClose,
  onUpdateProgress,
  onMarkFinished
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(initialChapterIndex);
  const [currentPage, setCurrentPage] = useState<number>(novel ? novel.currentPage || 1 : 1);
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('serif');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Sync state when novel opens
  useEffect(() => {
    if (novel) {
      setCurrentPage(novel.currentPage > 0 ? novel.currentPage : 1);
      setCurrentChapterIndex(initialChapterIndex || 0);
      setShowCelebration(false);
    }
  }, [novel, initialChapterIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, currentChapterIndex, novel]);

  if (!isOpen || !novel) return null;

  const chapters = novel.chapters || [];
  const currentChapter = chapters[currentChapterIndex] || null;
  const progressPercent = Math.min(100, Math.round((currentPage / novel.totalPages) * 100));

  const handleNextPage = () => {
    if (currentPage < novel.totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onUpdateProgress(novel.id, nextPage);

      // Check if moving to next chapter
      if (chapters.length > 0) {
        const pagesPerChapter = Math.ceil(novel.totalPages / chapters.length);
        const nextChapterIdx = Math.min(chapters.length - 1, Math.floor(nextPage / pagesPerChapter));
        if (nextChapterIdx !== currentChapterIndex) {
          setCurrentChapterIndex(nextChapterIdx);
        }
      }

      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      onUpdateProgress(novel.id, prevPage);

      if (chapters.length > 0) {
        const pagesPerChapter = Math.ceil(novel.totalPages / chapters.length);
        const prevChapterIdx = Math.max(0, Math.floor(prevPage / pagesPerChapter));
        if (prevChapterIdx !== currentChapterIndex) {
          setCurrentChapterIndex(prevChapterIdx);
        }
      }

      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSelectChapter = (index: number) => {
    setCurrentChapterIndex(index);
    if (chapters.length > 0) {
      const pagesPerChapter = Math.ceil(novel.totalPages / chapters.length);
      const newPage = Math.min(novel.totalPages, index * pagesPerChapter + 1);
      setCurrentPage(newPage);
      onUpdateProgress(novel.id, newPage);
    }
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = () => {
    setCurrentPage(novel.totalPages);
    onMarkFinished(novel.id);
    setShowCelebration(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Theme styling classes
  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-[#faf9f6]',
          text: 'text-slate-800',
          headerBg: 'bg-white/95 border-b border-slate-200',
          footerBg: 'bg-white/95 border-t border-slate-200',
          card: 'bg-white border-slate-200 text-slate-800',
          accent: 'text-purple-600'
        };
      case 'sepia':
        return {
          bg: 'bg-[#fbf0d9]',
          text: 'text-[#3c2f1f]',
          headerBg: 'bg-[#f4e4c3]/95 border-b border-[#e5ce9e]',
          footerBg: 'bg-[#f4e4c3]/95 border-t border-[#e5ce9e]',
          card: 'bg-[#f4e4c3] border-[#e5ce9e] text-[#3c2f1f]',
          accent: 'text-[#9c592b]'
        };
      case 'midnight':
        return {
          bg: 'bg-[#030712]',
          text: 'text-slate-200',
          headerBg: 'bg-[#030712]/95 border-b border-slate-900',
          footerBg: 'bg-[#030712]/95 border-t border-slate-900',
          card: 'bg-slate-900 border-slate-800 text-slate-100',
          accent: 'text-purple-400'
        };
      case 'dark':
      default:
        return {
          bg: 'bg-[#0b0f19]',
          text: 'text-slate-200',
          headerBg: 'bg-slate-950/95 border-b border-slate-800/80',
          footerBg: 'bg-slate-950/95 border-t border-slate-800/80',
          card: 'bg-slate-900 border-slate-800 text-slate-100',
          accent: 'text-purple-400'
        };
    }
  };

  const themeClasses = getThemeStyles();

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${themeClasses.bg} ${themeClasses.text} transition-colors duration-300 overflow-hidden`}>
      {/* Top Header Navigation Bar */}
      <header className={`sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 ${themeClasses.headerBg} backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Perpustakaan</span>
          </button>

          <div className="hidden md:block">
            <h2 className="text-sm font-bold truncate max-w-xs lg:max-w-md">
              {novel.title}
            </h2>
            <p className="text-[11px] opacity-75">
              oleh {novel.author}
            </p>
          </div>
        </div>

        {/* Chapter Selector Dropdown */}
        {chapters.length > 0 && (
          <div className="flex items-center gap-1 max-w-[200px] sm:max-w-xs">
            <label htmlFor="chapter-select" className="sr-only">Pilih Bab Novel</label>
            <select
              id="chapter-select"
              value={currentChapterIndex}
              onChange={(e) => handleSelectChapter(Number(e.target.value))}
              className="bg-slate-800/60 text-xs px-3 py-1.5 rounded-xl border border-slate-700/50 focus:outline-none cursor-pointer truncate"
            >
              {chapters.map((chap, idx) => (
                <option key={chap.id} value={idx} className="bg-slate-900 text-white">
                  {chap.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Settings Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                showSettings
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/40 hover:bg-slate-800'
              }`}
              title="Pengaturan Tampilan & Tipografi"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Typography Popover */}
            {showSettings && (
              <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-40 text-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Pengaturan Tampilan
                  </span>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Tutup
                  </button>
                </div>

                {/* Font Size */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Ukuran Huruf</span>
                    <span className="font-mono">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                      className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg"
                    />
                    <button
                      onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                      className="px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 block">Tema Membaca</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-2 rounded-xl text-[10px] font-semibold border flex flex-col items-center gap-1 ${
                        theme === 'dark' ? 'border-purple-500 bg-slate-800 text-purple-300' : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Gelap
                    </button>
                    <button
                      onClick={() => setTheme('midnight')}
                      className={`p-2 rounded-xl text-[10px] font-semibold border flex flex-col items-center gap-1 ${
                        theme === 'midnight' ? 'border-purple-500 bg-black text-purple-300' : 'border-slate-800 bg-black text-slate-400'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
                      OLED
                    </button>
                    <button
                      onClick={() => setTheme('sepia')}
                      className={`p-2 rounded-xl text-[10px] font-semibold border flex flex-col items-center gap-1 ${
                        theme === 'sepia' ? 'border-amber-600 bg-[#f4e4c3] text-[#3c2f1f]' : 'border-amber-900/40 bg-[#fbf0d9] text-[#3c2f1f]'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                      Sepia
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-2 rounded-xl text-[10px] font-semibold border flex flex-col items-center gap-1 ${
                        theme === 'light' ? 'border-purple-500 bg-white text-slate-900' : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Terang
                    </button>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 block">Jenis Huruf</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setFontFamily('serif')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-serif ${
                        fontFamily === 'serif' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Serif Lora
                    </button>
                    <button
                      onClick={() => setFontFamily('sans')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-sans ${
                        fontFamily === 'sans' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Sans Modern
                    </button>
                    <button
                      onClick={() => setFontFamily('mono')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono ${
                        fontFamily === 'mono' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Monospace
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-medium transition-colors"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/40 hover:bg-rose-900/40 hover:text-rose-300 text-xs transition-colors"
            title="Tutup Reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar Top Indicator */}
      <div className="w-full h-1 bg-slate-800/50">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Celebration Overlay when Finished */}
      {showCelebration && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Selamat, Anda Telah Menamatkan Novel Ini! 🎉
          </h2>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            "{novel.title}" telah dipindahkan ke daftar <strong className="text-emerald-400">Selesai Dibaca</strong>. Terus pertahankan kebiasaan membaca Anda!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCelebration(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold"
            >
              Tetap di Reader
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg"
            >
              Kembali ke Perpustakaan
            </button>
          </div>
        </div>
      )}

      {/* Main Content Reader Area */}
      <main
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {/* PDF Viewer Banner if format is PDF */}
          {novel.fileType === 'pdf' && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Dokumen Format PDF</h4>
                  <p className="text-[11px] text-slate-400">
                    File: {novel.fileName || 'novel_vault_document.pdf'} ({novel.fileSize || '3.5 MB'})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {novel.fileData && (
                  <a
                    href={novel.fileData}
                    download={novel.fileName || `${novel.title}.pdf`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Chapter Header */}
          <div className="text-center space-y-3 pb-6 border-b border-current/10">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
              Halaman {currentPage} dari {novel.totalPages} • Bab {currentChapterIndex + 1}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif-book">
              {currentChapter ? currentChapter.title : novel.title}
            </h1>
            <p className="text-xs sm:text-sm opacity-60">
              Karya {novel.author}
            </p>
          </div>

          {/* Reading Text */}
          <article
            className={`transition-all duration-200 leading-relaxed font-serif-book ${
              fontFamily === 'serif'
                ? 'font-serif-book'
                : fontFamily === 'sans'
                ? 'font-sans'
                : 'font-mono'
            } ${
              lineHeight === 'loose'
                ? 'leading-loose'
                : lineHeight === 'normal'
                ? 'leading-normal'
                : 'leading-relaxed'
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {currentChapter ? (
              <div className="whitespace-pre-line space-y-4">
                {currentChapter.content}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-purple-400">
                  {novel.synopsis}
                </p>
                <div className="p-6 rounded-2xl bg-purple-900/10 border border-purple-800/30 text-center space-y-3 mt-8">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Naskah Lengkap Siap Dibaca</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Anda sedang berada di halaman <strong className="text-purple-300">{currentPage}</strong>. Progres membaca otomatis tercatat di perpustakaan Anda setiap kali Anda membalik halaman.
                  </p>
                </div>
              </div>
            )}
          </article>

          {/* End of chapter divider & completion button */}
          <div className="pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-current/10">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Halaman Sebelumnya</span>
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= novel.totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold shadow-md transition-all"
              >
                <span>Halaman Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tandai Telah Selesai Dibaca</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Status Footer */}
      <footer className={`px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs ${themeClasses.footerBg} backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs opacity-75">
            Hal. {currentPage} / {novel.totalPages}
          </span>
          <span className="opacity-40">•</span>
          <span className="font-semibold text-purple-400">
            {progressPercent}% selesai
          </span>
        </div>

        {/* Quick page slider */}
        <div className="hidden sm:flex items-center gap-2 w-48">
          <input
            type="range"
            min="1"
            max={novel.totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentPage(val);
              onUpdateProgress(novel.id, val);
            }}
            className="w-full accent-purple-500 h-1 bg-slate-700/60 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30"
            title="Halaman Sebelumnya (Tombol Panah Kiri)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= novel.totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30"
            title="Halaman Berikutnya (Tombol Panah Kanan)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
