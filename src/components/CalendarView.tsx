import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';

export const CalendarView: React.FC = () => {
  const { transactions, openAddModal } = useApp();
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(today.toISOString().split('T')[0]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const dayTransactions = transactions.filter(t => t.transactionDate === selectedDateStr);

  const getDayIndicators = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTxs = transactions.filter(t => t.transactionDate === dateStr);
    
    const hasIncome = dayTxs.some(t => t.type === 'income');
    const hasExpense = dayTxs.some(t => t.type === 'expense');
    const hasScheduled = dayTxs.some(t => t.status === 'scheduled' || t.status === 'pending' || t.status === 'overdue');

    return { hasIncome, hasExpense, hasScheduled };
  };

  return (
    <div className="space-y-4 px-4 py-3 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kalender Keuangan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau jatuh tempo dan jadwal transaksi bulanan
          </p>
        </div>
        <button
          onClick={() => openAddModal('expense', 'scheduled')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Jadwalkan</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {dayNames.map(d => (
            <span key={d} className="font-semibold text-slate-400 dark:text-slate-500 py-1">
              {d}
            </span>
          ))}

          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDateStr;
            const { hasIncome, hasExpense, hasScheduled } = getDayIndicators(dayNum);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasIncome && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>}
                  {hasExpense && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></span>}
                  {hasScheduled && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`}></span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pemasukan</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Pengeluaran</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Terjadwal</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Transaksi Pada {formatDateIndonesian(selectedDateStr)} ({dayTransactions.length})
        </h4>

        {dayTransactions.length === 0 ? (
          <div className="p-5 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Tidak ada transaksi pada tanggal ini.
          </div>
        ) : (
          dayTransactions.map(tx => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</h5>
                  <p className="text-[10px] text-slate-500">{tx.transactionTime} • {tx.category}</p>
                </div>
              </div>
              <p className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default CalendarView;
