import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  Landmark, 
  Smartphone, 
  Briefcase,
  Wallet,
  CreditCard,
  PiggyBank,
  Building2,
  Sliders,
  Star,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  Eye,
  EyeOff,
  Target,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  MoreVertical,
  PlusCircle,
  Car,
  Plane,
  Shield,
  GraduationCap,
  Home,
  Check,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';
import { Account, SavingsGoal } from '../types';
import AccountSettingsModal, { COLOR_PRESETS, ICON_PRESETS } from './AccountSettingsModal';
import SavingsGoalModal, { GOAL_CATEGORIES } from './SavingsGoalModal';
import AddFundsToGoalModal from './AddFundsToGoalModal';
import { getReceiptNumber } from '../utils/receipt';

export const AccountsView: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    openTransferModal, 
    transactions, 
    user,
    toggleHideBalance,
    savingsGoals,
    openReceiptModal
  } = useApp();

  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Settings modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  // Add account modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('bank');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('from-blue-600 to-indigo-700');
  const [newAccIcon, setNewAccIcon] = useState('Landmark');
  const [newAccNotes, setNewAccNotes] = useState('');

  // Savings Goal modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [goalForFunds, setGoalForFunds] = useState<SavingsGoal | null>(null);

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

    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance('');
    setNewAccNotes('');
    setNewAccColor('from-blue-600 to-indigo-700');
    setNewAccIcon('Landmark');
    setIsAddAccountOpen(false);
  };

  const openSettings = (acc: Account, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAccountToEdit(acc);
    setIsSettingsModalOpen(true);
  };

  // Calculations
  const totalBalance = accounts.filter(a => a.isActive).reduce((sum, a) => sum + a.balance, 0);
  const bankBalance = accounts.filter(a => a.isActive && a.type === 'bank').reduce((sum, a) => sum + a.balance, 0);
  const walletBalance = accounts.filter(a => a.isActive && a.type === 'wallet').reduce((sum, a) => sum + a.balance, 0);
  const cashBalance = accounts.filter(a => a.isActive && (a.type === 'cash' || a.type === 'business')).reduce((sum, a) => sum + a.balance, 0);

  // Total savings goals calculation
  const totalGoalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallGoalProgress = totalGoalTarget > 0 ? Math.min(100, Math.round((totalGoalCurrent / totalGoalTarget) * 100)) : 0;

  const filteredAccounts = accounts.filter(acc => {
    if (filterType === 'all') return true;
    if (filterType === 'bank') return acc.type === 'bank';
    if (filterType === 'wallet') return acc.type === 'wallet';
    if (filterType === 'cash') return acc.type === 'cash' || acc.type === 'business';
    if (filterType === 'inactive') return !acc.isActive;
    return true;
  });

  const activeAccount = accounts.find(a => a.id === selectedAccId) || filteredAccounts[0] || accounts[0];
  const accountTransactions = transactions.filter(t => t.accountId === activeAccount?.id);

  const getAccountIcon = (iconName: string, type: Account['type']) => {
    switch (iconName) {
      case 'Landmark': return Landmark;
      case 'Smartphone': return Smartphone;
      case 'Briefcase': return Briefcase;
      case 'Wallet': return Wallet;
      case 'CreditCard': return CreditCard;
      case 'PiggyBank': return PiggyBank;
      case 'Building2': return Building2;
      default:
        return type === 'bank' ? Landmark : type === 'wallet' ? Smartphone : Briefcase;
    }
  };

  const getGoalCategoryIcon = (catName?: string) => {
    switch (catName) {
      case 'Dana Darurat': return Shield;
      case 'Kendaraan': return Car;
      case 'Liburan': return Plane;
      case 'Gadget': return Smartphone;
      case 'Pendidikan': return GraduationCap;
      case 'Properti': return Home;
      default: return PiggyBank;
    }
  };

  const getDaysLeft = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 px-4 py-3 pb-24 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dompet, Rekening & Target Tabungan
            </h2>
            <button
              onClick={toggleHideBalance}
              title={user.hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              {user.hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola rekening kas, pantau target tabungan impian, dan mutasi saldo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="quick-transfer-btn"
            onClick={() => openTransferModal()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pindah Saldo</span>
          </button>

          <button
            id="add-goal-header-btn"
            onClick={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Target Baru</span>
          </button>

          <button
            id="add-account-btn"
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rekening</span>
          </button>
        </div>
      </div>

      {/* Summary Balance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Semua Kas</p>
          <p className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {user.hideBalance ? '••••••••' : formatRupiah(totalBalance)}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
            {accounts.filter(a => a.isActive).length} Rekening Aktif
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium">Saldo Bank</span>
            <Landmark className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {user.hideBalance ? '••••••••' : formatRupiah(bankBalance)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium">Saldo E-Wallet</span>
            <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <p className="text-sm sm:text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {user.hideBalance ? '••••••••' : formatRupiah(walletBalance)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-medium">Target Tabungan</span>
            <PiggyBank className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-sm sm:text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {user.hideBalance ? '••••••••' : formatRupiah(totalGoalCurrent)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {overallGoalProgress}% dari {formatRupiah(totalGoalTarget)}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: TARGET TABUNGAN (SAVINGS GOALS) WITH PROGRESS BARS               */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Target Tabungan & Impian
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pantau progres dan deadline target dana impian Anda
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Target</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 space-y-2">
            <PiggyBank className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Belum Ada Target Tabungan</p>
            <p className="text-[11px]">Tentukan impian finansial Anda seperti Dana Darurat, Liburan, atau Pembelian Barang.</p>
            <button
              onClick={() => {
                setGoalToEdit(null);
                setIsGoalModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-xs cursor-pointer hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Target Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {savingsGoals.map(goal => {
              const CategoryIcon = getGoalCategoryIcon(goal.category);
              const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              const daysLeft = getDaysLeft(goal.deadline);
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal.id}
                  id={`savings-goal-card-${goal.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon & Action buttons */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${goal.color || 'from-emerald-500 to-teal-700'} text-white shadow-xs`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {goal.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {goal.category || 'Tabungan'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setGoalToEdit(goal);
                            setIsGoalModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Edit Target"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Target Numbers */}
                    <div className="mt-3.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Terkumpul:</span>
                        <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                          {user.hideBalance ? '••••••••' : formatRupiah(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-[11px] text-slate-400 mt-0.5">
                        <span>Target:</span>
                        <span className="font-mono">{formatRupiah(goal.targetAmount)}</span>
                      </div>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                        <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5' : 'text-slate-600 dark:text-slate-300'}>
                          {isCompleted && <Check className="w-3 h-3 text-emerald-500" />}
                          {isCompleted ? 'Tercapai 100%' : `${percent}%`}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {isCompleted ? 'Target Selesai' : `Sisa ${formatRupiah(remaining)}`}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-emerald-500' 
                              : percent > 60 
                                ? 'bg-indigo-500' 
                                : percent > 30 
                                  ? 'bg-blue-500' 
                                  : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Deadline info */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{goal.deadline}</span>
                      </div>
                      <span className={`font-semibold ${daysLeft < 0 ? 'text-rose-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {daysLeft < 0 ? 'Lewat tempo' : daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                      </span>
                    </div>
                  </div>

                  {/* Add Funds Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        setGoalForFunds(goal);
                        setIsAddFundsOpen(true);
                      }}
                      className="w-full py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Setor Dana</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Semua Rekening' },
          { id: 'bank', label: 'Bank' },
          { id: 'wallet', label: 'E-Wallet' },
          { id: 'cash', label: 'Kas & Bisnis' },
          { id: 'inactive', label: 'Nonaktif' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredAccounts.map(acc => {
          const isSelected = acc.id === activeAccount?.id;
          const IconComp = getAccountIcon(acc.icon, acc.type);

          return (
            <div
              key={acc.id}
              id={`account-card-${acc.id}`}
              onClick={() => setSelectedAccId(acc.id)}
              className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all border ${
                isSelected 
                  ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.01]' 
                  : 'hover:shadow-md hover:scale-[1.005]'
              } bg-gradient-to-br ${acc.color || 'from-blue-600 to-indigo-700'} text-white`}
            >
              {/* Top Row: Icon, Name, Type, and Quick Actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md">
                    <IconComp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white tracking-tight">{acc.name}</h4>
                      {acc.isPrimary && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-400/30 text-amber-200 text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Utama
                        </span>
                      )}
                      {!acc.isActive && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-500/30 text-rose-200 text-[10px] font-semibold">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/70 font-mono mt-0.5">
                      {acc.accountNumber || (acc.type === 'bank' ? 'Rekening Bank' : acc.type === 'wallet' ? 'E-Wallet' : 'Kas Tunai')}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => openSettings(acc, e)}
                    className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all cursor-pointer"
                    title="Pengaturan & Edit Rekening"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTransferModal(acc.id);
                    }}
                    className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all cursor-pointer"
                    title="Pindah Saldo / Transfer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="mt-5">
                <p className="text-[11px] text-white/70 uppercase tracking-wider font-medium">Saldo Tersedia</p>
                <h3 className="text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                  {user.hideBalance ? '••••••••' : formatRupiah(acc.balance)}
                </h3>
              </div>

              {/* Bottom Info / Notes */}
              {acc.notes && (
                <p className="text-[10px] text-white/60 mt-3 pt-2 border-t border-white/10 truncate">
                  {acc.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          Tidak ada rekening yang sesuai dengan filter ini.
        </div>
      )}

      {/* Selected Account Details & Transactions History */}
      {activeAccount && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Mutasi Kas: {activeAccount.name}
              </h4>
              <p className="text-xs text-slate-400">
                {accountTransactions.length} transaksi tercatat pada rekening ini
              </p>
            </div>

            <button
              onClick={() => openSettings(activeAccount)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Pengaturan Akun</span>
            </button>
          </div>

          <div className="space-y-2">
            {accountTransactions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Belum ada transaksi mutasi pada rekening ini.
              </div>
            ) : (
              accountTransactions.slice(0, 10).map(tx => {
                const receiptNum = getReceiptNumber(tx);
                return (
                  <div
                    key={tx.id}
                    onClick={() => openReceiptModal(tx)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 dark:text-white">{tx.description}</p>
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {receiptNum}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{tx.category} • {tx.transactionDate}, {tx.transactionTime}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className={`font-mono font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReceiptModal(tx);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 font-semibold"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>Lihat Resi</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: TARGET TABUNGAN (BUAT / EDIT) */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      {/* MODAL: SETOR DANA KE TARGET TABUNGAN */}
      <AddFundsToGoalModal
        isOpen={isAddFundsOpen}
        onClose={() => {
          setIsAddFundsOpen(false);
          setGoalForFunds(null);
        }}
        goal={goalForFunds}
      />

      {/* MODAL: PENGATURAN REKENING */}
      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setAccountToEdit(null);
        }}
        account={accountToEdit}
      />

      {/* MODAL: TAMBAH REKENING BARU */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Rekening Baru</h3>
            
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Rekening / Dompet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank BCA Bisnis, Dana Operasional, Kas Toko"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor Rekening / No. HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 8291-092-110"
                    value={newAccNumber}
                    onChange={e => setNewAccNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipe Rekening
                  </label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as Account['type'])}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Warna Kartu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setNewAccColor(preset.gradient)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        newAccColor === preset.gradient
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${preset.bg}`} />
                      <span className="text-[10px] font-medium text-slate-800 dark:text-slate-200 truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_PRESETS.map(preset => {
                    const IconComp = preset.icon;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setNewAccIcon(preset.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${
                          newAccIcon === preset.id
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-0.5" />
                        <span className="text-[10px]">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan kegunaan akun"
                  value={newAccNotes}
                  onChange={e => setNewAccNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountsView;
