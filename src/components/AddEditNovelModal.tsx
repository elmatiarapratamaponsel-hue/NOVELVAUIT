import React, { useState, useEffect, useRef } from 'react';
import { Novel, ReadingStatus } from '../types/novel';
import { GENRE_LIST, PRESET_COVERS } from '../data/sampleNovels';
import { storeFileInIndexedDB } from '../services/storage';
import {
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Link as LinkIcon,
  Check,
  BookOpen,
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';

interface AddEditNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage'>, editId?: string) => void;
  editingNovel?: Novel | null;
}

export const AddEditNovelModal: React.FC<AddEditNovelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNovel
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fantasi & Petualangan');
  const [customGenre, setCustomGenre] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [synopsis, setSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [coverOption, setCoverOption] = useState<'upload' | 'url' | 'preset'>('preset');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  
  // File upload state
  const [fileType, setFileType] = useState<'pdf' | 'epub' | 'text'>('pdf');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  
  // Reading status & pages
  const [status, setStatus] = useState<ReadingStatus>('belum_dibaca');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(250);
  const [sampleChapterText, setSampleChapterText] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNovel) {
      setTitle(editingNovel.title);
      setAuthor(editingNovel.author);
      if (GENRE_LIST.includes(editingNovel.genre)) {
        setGenre(editingNovel.genre);
      } else {
        setGenre('Lainnya');
        setCustomGenre(editingNovel.genre);
      }
      setYear(editingNovel.year);
      setSynopsis(editingNovel.synopsis);
      setCoverUrl(editingNovel.coverUrl);
      setCoverUrlInput(editingNovel.coverUrl);
      setFileType(editingNovel.fileType);
      setFileName(editingNovel.fileName || '');
      setFileSize(editingNovel.fileSize || '');
      setFileData(editingNovel.fileData);
      setStatus(editingNovel.status);
      setCurrentPage(editingNovel.currentPage);
      setTotalPages(editingNovel.totalPages);
      if (editingNovel.chapters && editingNovel.chapters.length > 0) {
        setSampleChapterText(editingNovel.chapters[0].content);
      }
    } else {
      // Reset form
      setTitle('');
      setAuthor('');
      setGenre('Fantasi & Petualangan');
      setCustomGenre('');
      setYear(new Date().getFullYear());
      setSynopsis('');
      setCoverUrl(PRESET_COVERS[0].url);
      setCoverOption('preset');
      setCoverUrlInput('');
      setFileType('pdf');
      setFileName('');
      setFileSize('');
      setFileData(undefined);
      setStatus('belum_dibaca');
      setCurrentPage(0);
      setTotalPages(280);
      setSampleChapterText('');
      setErrorMsg('');
    }
  }, [editingNovel, isOpen]);

  if (!isOpen) return null;

  // Handle Cover image file upload from user device
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Novel document file upload (PDF / EPUB / TXT)
  const handleNovelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setFileName(name);
    setFileSize(sizeInMB);

    // Determine type
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      setFileType('pdf');
    } else if (lowerName.endsWith('.epub')) {
      setFileType('epub');
    } else {
      setFileType('text');
    }

    // Read file as Data URL / text
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul novel wajib diisi.');
      return;
    }
    if (!author.trim()) {
      setErrorMsg('Nama penulis wajib diisi.');
      return;
    }

    const finalGenre = genre === 'Lainnya' && customGenre.trim() ? customGenre.trim() : genre;
    const finalYear = Number(year) || new Date().getFullYear();
    const finalTotalPages = Math.max(1, Number(totalPages) || 100);
    const finalCurrentPage = Math.min(finalTotalPages, Math.max(0, Number(currentPage) || 0));

    // Prepare chapters if user provided sample chapter text or if existing chapters
    const chapters = editingNovel?.chapters ? [...editingNovel.chapters] : [];
    if (sampleChapterText.trim()) {
      if (chapters.length > 0) {
        chapters[0] = { ...chapters[0], content: sampleChapterText.trim() };
      } else {
        chapters.push({
          id: `chap-${Date.now()}`,
          title: `Bab 1: Awal Mula ${title}`,
          content: sampleChapterText.trim()
        });
      }
    } else if (chapters.length === 0) {
      // Default placeholder chapter if no file uploaded
      chapters.push({
        id: `chap-init`,
        title: `Bab 1: Pembuka Cerita`,
        content: synopsis || 'Belum ada isi naskah untuk bab ini. Anda dapat membaca file dokumen yang telah diunggah atau menambahkan naskah bab novel ini sewaktu-waktu.'
      });
    }

    const novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage'> = {
      title: title.trim(),
      author: author.trim(),
      genre: finalGenre,
      year: finalYear,
      synopsis: synopsis.trim() || 'Tidak ada sinopsis yang disertakan untuk novel ini.',
      coverUrl: coverUrl || PRESET_COVERS[0].url,
      fileType,
      fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.${fileType}`,
      fileSize: fileSize || '1.8 MB',
      fileData,
      status,
      isFavorite: editingNovel ? editingNovel.isFavorite : false,
      currentPage: finalCurrentPage,
      totalPages: finalTotalPages,
      chapters,
      notes: editingNovel?.notes || []
    };

    onSave(novelData, editingNovel?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingNovel ? 'Edit Data Novel' : 'Tambah Novel ke Perpustakaan'}
              </h2>
              <p className="text-xs text-slate-400">
                Isi data novel dan simpan ke database perpustakaan pribadimu
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

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Informasi Utama */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Informasi Dasar Novel
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Judul Novel */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Judul Novel <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Bumi Manusia, Harry Potter, dll."
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-400 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Nama Penulis */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nama Penulis / Pengarang <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Contoh: Pramoedya Ananta Toer"
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-400 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Tahun Terbit */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tahun Terbit
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="1800"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-slate-950 text-sm text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kategori Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-slate-950 text-sm text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {GENRE_LIST.filter((g) => g !== 'Semua Genre').map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-slate-200">
                      {g}
                    </option>
                  ))}
                  <option value="Lainnya" className="bg-slate-900 text-slate-200">Lainnya (Tulis Sendiri)</option>
                </select>
              </div>

              {/* Custom Genre if 'Lainnya' */}
              {genre === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Genre Kustom
                  </label>
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="Contoh: Cyberpunk, Isekai, Puisi"
                    className="w-full bg-slate-950 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {/* Status Membaca */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Status Membaca
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                  className="w-full bg-slate-950 text-sm text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="belum_dibaca">Belum Dibaca</option>
                  <option value="sedang_dibaca">Sedang Dibaca</option>
                  <option value="selesai">Selesai Dibaca</option>
                </select>
              </div>

              {/* Total Halaman & Halaman Saat Ini */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Total Halaman Buku
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Halaman Terakhir Dibaca
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-slate-950 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Sinopsis */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sinopsis Novel
              </label>
              <textarea
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Tuliskan rangkuman atau sinopsis singkat novel ini..."
                className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-400 p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Section 2: Sampul Novel */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Sampul Buku (Cover)
            </h3>

            {/* Cover Option Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCoverOption('preset')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  coverOption === 'preset'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Pilihan Koleksi Sampul
              </button>
              <button
                type="button"
                onClick={() => setCoverOption('upload')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  coverOption === 'upload'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Upload File dari HP/Laptop
              </button>
              <button
                type="button"
                onClick={() => setCoverOption('url')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  coverOption === 'url'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                URL Gambar Web
              </button>
            </div>

            {/* Option A: Preset Covers */}
            {coverOption === 'preset' && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverUrl(preset.url)}
                    className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                      coverUrl === preset.url
                        ? 'border-purple-500 ring-2 ring-purple-500/30 scale-105'
                        : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    {coverUrl === preset.url && (
                      <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[10px] text-slate-300 py-0.5 px-1 truncate text-center">
                      {preset.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Option B: Upload from device */}
            {coverOption === 'upload' && (
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-purple-500 text-slate-300 text-xs transition-colors"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Pilih Berkas Gambar Sampul</span>
                </button>
                {coverUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={coverUrl}
                      alt="Pratinjau"
                      className="w-12 h-16 object-cover rounded-lg border border-purple-500/40"
                    />
                    <span className="text-xs text-emerald-400">Gambar siap digunakan</span>
                  </div>
                )}
              </div>
            )}

            {/* Option C: Image URL */}
            {coverOption === 'url' && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={coverUrlInput}
                    onChange={(e) => {
                      setCoverUrlInput(e.target.value);
                      if (e.target.value) setCoverUrl(e.target.value);
                    }}
                    placeholder="https://contoh.com/sampul.jpg"
                    className="w-full bg-slate-950 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (coverUrlInput) setCoverUrl(coverUrlInput);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                >
                  Gunakan
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Upload Berkas Novel PDF / EPUB */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Berkas Digital Novel (PDF / EPUB / Naskah)
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Upload File Buku Asli (.pdf, .epub, .txt)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    File akan disimpan ke database lokal agar dapat dibaca di reader
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.epub,.txt"
                    onChange={handleNovelFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{fileName ? 'Ganti File' : 'Pilih File PDF / EPUB'}</span>
                  </button>
                </div>
              </div>

              {fileName && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{fileName}</span>
                    <span className="text-slate-400 text-[11px]">({fileSize})</span>
                  </div>
                  <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                    {fileType}
                  </span>
                </div>
              )}
            </div>

            {/* Optional text content for the digital reader */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Naskah / Cuplikan Bab Pertama (Opsional, untuk dibaca langsung di Digital Reader):
              </label>
              <textarea
                rows={3}
                value={sampleChapterText}
                onChange={(e) => setSampleChapterText(e.target.value)}
                placeholder="Tuliskan atau tempelkan teks bab pertama novel di sini..."
                className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-400 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 font-serif-book"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>{editingNovel ? 'Perbarui Novel' : 'Simpan ke Koleksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
