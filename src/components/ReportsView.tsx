import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export const ReportsView: React.FC = () => {
  const { transactions } = useApp();
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  const completedTxs = transactions.filter(t => t.status === 'completed');

  const totalIncome = completedTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = completedTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Pie chart data by category
  const expenseByCategory = completedTxs
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Bar chart comparison data
  const comparisonData = [
    {
      name: 'Ringkasan',
      Pemasukan: totalIncome,
      Pengeluaran: totalExpense,
    },
  ];

  return (
    <div className="space-y-4 px-4 py-3 pb-24">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Laporan Keuangan
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analisis arus kas masuk, keluar, dan distribusi pengeluaran
        </p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs gap-1">
        {[
          { id: 'today', label: 'Hari Ini' },
          { id: 'week', label: 'Minggu Ini' },
          { id: 'month', label: 'Bulan Ini' },
          { id: 'year', label: 'Tahun Ini' },
          { id: 'all', label: 'Semua' },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setFilterPeriod(p.id as any)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              filterPeriod === p.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Total Masuk
          </div>
          <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600 truncate">
            {formatRupiah(totalIncome)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Keluar
          </div>
          <p className="text-xs sm:text-sm font-bold font-mono text-rose-600 truncate">
            {formatRupiah(totalExpense)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold mb-1">
            <Wallet className="w-3.5 h-3.5" /> Saldo Bersih
          </div>
          <p className="text-xs sm:text-sm font-bold font-mono text-indigo-600 truncate">
            {formatRupiah(netSavings)}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
          Komparasi Pemasukan vs Pengeluaran
        </h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `Rp${(v / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value: any) => formatRupiah(Number(value) || 0)}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
            Distribusi Kategori Pengeluaran
          </h4>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatRupiah(Number(value) || 0)}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{entry.name}:</span>
                <span className="font-mono text-slate-900 dark:text-white ml-auto">{formatRupiah(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportsView;
