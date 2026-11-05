export type ReadingStatus = 'belum_dibaca' | 'sedang_dibaca' | 'selesai';

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface ReadingNote {
  id: string;
  page: number;
  chapterTitle?: string;
  text: string;
  createdAt: string;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  synopsis: string;
  coverUrl: string;
  fileType: 'pdf' | 'epub' | 'text';
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 data URL for uploaded files
  status: ReadingStatus;
  isFavorite: boolean;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  lastReadAt?: string;
  chapters?: Chapter[];
  notes?: ReadingNote[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  readingGoal: number; // Novels per year
  joinedDate: string;
}

export type ReaderTheme = 'dark' | 'light' | 'sepia' | 'midnight';
export type ReaderFontFamily = 'serif' | 'sans' | 'mono';
