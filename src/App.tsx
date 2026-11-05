import React, { useState, useEffect, useCallback } from 'react';
import { Novel, ReadingStatus, UserProfile } from './types/novel';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { LibraryView } from './components/LibraryView';
import { NovelDetailModal } from './components/NovelDetailModal';
import { AddEditNovelModal } from './components/AddEditNovelModal';
import { DigitalReaderModal } from './components/DigitalReaderModal';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { ProfileModal } from './components/ProfileModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [readingNovel, setReadingNovel] = useState<Novel | null>(null);
  const [readingChapterIndex, setReadingChapterIndex] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [isFirebaseGuideOpen, setIsFirebaseGuideOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reload novels from persistent storage
  const reloadData = useCallback(() => {
    const list = StorageService.getNovels();
    setNovels(list);
    setUserProfile(StorageService.getUserProfile());

    // Update selectedNovel reference if currently open
    setSelectedNovel((curr) => {
      if (!curr) return null;
      return list.find((n) => n.id === curr.id) || null;
    });

    // Update readingNovel reference if currently reading
    setReadingNovel((curr) => {
      if (!curr) return null;
      return list.find((n) => n.id === curr.id) || null;
    });
  }, []);

  useEffect(() => {
    reloadData();

    // Listen to local storage changes across tabs
    const handleStorageChange = () => reloadData();
    window.addEventListener('novelvault_storage_updated', handleStorageChange);
    window.addEventListener('novelvault_profile_updated', handleStorageChange);
    return () => {
      window.removeEventListener('novelvault_storage_updated', handleStorageChange);
      window.removeEventListener('novelvault_profile_updated', handleStorageChange);
    };
  }, [reloadData]);

  // Handle adding or updating novel
  const handleSaveNovel = (
    novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt' | 'progressPercentage'>,
    editId?: string
  ) => {
    try {
      if (editId) {
        const updated = StorageService.updateNovel(editId, novelData);
        if (updated) {
          showToast(`Novel "${updated.title}" berhasil diperbarui!`, 'success');
        }
      } else {
        const created = StorageService.addNovel(novelData);
        showToast(`Novel "${created.title}" berhasil ditambahkan ke perpustakaan!`, 'success');
      }
      reloadData();
      setEditingNovel(null);
    } catch {
      showToast('Gagal menyimpan data novel.', 'error');
    }
  };

  // Handle deleting novel
  const handleDeleteNovel = (id: string) => {
    const novel = novels.find((n) => n.id === id);
    const success = StorageService.deleteNovel(id);
    if (success) {
      showToast(`Novel "${novel?.title || ''}" telah dihapus dari koleksi.`, 'info');
      reloadData();
      setSelectedNovel(null);
    } else {
      showToast('Gagal menghapus novel.', 'error');
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const novel = novels.find((n) => n.id === id);
    if (!novel) return;

    const isFavNow = StorageService.toggleFavorite(id);
    showToast(
      isFavNow
        ? `"${novel.title}" ditambahkan ke Novel Favorit! ❤️`
        : `"${novel.title}" dihapus dari favorit.`,
      'info'
    );
    reloadData();
  };

  // Handle reading status change
  const handleUpdateStatus = (id: string, status: ReadingStatus) => {
    const novel = novels.find((n) => n.id === id);
    if (!novel) return;

    let newCurrentPage = novel.currentPage;
    if (status === 'selesai') {
      newCurrentPage = novel.totalPages;
    } else if (status === 'belum_dibaca') {
      newCurrentPage = 0;
    } else if (status === 'sedang_dibaca' && novel.currentPage === 0) {
      newCurrentPage = 1;
    }

    StorageService.updateNovel(id, { status, currentPage: newCurrentPage });
    const statusLabel =
      status === 'selesai'
        ? 'Selesai Dibaca'
        : status === 'sedang_dibaca'
        ? 'Sedang Dibaca'
        : 'Belum Dibaca';
    showToast(`Status "${novel.title}" diubah menjadi: ${statusLabel}`, 'success');
    reloadData();
  };

  // Handle reading progress update
  const handleUpdateProgress = (id: string, page: number) => {
    StorageService.updateProgress(id, page);
    reloadData();
  };

  // Handle novel finished from reader
  const handleMarkFinished = (id: string) => {
    const novel = novels.find((n) => n.id === id);
    if (!novel) return;
    StorageService.updateNovel(id, {
      status: 'selesai',
      currentPage: novel.totalPages
    });
    showToast(`Hebat! Anda telah menyelesaikan novel "${novel.title}"! 🎉`, 'success');
    reloadData();
  };

  // Handle adding notes
  const handleAddNote = (novelId: string, text: string, page: number) => {
    StorageService.addNote(novelId, text, page);
    showToast('Catatan membaca berhasil disimpan!', 'success');
    reloadData();
  };

  // Launch Digital Reader
  const handleOpenReader = (novel: Novel, chapterIndex: number = 0) => {
    setReadingNovel(novel);
    setReadingChapterIndex(chapterIndex);
    setSelectedNovel(null); // Close detail modal if open
  };

  // Edit from detail modal
  const handleOpenEdit = (novel: Novel) => {
    setEditingNovel(novel);
    setSelectedNovel(null);
    setIsAddModalOpen(true);
  };

  // Counts for navigation badges
  const counts = {
    total: novels.length,
    reading: novels.filter((n) => n.status === 'sedang_dibaca').length,
    finished: novels.filter((n) => n.status === 'selesai').length,
    favorites: novels.filter((n) => n.isFavorite).length
  };

  // If user searched in top navbar, navigate to library view to see results
  const handleSearchNavbar = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && activeTab !== 'library' && activeTab !== 'dashboard') {
      setActiveTab('library');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchNavbar}
        onOpenAddModal={() => {
          setEditingNovel(null);
          setIsAddModalOpen(true);
        }}
        onOpenFirebaseGuide={() => setIsFirebaseGuideOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        userProfile={userProfile}
        totalNovels={novels.length}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Navigation Sidebar & Mobile Bottom Navigation */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'firebase') {
              setIsFirebaseGuideOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          counts={counts}
        />

        {/* Dynamic Main View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              novels={novels}
              userProfile={userProfile}
              onSelectNovel={(novel) => setSelectedNovel(novel)}
              onReadNovel={(novel) => handleOpenReader(novel)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingNovel(null);
                setIsAddModalOpen(true);
              }}
              onNavigateToLibrary={() => setActiveTab('library')}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              novels={novels}
              onSelectNovel={(novel) => setSelectedNovel(novel)}
              onReadNovel={(novel) => handleOpenReader(novel)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingNovel(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === 'reading' && (
            <LibraryView
              novels={novels}
              onSelectNovel={(novel) => setSelectedNovel(novel)}
              onReadNovel={(novel) => handleOpenReader(novel)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingNovel(null);
                setIsAddModalOpen(true);
              }}
              initialStatusFilter="sedang_dibaca"
            />
          )}

          {activeTab === 'finished' && (
            <LibraryView
              novels={novels}
              onSelectNovel={(novel) => setSelectedNovel(novel)}
              onReadNovel={(novel) => handleOpenReader(novel)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingNovel(null);
                setIsAddModalOpen(true);
              }}
              initialStatusFilter="selesai"
            />
          )}

          {activeTab === 'favorites' && (
            <LibraryView
              novels={novels}
              onSelectNovel={(novel) => setSelectedNovel(novel)}
              onReadNovel={(novel) => handleOpenReader(novel)}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingNovel(null);
                setIsAddModalOpen(true);
              }}
              initialFavoritesOnly={true}
            />
          )}
        </main>
      </div>

      {/* Novel Detail Modal */}
      <NovelDetailModal
        novel={selectedNovel}
        isOpen={!!selectedNovel}
        onClose={() => setSelectedNovel(null)}
        onRead={(novel, chapterIndex) => handleOpenReader(novel, chapterIndex)}
        onEdit={(novel) => handleOpenEdit(novel)}
        onDelete={handleDeleteNovel}
        onToggleFavorite={handleToggleFavorite}
        onUpdateStatus={handleUpdateStatus}
        onUpdateProgress={handleUpdateProgress}
        onAddNote={handleAddNote}
      />

      {/* Add / Edit Novel Modal */}
      <AddEditNovelModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingNovel(null);
        }}
        onSave={handleSaveNovel}
        editingNovel={editingNovel}
      />

      {/* Digital Reader Fullscreen Modal */}
      <DigitalReaderModal
        novel={readingNovel}
        isOpen={!!readingNovel}
        initialChapterIndex={readingChapterIndex}
        onClose={() => setReadingNovel(null)}
        onUpdateProgress={handleUpdateProgress}
        onMarkFinished={handleMarkFinished}
      />

      {/* Firebase & Multi-Device Sync Guide Modal */}
      <FirebaseGuideModal
        isOpen={isFirebaseGuideOpen}
        onClose={() => setIsFirebaseGuideOpen(false)}
        onRestoreSuccess={reloadData}
        onShowToast={showToast}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        novels={novels}
        onUpdateProfile={(profile) => {
          setUserProfile(profile);
          reloadData();
        }}
        onShowToast={showToast}
      />

      {/* Floating Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
