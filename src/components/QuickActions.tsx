import React from 'react';
import { 
  PlusCircle, 
  MinusCircle, 
  CalendarPlus, 
  Receipt, 
  Send, 
  BarChart3, 
  Wallet, 
  CalendarDays 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickActions: React.FC = () => {
  const { openAddModal, openTransferModal, setActiveTab } = useApp();

  const actions = [
    {
      id: 'btn-menu-income',
      label: 'Tambah Pemasukan',
      icon: PlusCircle,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
      onClick: () => openAddModal('income', 'completed'),
    },
    {
      id: 'btn-menu-expense',
      label: 'Tambah Pengeluaran',
      icon: MinusCircle,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
      onClick: () => openAddModal('expense', 'completed'),
    },
    {
      id: 'btn-menu-scheduled',
      label: 'Akan Datang',
      icon: CalendarPlus,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
      onClick: () => setActiveTab('planning'),
    },
    {
      id: 'btn-menu-history',
      label: 'Riwayat Transaksi',
      icon: Receipt,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
      onClick: () => setActiveTab('transactions'),
    },
    {
      id: 'btn-menu-transfer',
      label: 'Transfer Saldo',
      icon: Send,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
      onClick: () => openTransferModal(),
    },
    {
      id: 'btn-menu-reports',
      label: 'Laporan Keuangan',
      icon: BarChart3,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
      onClick: () => setActiveTab('reports'),
    },
    {
      id: 'btn-menu-accounts',
      label: 'Rekening & Dompet',
      icon: Wallet,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
      onClick: () => setActiveTab('accounts'),
    },
    {
      id: 'btn-menu-calendar',
      label: 'Kalender Keuangan',
      icon: CalendarDays,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
      onClick: () => setActiveTab('calendar'),
    },
  ];

  return (
    <div className="px-4 py-2">
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
