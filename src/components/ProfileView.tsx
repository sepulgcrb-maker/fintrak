import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Building, 
  Phone, 
  Mail, 
  Moon, 
  Sun, 
  EyeOff, 
  Eye, 
  Download, 
  RotateCcw,
  CheckCircle2,
  Sliders,
  BellRing,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryBudgetModal } from './CategoryBudgetModal';

export const ProfileView: React.FC = () => {
  const { user, updateUserProfile, toggleDarkMode, toggleHideBalance, categoryAlerts, setActiveTab } = useApp();
  const [name, setName] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isCategoryBudgetModalOpen, setIsCategoryBudgetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      businessName,
      phone,
      email,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      user: JSON.parse(localStorage.getItem('fintrack_user') || '{}'),
      accounts: JSON.parse(localStorage.getItem('fintrack_accounts') || '[]'),
      transactions: JSON.parse(localStorage.getItem('fintrack_transactions') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 px-4 py-3 pb-24">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profil & Pengaturan Akun
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kelola profil pengguna, preferensi bisnis, dan privasi
        </p>
      </div>

      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-blue-600 flex-shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-900"
          />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            {user.name}
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-slate-500">{user.businessName || 'Pengguna FinTrack'}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            FinTrack Mobile Banking Pro
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Informasi Pribadi & Bisnis</h4>
        
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Bisnis / Perusahaan</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer mt-2"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <span>Simpan Perubahan</span>
          )}
        </button>
      </form>

      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Preferensi Tampilan & Keamanan</h4>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Mode Gelap (Dark Theme)</p>
            <p className="text-[11px] text-slate-400">Gunakan palet warna gelap untuk kenyamanan mata</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {user.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Sembunyikan Saldo Utama</p>
            <p className="text-[11px] text-slate-400">Sensor saldo dengan karakter bullet (••••)</p>
          </div>
          <button
            onClick={toggleHideBalance}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {user.hideBalance ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Pengaturan Rekening & Dompet</p>
            <p className="text-[11px] text-slate-400">Atur kartu bank, e-wallet, tema warna, dan koreksi saldo</p>
          </div>
          <button
            onClick={() => setActiveTab('accounts')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 font-semibold cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Kelola</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Ekspor Data Keuangan</p>
            <p className="text-[11px] text-slate-400">Download backup mutasi dan rekening dalam format JSON</p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {/* Category Budget Threshold Alerts Box */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Batas Anggaran Kategori (Threshold Alerts)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Atur limit maksimal per pos pengeluaran bulanan dan dapatkan notifikasi otomatis dari FinAI saat melebihi batas.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${categoryAlerts.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {categoryAlerts.length > 0 
                ? `🚨 ${categoryAlerts.length} Kategori Melebihi Batas Anggaran` 
                : '🟢 Semua Kategori Dalam Batas Aman'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCategoryBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Atur Limit Kategori</span>
          </button>
        </div>
      </div>

      <CategoryBudgetModal 
        isOpen={isCategoryBudgetModalOpen}
        onClose={() => setIsCategoryBudgetModalOpen(false)}
      />
    </div>
  );
};
export default ProfileView;
