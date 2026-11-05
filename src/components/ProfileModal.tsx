import React, { useState } from 'react';
import { UserProfile, Novel } from '../types/novel';
import { StorageService } from '../services/storage';
import {
  X,
  User,
  Mail,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Sparkles,
  TrendingUp,
  Save
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  novels: Novel[];
  onUpdateProfile: (profile: UserProfile) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  novels,
  onUpdateProfile,
  onShowToast
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [goal, setGoal] = useState<number>(userProfile.readingGoal || 24);

  if (!isOpen) return null;

  const finishedCount = novels.filter((n) => n.status === 'selesai').length;
  const readingCount = novels.filter((n) => n.status === 'sedang_dibaca').length;
  const goalPercent = Math.min(100, Math.round((finishedCount / goal) * 100));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      email: email.trim(),
      readingGoal: Math.max(1, goal)
    };

    StorageService.saveUserProfile(updated);
    onUpdateProfile(updated);
    onShowToast('Profil dan target membaca berhasil diperbarui!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Profil Pengguna</h2>
              <p className="text-xs text-slate-400">Pengaturan akun pembaca NOVELVAULT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Avatar and Welcome Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-950 border border-purple-900/30">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg"
            />
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/40">
                Kolektor Aktif
              </span>
              <h3 className="text-base font-bold text-white mt-1">{userProfile.name}</h3>
              <p className="text-xs text-slate-400">Bergabung sejak {userProfile.joinedDate}</p>
            </div>
          </div>

          {/* Reading Statistics Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Koleksi</span>
              <p className="text-xl font-extrabold text-white mt-1">{novels.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Sedang Dibaca</span>
              <p className="text-xl font-extrabold text-amber-300 mt-1">{readingCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Selesai</span>
              <p className="text-xl font-extrabold text-emerald-300 mt-1">{finishedCount}</p>
            </div>
          </div>

          {/* Goal Progress bar */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Target Membaca Tahun 2026
              </span>
              <span className="font-mono text-purple-300 font-bold">
                {finishedCount} dari {goal} novel ({goalPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-sm text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 text-sm text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Novel per Tahun (Target Membaca)
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full bg-slate-950 text-sm text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
