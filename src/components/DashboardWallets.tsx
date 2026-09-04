import React, { useState } from 'react';
import { 
  Wallet, 
  Landmark, 
  Smartphone, 
  Briefcase, 
  CreditCard, 
  PiggyBank, 
  Building2, 
  Plus, 
  Sliders, 
  Send, 
  ArrowRight, 
  Star, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRightLeft,
  X,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Account } from '../types';
import { formatRupiah } from '../utils/formatters';
import AccountSettingsModal, { COLOR_PRESETS, ICON_PRESETS } from './AccountSettingsModal';

// Indonesian popular preset templates for quick 1-tap addition
const WALLET_PRESETS = [
  { name: 'BCA', type: 'bank' as const, icon: 'Landmark', color: 'from-blue-600 to-indigo-700' },
  { name: 'Mandiri', type: 'bank' as const, icon: 'Landmark', color: 'from-amber-600 to-yellow-600' },
  { name: 'BRI', type: 'bank' as const, icon: 'Landmark', color: 'from-emerald-600 to-teal-700' },
  { name: 'BNI', type: 'bank' as const, icon: 'Landmark', color: 'from-cyan-500 to-blue-600' },
  { name: 'GoPay', type: 'wallet' as const, icon: 'Smartphone', color: 'from-cyan-500 to-blue-600' },
  { name: 'OVO', type: 'wallet' as const, icon: 'Smartphone', color: 'from-purple-600 to-indigo-800' },
  { name: 'DANA', type: 'wallet' as const, icon: 'Smartphone', color: 'from-blue-600 to-indigo-700' },
  { name: 'ShopeePay', type: 'wallet' as const, icon: 'Smartphone', color: 'from-orange-500 to-red-600' },
  { name: 'Kas Tunai', type: 'cash' as const, icon: 'Wallet', color: 'from-emerald-600 to-teal-700' },
  { name: 'Bisnis', type: 'business' as const, icon: 'Briefcase', color: 'from-slate-800 to-slate-950' },
];

