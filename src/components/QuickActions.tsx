import React from 'react';
import { 
  PlusCircle, 
  MinusCircle, 
  CalendarPlus, 
  Receipt, 
  Send, 
  BarChart3, 
  Wallet, 
  CalendarDays,
  Sparkles,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickActions: React.FC = () => {
  const { openAddModal, openTransferModal, setActiveTab } = useApp();

  const actions = [
    {
      id: 'btn-menu-financial',
      label: 'Lap. Keuangan',
      icon: FileSpreadsheet,
      color: 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none group-hover:bg-emerald-700',
      onClick: () => setActiveTab('financial'),
    },
    {
      id: 'btn-menu-income',
      label: 'Tambah Masuk',
      icon: PlusCircle,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
      onClick: () => openAddModal('income', 'completed'),
    },
    {
      id: 'btn-menu-expense',
      label: 'Tambah Keluar',
      icon: MinusCircle,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
      onClick: () => openAddModal('expense', 'completed'),
    },
    {
      id: 'btn-menu-wallets',
      label: 'Kelola Dompet',
      icon: Wallet,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
      onClick: () => setActiveTab('accounts'),
    },
    {
      id: 'btn-menu-transfer',
      label: 'Transfer Saldo',
      icon: Send,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
      onClick: () => openTransferModal(),
    },
    {
      id: 'btn-menu-history',
      label: 'Riwayat Mutasi',
      icon: Receipt,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
      onClick: () => setActiveTab('transactions'),
    },
    {
      id: 'btn-menu-reports',
      label: 'Statistik',
      icon: BarChart3,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
      onClick: () => setActiveTab('reports'),
    },
    {
      id: 'btn-menu-calendar',
      label: 'Kalender',
      icon: CalendarDays,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
      onClick: () => setActiveTab('calendar'),
    },
  ];

  return (
    <div className="px-4 py-2 space-y-2.5">
      {/* FinAI Smart Card Banner */}
      <div 
        onClick={() => setActiveTab('finai')}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.99] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-xs">FinAI Financial Advisor</p>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">Gemini</span>
            </div>
            <p className="text-[10px] text-emerald-100">Tanyakan analisis laporan, budget & tips menabung</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold bg-white text-emerald-900 px-3 py-1.5 rounded-xl shadow-xs shrink-0">
          <span>Tanya</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {actions.map(act => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              id={act.id}
              onClick={act.onClick}
              className="flex flex-col items-center text-center group focus:outline-none transition-transform active:scale-95 cursor-pointer"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-all duration-200 shadow-xs ${act.color}`}>
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default QuickActions;
