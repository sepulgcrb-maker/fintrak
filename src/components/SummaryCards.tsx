import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CalendarPlus, CalendarClock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';

export const SummaryCards: React.FC = () => {
  const { todayIncome, todayExpense, futureIncome, futureExpense, user, setActiveTab } = useApp();

  const stats = [
    {
      id: 'stat-today-income',
      title: 'Pemasukan Hari Ini',
      amount: todayIncome,
      icon: ArrowDownLeft,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      badge: 'Hari Ini',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      onClick: () => setActiveTab('transactions'),
    },
    {
      id: 'stat-today-expense',
      title: 'Pengeluaran Hari Ini',
      amount: todayExpense,
      icon: ArrowUpRight,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      badge: 'Hari Ini',
      badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
      onClick: () => setActiveTab('transactions'),
    },
    {
      id: 'stat-future-income',
      title: 'Pemasukan Akan Datang',
      amount: futureIncome,
      icon: CalendarPlus,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      badge: 'Menunggu',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      onClick: () => setActiveTab('planning'),
    },
    {
      id: 'stat-future-expense',
      title: 'Pengeluaran Akan Datang',
      amount: futureExpense,
      icon: CalendarClock,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      badge: 'Terjadwal',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      onClick: () => setActiveTab('planning'),
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Ringkasan Keuangan
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              onClick={item.onClick}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${item.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                {item.title}
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight font-mono">
                {user.hideBalance ? '••••••' : formatRupiah(item.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SummaryCards;
