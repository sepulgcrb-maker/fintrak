import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  AlertCircle, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { ProfitAndLossReport, BalanceSheetReport, CashFlowReport } from '../../utils/financialCalculations';
import { FinancialSubTab } from './FinancialSubNav';

export interface FinancialDashboardViewProps {
  pnl?: ProfitAndLossReport;
  current?: ProfitAndLossReport;
  balanceSheet?: BalanceSheetReport;
  cashFlow?: CashFlowReport;
  periodLabel?: string;
  onNavigateSubTab?: (tab: FinancialSubTab) => void;
  onNavigateTab?: (tab: FinancialSubTab) => void;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({
  pnl,
  current,
  balanceSheet,
  cashFlow,
  periodLabel = 'Bulan Ini',
  onNavigateSubTab,
  onNavigateTab,
}) => {
  const { accounts, receivables, payables, transactions } = useApp();
  const navigate = onNavigateSubTab || onNavigateTab || (() => {});

  const activePnl = pnl || current;
  const growth = activePnl?.growthPercentage ?? 0;

  // Summary Metrics
  const totalIncome = activePnl?.grossRevenue ?? 0;
  const totalExpense = (activePnl?.cogs ?? 0) + (activePnl?.operatingExpenses ?? 0) + (activePnl?.otherExpenses ?? 0);
  const netProfit = activePnl?.netProfit ?? 0;
  const isProfitable = netProfit >= 0;

  const totalCashBank = accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0);
  const totalReceivables = receivables.reduce((sum, r) => sum + Math.max(0, r.amount - r.paidAmount), 0);
  const totalPayables = payables.reduce((sum, p) => sum + Math.max(0, p.amount - p.paidAmount), 0);

  // Chart Data: Pendapatan vs Biaya (Last 6 Months or Category Breakdown)
  const incomeVsExpenseData = [
    { name: 'Pendapatan', amount: totalIncome, fill: '#10b981' },
    { name: 'Harga Pokok (HPP)', amount: activePnl?.cogs ?? 0, fill: '#f59e0b' },
    { name: 'Beban Operasional', amount: activePnl?.operatingExpenses ?? 0, fill: '#ef4444' },
    { name: 'Beban Lain-lain', amount: activePnl?.otherExpenses ?? 0, fill: '#64748b' },
    { name: 'Laba Bersih', amount: Math.max(0, netProfit), fill: '#3b82f6' },
  ];

  // Cash Flow Trend Data (Operasional, Investasi, Pendanaan)
  const cashFlowTrendData = [
    {
      name: 'Operasional',
      Masuk: cashFlow?.operatingCashIn ?? 0,
      Keluar: cashFlow?.operatingCashOut ?? 0,
      Net: cashFlow?.netOperatingCashFlow ?? 0
    },
    {
      name: 'Investasi',
      Masuk: cashFlow?.investingCashIn ?? 0,
      Keluar: cashFlow?.investingCashOut ?? 0,
      Net: cashFlow?.netInvestingCashFlow ?? 0
    },
    {
      name: 'Pendanaan',
      Masuk: cashFlow?.financingCashIn ?? 0,
      Keluar: cashFlow?.financingCashOut ?? 0,
      Net: cashFlow?.netFinancingCashFlow ?? 0
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* 6 Key Financial Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Pemasukan */}
        <div 
          onClick={() => navigate('pnl')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pemasukan</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalIncome)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>{growth >= 0 ? `+${growth}%` : `${growth}%`} vs lalu</span>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div 
          onClick={() => navigate('pnl')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengeluaran</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalExpense)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            HPP + Operasional + Lainnya
          </div>
        </div>

        {/* Laba/Rugi Berjalan */}
        <div 
          onClick={() => navigate('pnl')}
          className={`p-3.5 rounded-xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs ${
            isProfitable 
              ? 'border-emerald-200 dark:border-emerald-900/60' 
              : 'border-rose-200 dark:border-rose-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Laba/Rugi Berjalan</span>
            <div className={`p-1.5 rounded-lg ${
              isProfitable 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-base sm:text-lg font-bold ${
            isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatRupiah(netProfit)}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {isProfitable ? 'Laba Bersih Surplus' : 'Defisit / Rugi Bersih'}
          </div>
        </div>

        {/* Saldo Kas & Bank */}
        <div 
          onClick={() => navigate('bank')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Kas & Bank</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalCashBank)}
          </div>
          <div className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {accounts.filter(a => a.isActive).length} Rekening Aktif
          </div>
        </div>

        {/* Piutang (AR) */}
        <div 
          onClick={() => navigate('receivables')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Piutang (AR)</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalReceivables)}
          </div>
          <div className="mt-1 text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
            {receivables.filter(r => r.status !== 'paid').length} Invoice Belum Lunas
          </div>
        </div>

        {/* Hutang (AP) */}
        <div 
          onClick={() => navigate('payables')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Hutang (AP)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalPayables)}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {payables.filter(p => p.status !== 'paid').length} Faktur Harus Dibayar
          </div>
        </div>
      </div>

      {/* Persamaan Akuntansi & Status Keuangan */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
              Persamaan Akuntansi Neraca
            </div>
            <div className="text-sm font-semibold">
              Total Aset ({formatRupiah(balanceSheet?.totalAssets ?? 0)}) = Kewajiban ({formatRupiah(balanceSheet?.liabilities?.total ?? 0)}) + Ekuitas ({formatRupiah(balanceSheet?.equity?.total ?? 0)})
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('balance')}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Lihat Neraca
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grafik Pendapatan vs Biaya */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Grafik Pendapatan vs Biaya
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Struktur biaya operasional vs pemasukan
              </p>
            </div>
            <button
              onClick={() => navigate('pnl')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Detail Laba Rugi →
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis 
                  type="number" 
                  tickFormatter={(val) => `Rp${val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : val}`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10 }}
                  width={110}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Nominal']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Cash Flow (Arus Kas) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Grafik Arus Kas (Cash Flow)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kas Masuk vs Kas Keluar per aktivitas
              </p>
            </div>
            <button
              onClick={() => navigate('cashflow')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Detail Arus Kas →
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis 
                  tickFormatter={(val) => `Rp${val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : val}`}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access to Accounting Modules */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Akses Cepat Modul Pembukuan
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => navigate('assets')}
            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              🏢 Aset Tetap
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Penyusutan & Nilai Buku</div>
          </button>

          <button
            onClick={() => navigate('ledger')}
            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              📖 Buku Besar
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Mutasi debit/kredit COA</div>
          </button>

          <button
            onClick={() => navigate('journal')}
            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              📝 Jurnal Umum
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Otomatisasi transaksi</div>
          </button>

          <button
            onClick={() => navigate('tax')}
            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              🏛️ Laporan Pajak
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">PPN 11% & PPh UMKM</div>
          </button>

          <button
            onClick={() => navigate('closing')}
            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              🔒 Tutup Buku & Audit
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Kunci periode akuntansi</div>
          </button>
        </div>
      </div>
    </div>
  );
};
