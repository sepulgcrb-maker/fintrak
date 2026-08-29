import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  CalendarClock 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';

export const FuturePlanningView: React.FC = () => {
  const { 
    transactions, 
    totalBalance, 
    futureIncome, 
    futureExpense, 
    projectedBalance, 
    markScheduledAsCompleted, 
    openAddModal, 
    user 
  } = useApp();

  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '3m' | '1y'>('30d');

  const scheduledTxs = transactions.filter(t => t.status !== 'completed');

  const getChartData = () => {
    const days = chartPeriod === '7d' ? 7 : chartPeriod === '30d' ? 30 : chartPeriod === '3m' ? 90 : 365;
    const data = [];
    const step = chartPeriod === '7d' ? 1 : chartPeriod === '30d' ? 5 : chartPeriod === '3m' ? 15 : 30;

    for (let i = 0; i <= days; i += step) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const matches = scheduledTxs.filter(t => t.transactionDate <= targetDateStr);
      const inSum = matches.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const outSum = matches.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      const label = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      data.push({
        label,
        saldo: totalBalance + inSum - outSum,
      });
    }
    return data;
  };

  const chartData = getChartData();

  return (
    <div className="space-y-4 px-4 py-3 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Rencana & Prediksi Transaksi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola arus kas masa depan dan forecast saldo otomatis
          </p>
        </div>
        <button
          id="add-scheduled-tx-btn"
          onClick={() => openAddModal('expense', 'scheduled')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Rencana</span>
        </button>
      </div>

      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-900/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Prediksi Saldo Akhir
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 font-semibold border border-indigo-400/20">
            AI Forecast
          </span>
        </div>

        <div className="my-3">
          <p className="text-xs text-slate-400">Estimasi Total Saldo</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono mt-0.5">
            {user.hideBalance ? '••••••••••••' : formatRupiah(projectedBalance)}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-indigo-900/60 text-xs">
          <div>
            <p className="text-[10px] text-slate-400">Saldo Saat Ini</p>
            <p className="font-bold text-slate-200 mt-0.5 font-mono truncate">
              {user.hideBalance ? '••••••' : formatRupiah(totalBalance)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-400">+ Akan Masuk</p>
            <p className="font-bold text-emerald-400 mt-0.5 font-mono truncate">
              {user.hideBalance ? '••••••' : formatRupiah(futureIncome)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-rose-400">- Akan Keluar</p>
            <p className="font-bold text-rose-400 mt-0.5 font-mono truncate">
              {user.hideBalance ? '••••••' : formatRupiah(futureExpense)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Grafik Prediksi Cashflow</h4>
            <p className="text-[11px] text-slate-500">Estimasi pergerakan saldo akumulatif</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            {(['7d', '30d', '3m', '1y'] as const).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  chartPeriod === period
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {period === '7d' ? '7H' : period === '30d' ? '30H' : period === '3m' ? '3B' : '1T'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `Rp${(v / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Estimasi Saldo']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="saldo" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#forecastGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Daftar Rencana Transaksi ({scheduledTxs.length})
        </h4>

        {scheduledTxs.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
            <CalendarClock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tidak ada rencana transaksi</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tekan "Buat Rencana" untuk mencatat transaksi terjadwal</p>
          </div>
        ) : (
          scheduledTxs.map(tx => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                id={`scheduled-tx-${tx.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</h5>
                    <p className="text-[11px] text-slate-500">
                      Tanggal: {formatDateIndonesian(tx.transactionDate)} • {tx.category}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tx.status === 'overdue' 
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                      : tx.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                  }`}>
                    {tx.status === 'overdue' ? 'Jatuh Tempo' : tx.status === 'pending' ? 'Menunggu' : 'Terjadwal'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Nominal Direncanakan</span>
                    <p className={`text-sm font-extrabold font-mono ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </p>
                  </div>

                  <button
                    id={`mark-complete-btn-${tx.id}`}
                    onClick={() => markScheduledAsCompleted(tx.id)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default FuturePlanningView;
