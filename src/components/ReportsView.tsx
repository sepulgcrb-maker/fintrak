import React, { useState, useMemo } from 'react';
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
  Wallet,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileDown,
  FileText,
  Check,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { CategoryBudgetModal } from './CategoryBudgetModal';
import { ExportPdfModal } from './ExportPdfModal';
import { exportFinancialReportPDF } from '../utils/pdfExport';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export const ReportsView: React.FC = () => {
  const { user, accounts, transactions, categoryBudgets, categoryAlerts, setActiveTab } = useApp();
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [isCategoryBudgetModalOpen, setIsCategoryBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [quickExportSuccess, setQuickExportSuccess] = useState(false);

  // Dynamic date filtering based on selected period
  const { filteredCompletedTxs, periodStartDate, periodEndDate, periodDisplayLabel } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const curMonthPrefix = todayStr.slice(0, 7);
    const curYearPrefix = todayStr.slice(0, 4);

    let list = transactions.filter(t => t.status === 'completed');
    let start: string | undefined;
    let end: string | undefined = todayStr;
    let label = 'Bulan Ini';

    if (filterPeriod === 'today') {
      start = todayStr;
      label = `Hari Ini (${formatDateIndonesian(todayStr)})`;
      list = list.filter(t => t.transactionDate === todayStr);
    } else if (filterPeriod === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      start = d.toISOString().slice(0, 10);
      label = '7 Hari Terakhir';
      list = list.filter(t => t.transactionDate >= start!);
    } else if (filterPeriod === 'month') {
      start = `${curMonthPrefix}-01`;
      label = `Bulan Ini (${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`;
      list = list.filter(t => t.transactionDate.startsWith(curMonthPrefix));
    } else if (filterPeriod === 'year') {
      start = `${curYearPrefix}-01-01`;
      label = `Tahun Ini (${curYearPrefix})`;
      list = list.filter(t => t.transactionDate.startsWith(curYearPrefix));
    } else {
      label = 'Seluruh Waktu';
      start = undefined;
      end = undefined;
    }

    return {
      filteredCompletedTxs: list,
      periodStartDate: start,
      periodEndDate: end,
      periodDisplayLabel: label,
    };
  }, [transactions, filterPeriod]);

  const totalIncome = filteredCompletedTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredCompletedTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Pie chart data by category
  const expenseByCategory = filteredCompletedTxs
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData: { name: string; value: number }[] = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  // Bar chart comparison data
  const comparisonData = [
    {
      name: filterPeriod === 'all' ? 'Semua Riwayat' : periodDisplayLabel.split(' (')[0],
      Pemasukan: totalIncome,
      Pengeluaran: totalExpense,
    },
  ];

  // Quick 1-click export based on currently active filter
  const handleQuickExportCurrentPeriod = () => {
    try {
      exportFinancialReportPDF({
        user,
        accounts,
        transactions,
        categoryBudgets,
        periodTitle: `Laporan Keuangan & Riwayat Transaksi - ${periodDisplayLabel}`,
        startDate: periodStartDate,
        endDate: periodEndDate,
        includeAccountsSummary: true,
        includeCategoryBreakdown: true,
        includeReceiptNumber: true,
      });

      setQuickExportSuccess(true);
      setTimeout(() => setQuickExportSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3 pb-24">
      {/* Header with Title and Action Buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Laporan Keuangan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analisis arus kas masuk, keluar, dan ekspor riwayat transaksi ke PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Export to PDF Button */}
          <button
            id="export-pdf-main-btn"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Ekspor Riwayat Transaksi ke Format Dokumen PDF"
          >
            <FileDown className="w-4 h-4" />
            <span>Ekspor PDF</span>
          </button>

          <button
            onClick={() => setIsCategoryBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Batas Kategori</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
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

      {/* Summary KPI Cards */}
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

      {/* PDF Export Action Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-500/20 dark:border-emerald-800/40 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Ekspor Riwayat Transaksi ke PDF
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  {filteredCompletedTxs.length} Transaksi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cetak dokumen formal lengkap dengan Nomor Resi, rincian mutasi, dan analisis anggaran.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleQuickExportCurrentPeriod}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Unduh langsung data periode yang sedang tampil"
            >
              {quickExportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PDF Terunduh!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh ({filterPeriod === 'all' ? 'Semua' : 'Periode Ini'})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Opsi Lengkap</span>
            </button>
          </div>
        </div>
      </div>


      {/* Category Budget Threshold Alerts Card */}
      {categoryAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Peringatan: {categoryAlerts.length} Kategori Melebihi Batas Anggaran Bulanan
            </h4>
            <button
              onClick={() => setActiveTab('finai')}
              className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Tanya FinAI
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {categoryAlerts.map(alert => (
              <div key={alert.category} className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{alert.category}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Pengeluaran: <strong className="text-rose-600 font-mono">{formatRupiah(alert.currentSpent)}</strong> / Batas: <span className="font-mono">{formatRupiah(alert.threshold)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                    {alert.percentage}%
                  </span>
                  <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                    +{formatRupiah(alert.exceededAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Distribusi Kategori Pengeluaran
            </h4>
            <span className="text-[11px] text-slate-400">
              {pieData.length} Kategori Aktif
            </span>
          </div>
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
            {pieData.map((entry, index) => {
              const catBudget = Array.isArray(categoryBudgets) 
                ? categoryBudgets.find(b => b.category === entry.name)
                : undefined;
              const isOver = catBudget?.enabled && entry.value > catBudget.monthlyThreshold;
              return (
                <div key={entry.name} className="flex flex-col p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{entry.name}</span>
                    <span className="font-mono text-slate-900 dark:text-white ml-auto font-semibold">{formatRupiah(entry.value)}</span>
                  </div>
                  {catBudget?.enabled && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Limit: {formatRupiah(catBudget.monthlyThreshold)}</span>
                      <span className={isOver ? 'text-rose-500 font-bold' : 'text-emerald-500 font-medium'}>
                        {Math.round((entry.value / catBudget.monthlyThreshold) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions in Period Preview Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Riwayat Transaksi ({periodDisplayLabel})
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {filteredCompletedTxs.length} transaksi selesai tercatat
            </p>
          </div>

          {filteredCompletedTxs.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <FileDown className="w-3 h-3" />
              <span>Ekspor PDF</span>
            </button>
          )}
        </div>

        {filteredCompletedTxs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Tidak ada riwayat transaksi pada periode {periodDisplayLabel.toLowerCase()}.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCompletedTxs.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">
                      {tx.category} • {tx.transactionDate}
                    </p>
                  </div>
                </div>

                <p className={`font-mono font-bold text-xs ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                </p>
              </div>
            ))}

            {filteredCompletedTxs.length > 5 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileDown className="w-3 h-3" />
                  <span>Lihat dan ekspor seluruh {filteredCompletedTxs.length} transaksi ke file PDF</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CategoryBudgetModal 
        isOpen={isCategoryBudgetModalOpen}
        onClose={() => setIsCategoryBudgetModalOpen(false)}
      />

      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultPeriod={filterPeriod}
      />
    </div>
  );
};
export default ReportsView;