export const DashboardWallets: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    openTransferModal, 
    user, 
    setActiveTab 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'bank' | 'wallet' | 'cash'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings / Edit Modal state
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Add Account Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('bank');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('from-blue-600 to-indigo-700');
  const [newAccIcon, setNewAccIcon] = useState('Landmark');
  const [newAccNotes, setNewAccNotes] = useState('');

  // Icon resolver
  const getAccountIcon = (iconName?: string, type?: Account['type']) => {
    switch (iconName) {
      case 'Landmark': return Landmark;
      case 'Smartphone': return Smartphone;
      case 'Briefcase': return Briefcase;
      case 'Wallet': return Wallet;
      case 'CreditCard': return CreditCard;
      case 'PiggyBank': return PiggyBank;
      case 'Building2': return Building2;
      default:
        if (type === 'bank') return Landmark;
        if (type === 'wallet') return Smartphone;
        if (type === 'cash') return Wallet;
        if (type === 'business') return Briefcase;
        return Landmark;
    }
  };

  const handleCopyNumber = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!acc.accountNumber) return;
    navigator.clipboard.writeText(acc.accountNumber);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setAccountToEdit(acc);
    setIsSettingsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof WALLET_PRESETS[0]) => {
    setNewAccName(preset.name);
    setNewAccType(preset.type);
    setNewAccIcon(preset.icon);
    setNewAccColor(preset.color);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    addAccount({
      name: newAccName.trim(),
      accountNumber: newAccNumber.trim() || undefined,
      type: newAccType,
      balance: parseInt(newAccBalance.replace(/[^0-9]/g, ''), 10) || 0,
      color: newAccColor,
      icon: newAccIcon,
      isActive: true,
      notes: newAccNotes.trim() || undefined,
      isPrimary: accounts.length === 0,
    });

    // Reset Form
    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance('');
    setNewAccNotes('');
    setNewAccColor('from-blue-600 to-indigo-700');
    setNewAccIcon('Landmark');
    setIsAddModalOpen(false);
  };

  // Filtered accounts
  const filteredAccounts = accounts.filter(a => {
    if (!a.isActive) return false;
    if (activeFilter === 'bank') return a.type === 'bank';
    if (activeFilter === 'wallet') return a.type === 'wallet';
    if (activeFilter === 'cash') return a.type === 'cash' || a.type === 'business';
    return true;
  });

  const totalFilteredBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="px-4 py-2 space-y-3">
      {/* Header with Title and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dompet & Rekening
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                {filteredAccounts.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Kelola saldo rekening bank, e-wallet, dan kas tunai
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="dashboard-transfer-btn"
            type="button"
            onClick={() => openTransferModal()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Transfer Antar Rekening"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">Transfer</span>
          </button>

          <button
            id="dashboard-add-account-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Tambah Rekening atau Dompet Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>

          <button
            id="dashboard-view-all-accounts-btn"
            type="button"
            onClick={() => setActiveTab('accounts')}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Buka Manajemen Rekening Lengkap"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: 'all', label: 'Semua Akun' },
          { id: 'bank', label: 'Bank' },
          { id: 'wallet', label: 'E-Wallet' },
          { id: 'cash', label: 'Kas & Bisnis' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto text-[10px] text-slate-400 font-mono pl-2 shrink-0">
          Total: <span className="font-bold text-slate-700 dark:text-slate-300">{user.hideBalance ? '••••••' : formatRupiah(totalFilteredBalance)}</span>
        </div>
      </div>

      {/* Account Cards Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-4 px-4 snap-x no-scrollbar">
        {filteredAccounts.map(acc => {
          const IconComp = getAccountIcon(acc.icon, acc.type);
          const isCopied = copiedId === acc.id;

          return (
            <div
              key={acc.id}
              id={`dashboard-account-${acc.id}`}
              onClick={() => setActiveTab('accounts')}
              className={`w-64 sm:w-72 shrink-0 snap-start relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br ${acc.color || 'from-blue-600 to-indigo-700'} text-white shadow-md shadow-slate-950/10 border border-white/10 hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between group`}
            >
              {/* Top Row: Icon, Name, Type, and Quick Actions */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-white/15 backdrop-blur-md shadow-xs">
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">
                          {acc.name}
                        </h4>
                        {acc.isPrimary && (
                          <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-400/30 text-amber-200 text-[9px] font-bold">
                            <Star className="w-2 h-2 fill-current" />
                            Utama
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/70 uppercase font-medium">
                        {acc.type === 'bank' ? 'Bank' : acc.type === 'wallet' ? 'E-Wallet' : acc.type === 'cash' ? 'Kas Tunai' : 'Bisnis'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Card Action Buttons: Settings & Transfer */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTransferModal(acc.id);
                      }}
                      className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-colors cursor-pointer"
                      title="Transfer dari akun ini"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => openEdit(acc, e)}
                      className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-colors cursor-pointer"
                      title="Pengaturan & Edit Akun"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Balance */}
                <div className="mt-4">
                  <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                    Saldo
                  </p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                    {user.hideBalance ? '••••••••' : formatRupiah(acc.balance)}
                  </h3>
                </div>
              </div>

              {/* Bottom Row: Account Number / Identifier with Copy Button */}
              <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-white/80 font-mono truncate max-w-[170px]">
                  <span>{acc.accountNumber || (acc.type === 'bank' ? 'Rekening Pribadi' : 'Dompet Digital')}</span>
                </div>

                {acc.accountNumber && (
                  <button
                    type="button"
                    onClick={(e) => handleCopyNumber(acc, e)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shrink-0"
                    title="Salin Nomor Akun"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-300" />
                        <span className="text-[9px] font-bold text-emerald-300">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span className="text-[9px]">Salin</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Quick Add New Account Card in Carousel */}
        <div
          id="dashboard-add-account-card"
          onClick={() => setIsAddModalOpen(true)}
          className="w-48 sm:w-56 shrink-0 snap-start rounded-3xl p-4 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Tambah Akun Baru
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Bank, E-Wallet, atau Kas
          </p>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Tambah Rekening / Dompet
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pencatatan saldo terpisah untuk Bank, E-Wallet, atau Kas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAccount} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Quick Indonesian Presets */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pilih Cepat Akun Populer
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {WALLET_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        newAccName === preset.name
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nama Akun / Rekening <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Prioritas, GoPay, Dompet Harian"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tipe Akun
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'bank', label: 'Bank' },
                    { id: 'wallet', label: 'E-Wallet' },
                    { id: 'cash', label: 'Kas Tunai' },
                    { id: 'business', label: 'Bisnis' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewAccType(t.id as any)}
                      className={`py-2 px-2 rounded-xl font-semibold text-center border transition-all cursor-pointer text-xs ${
                        newAccType === t.id
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number & Initial Balance */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    No. Rekening / No. HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 8820192831"
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Saldo Awal (Rp)
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={newAccBalance}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setNewAccBalance(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Color Gradient Theme Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tema Warna Kartu
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setNewAccColor(preset.gradient)}
                      className={`h-9 rounded-xl bg-gradient-to-br ${preset.gradient} flex items-center justify-center transition-transform cursor-pointer ${
                        newAccColor === preset.gradient ? 'ring-2 ring-emerald-500 ring-offset-2 scale-105 shadow-sm' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      {newAccColor === preset.gradient && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pilihan Ikon
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {ICON_PRESETS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewAccIcon(item.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          newAccIcon === item.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800'
                        }`}
                        title={item.name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Live Preview */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pratinjau Kartu Rekening
                </label>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${newAccColor} text-white shadow-sm flex items-center justify-between`}>
                  <div>
                    <h4 className="font-bold text-sm">{newAccName || 'Nama Akun'}</h4>
                    <p className="text-[10px] text-white/70 font-mono mt-0.5">
                      {newAccNumber || 'No. Rekening / ID'}
                    </p>
                    <p className="font-mono font-bold text-base mt-2">
                      Rp {newAccBalance || '0'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                    {(() => {
                      const IconPreview = getAccountIcon(newAccIcon, newAccType);
                      return <IconPreview className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Settings / Edit Modal */}
      {isSettingsModalOpen && accountToEdit && (
        <AccountSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            setAccountToEdit(null);
          }}
          account={accountToEdit}
        />
      )}
    </div>
  );
};

export default DashboardWallets;
