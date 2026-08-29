import React, { useState, useEffect } from 'react';
import { 
  X, 
  Landmark, 
  Smartphone, 
  Briefcase, 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  Building2, 
  Trash2, 
  Star, 
  Check, 
  AlertTriangle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Account } from '../types';
import { formatRupiah } from '../utils/formatters';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

export const COLOR_PRESETS = [
  { name: 'BCA Blue', gradient: 'from-blue-600 to-indigo-700', bg: 'bg-blue-600' },
  { name: 'Emerald Forest', gradient: 'from-emerald-600 to-teal-700', bg: 'bg-emerald-600' },
  { name: 'GoPay Cyan', gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500' },
  { name: 'Mandiri Gold', gradient: 'from-amber-600 to-yellow-600', bg: 'bg-amber-600' },
  { name: 'Shopee Coral', gradient: 'from-orange-500 to-red-600', bg: 'bg-orange-500' },
  { name: 'Royal Purple', gradient: 'from-purple-600 to-indigo-800', bg: 'bg-purple-600' },
  { name: 'Berry Rose', gradient: 'from-rose-500 to-pink-700', bg: 'bg-rose-500' },
  { name: 'Midnight Onyx', gradient: 'from-slate-800 to-slate-950', bg: 'bg-slate-800' },
];

export const ICON_PRESETS = [
  { id: 'Landmark', name: 'Bank', icon: Landmark },
  { id: 'Smartphone', name: 'E-Wallet', icon: Smartphone },
  { id: 'Briefcase', name: 'Bisnis', icon: Briefcase },
  { id: 'Wallet', name: 'Dompet', icon: Wallet },
  { id: 'CreditCard', name: 'Kartu', icon: CreditCard },
  { id: 'PiggyBank', name: 'Tabungan', icon: PiggyBank },
  { id: 'Building2', name: 'Korporat', icon: Building2 },
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const { 
    accounts, 
    updateAccount, 
    deleteAccount, 
    setDefaultAccount,
    addTransaction
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'balance' | 'appearance'>('details');
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [color, setColor] = useState('from-blue-600 to-indigo-700');
  const [icon, setIcon] = useState('Landmark');
  const [isActive, setIsActive] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  // Balance adjustment state
  const [newBalance, setNewBalance] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [recordAdjustmentAsTx, setRecordAdjustmentAsTx] = useState(true);

  // Delete modal state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');

  useEffect(() => {
    if (account) {
      setName(account.name);
      setAccountNumber(account.accountNumber || '');
      setType(account.type);
      setColor(account.color || 'from-blue-600 to-indigo-700');
      setIcon(account.icon || 'Landmark');
      setIsActive(account.isActive !== false);
      setIsPrimary(!!account.isPrimary);
      setNotes(account.notes || '');
      setNewBalance(account.balance.toString());
      setAdjustmentReason('');
      
      const otherAcc = accounts.find(a => a.id !== account.id);
      if (otherAcc) {
        setTransferTargetId(otherAcc.id);
      }
    }
  }, [account, accounts]);

  if (!isOpen || !account) return null;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateAccount(account.id, {
      name: name.trim(),
      accountNumber: accountNumber.trim() || undefined,
      type,
      color,
      icon,
      isActive,
      notes: notes.trim() || undefined,
    });

    if (isPrimary && !account.isPrimary) {
      setDefaultAccount(account.id);
    }

    onClose();
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBalance = parseInt(newBalance.replace(/[^0-9-]/g, ''), 10);
    if (isNaN(parsedBalance)) return;

    const diff = parsedBalance - account.balance;

    if (diff !== 0 && recordAdjustmentAsTx) {
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      addTransaction({
        accountId: account.id,
        type: diff > 0 ? 'income' : 'expense',
        status: 'completed',
        amount: Math.abs(diff),
        category: 'Lainnya',
        description: adjustmentReason.trim() || `Penyesuaian Saldo ${account.name}`,
        transactionDate: todayStr,
        transactionTime: timeStr,
        notes: `Koreksi saldo dari ${formatRupiah(account.balance)} menjadi ${formatRupiah(parsedBalance)}`,
      });
    } else {
      updateAccount(account.id, { balance: parsedBalance });
    }

    onClose();
  };

  const handleDeleteAccount = () => {
    if (accounts.length <= 1) {
      alert('Anda harus menyisakan minimal satu rekening utama.');
      return;
    }

    deleteAccount(account.id, transferTargetId || undefined);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Rekening
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {account.name}
              </p>
            </div>
          </div>
          <button
            id="close-account-settings-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('details')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'details'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Informasi & Tipe
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('appearance')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'appearance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Warna & Ikon
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('balance')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'balance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Koreksi Saldo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: INFORMASI & TIPE */}
          {activeSubTab === 'details' && (
            <form id="account-details-form" onSubmit={handleSaveDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Rekening / Dompet
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: BCA Payroll, Kas Utama, GoPay"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor Rekening / No. HP
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Contoh: 8291-092-110"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Rekening
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as Account['type'])}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="bank">Bank / Rekening Giro</option>
                    <option value="wallet">E-Wallet (GoPay, OVO, Dana)</option>
                    <option value="business">Kas Bisnis & Operasional</option>
                    <option value="cash">Uang Tunai (Cash)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Contoh: Rekening khusus pencairan invoice klien B2B"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Status & Rekening Utama */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isPrimary ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Rekening Utama (Default)</p>
                      <p className="text-[11px] text-slate-500">Dipilih otomatis saat membuat transaksi baru</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={e => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Status Rekening Aktif</p>
                    <p className="text-[11px] text-slate-500">Hitung saldo rekening ini ke total kekayaan bersih</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Rekening</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: WARNA & IKON */}
          {activeSubTab === 'appearance' && (
            <div className="space-y-5 text-xs">
              {/* Preview Card */}
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Pratinjau Kartu:</p>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-md space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                        {(() => {
                          const IconComp = ICON_PRESETS.find(i => i.id === icon)?.icon || Landmark;
                          return <IconComp className="w-4 h-4" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-bold">{name || 'Nama Rekening'}</h4>
                        <p className="text-[10px] text-white/70">{accountNumber || '8291-092-110'}</p>
                      </div>
                    </div>
                    {isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                        Utama
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/70">Saldo Rekening</p>
                    <p className="text-lg font-extrabold font-mono">{formatRupiah(account.balance)}</p>
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Tema Warna Kartu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COLOR_PRESETS.map(preset => {
                    const isSelected = color === preset.gradient;
                    return (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setColor(preset.gradient)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${preset.bg} flex-shrink-0 shadow-xs`} />
                        <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Presets */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Ikon Rekening
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {ICON_PRESETS.map(preset => {
                    const isSelected = icon === preset.id;
                    const IconComp = preset.icon;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setIcon(preset.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mb-1" />
                        <span className="text-[11px] font-medium">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Terapkan Tampilan
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: KOREKSI SALDO */}
          {activeSubTab === 'balance' && (
            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Koreksi & Penyesuaian Saldo Riil</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                  Gunakan fitur ini jika terdapat selisih antara saldo riil pada buku tabungan/aplikasi bank Anda dengan saldo yang tercatat di FinTrack.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Saldo Tercatat Saat Ini:</span>
                <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {formatRupiah(account.balance)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Saldo Baru / Saldo Riil Sebenarnya (Rp)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    Rp
                  </div>
                  <input
                    type="number"
                    required
                    value={newBalance}
                    onChange={e => setNewBalance(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alasan Penyesuaian (Opsional)
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  placeholder="Contoh: Bunga bank, biaya administrasi, penyesuaian cash opname"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <input
                  type="checkbox"
                  id="recordTxCheckbox"
                  checked={recordAdjustmentAsTx}
                  onChange={e => setRecordAdjustmentAsTx(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="recordTxCheckbox" className="cursor-pointer">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Catat sebagai Transaksi Mutasi</p>
                  <p className="text-[11px] text-slate-500">Mencatat selisih secara otomatis ke riwayat mutasi kas</p>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Perbarui Saldo
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Confirmation Modal for Delete Account */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Hapus Rekening?</h4>
                <p className="text-xs text-slate-500">{account.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Saldo saat ini adalah <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatRupiah(account.balance)}</strong>. 
              {account.balance > 0 ? ' Ke mana sisa saldo ini ingin dialihkan?' : ''}
            </p>

            {account.balance > 0 && accounts.filter(a => a.id !== account.id).length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alihkan Saldo ke:
                </label>
                <select
                  value={transferTargetId}
                  onChange={e => setTransferTargetId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {accounts
                    .filter(a => a.id !== account.id)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatRupiah(a.balance)})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountSettingsModal;
