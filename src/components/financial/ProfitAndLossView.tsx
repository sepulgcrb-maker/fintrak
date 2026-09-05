import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Info
} from 'lucide-react';
import { ProfitAndLossReport } from '../../utils/financialCalculations';
import { formatRupiah } from '../../utils/formatters';

export interface ProfitAndLossViewProps {
  pnl?: ProfitAndLossReport;
  current?: ProfitAndLossReport;
  previous?: ProfitAndLossReport;
  periodLabel?: string;
  previousPeriodLabel?: string;
}

export const ProfitAndLossView: React.FC<ProfitAndLossViewProps> = ({
  pnl,
  current,
  previous,
  periodLabel = 'Bulan Ini',
  previousPeriodLabel = 'Periode Sebelumnya',
}) => {
  const activePnl = pnl || current;
  const growthPercentage = activePnl?.growthPercentage ?? 0;
  const netProfit = activePnl?.netProfit ?? 0;
  const grossRevenue = activePnl?.grossRevenue ?? 0;
  const grossProfit = activePnl?.grossProfit ?? 0;
  const cogs = activePnl?.cogs ?? 0;
  const operatingExpenses = activePnl?.operatingExpenses ?? 0;
  const otherExpenses = activePnl?.otherExpenses ?? 0;
  const prevNetProfit = activePnl?.prevNetProfit ?? previous?.netProfit ?? 0;

  const revenueBreakdown = activePnl?.revenueBreakdown || [];
  const cogsBreakdown = activePnl?.cogsBreakdown || [];
  const operatingExpensesBreakdown = activePnl?.operatingExpensesBreakdown || [];
  const otherExpensesBreakdown = activePnl?.otherExpensesBreakdown || [];

  const isPositiveGrowth = growthPercentage >= 0;
  const isNetProfitPositive = netProfit >= 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header Card Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Laporan Laba Rugi Komprehensif
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
              {formatRupiah(netProfit)}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Laba Bersih ({periodLabel}) • {isNetProfitPositive ? 'Surplus Operasional' : 'Defisit Operasional'}
            </p>
          </div>

          {/* Previous Period Comparison Badge */}
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPositiveGrowth ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isPositiveGrowth ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] text-slate-400">vs {previousPeriodLabel}</div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span className={isPositiveGrowth ? 'text-emerald-400' : 'text-rose-400'}>
                  {isPositiveGrowth ? `+${growthPercentage}%` : `${growthPercentage}%`}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  ({formatRupiah(prevNetProfit)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Income Statement Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Struktur Laba Rugi Multi-Step
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Mata Uang: IDR (Rp)</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* 1. PENDAPATAN */}
          <div className="p-3.5 bg-emerald-50/30 dark:bg-emerald-950/10">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                1. PENDAPATAN USAHA (REVENUE)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(grossRevenue)}</span>
            </div>
            <div className="mt-2 pl-6 space-y-1">
              {revenueBreakdown.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Belum ada pendapatan pada periode ini.</div>
              ) : (
                revenueBreakdown.map((rev, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Pendapatan: {rev.category}</span>
                    <span className="font-medium">{formatRupiah(rev.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. HARGA POKOK PENJUALAN (COGS) */}
          <div className="p-3.5">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                2. HARGA POKOK PENJUALAN (HPP / COGS)
              </span>
              <span className="text-amber-600 dark:text-amber-400">({formatRupiah(cogs)})</span>
            </div>
            <div className="mt-2 pl-6 space-y-1">
              {cogsBreakdown.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Tidak ada HPP / pembelian barang dagang tercatat.</div>
              ) : (
                cogsBreakdown.map((c, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>HPP: {c.category}</span>
                    <span className="font-medium">({formatRupiah(c.amount)})</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. LABA KOTOR (GROSS PROFIT) */}
          <div className="p-3.5 bg-slate-100/70 dark:bg-slate-800/70">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>3. LABA KOTOR (GROSS PROFIT = Pendapatan - HPP)</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">{formatRupiah(grossProfit)}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Gross Margin: {grossRevenue > 0 ? `${((grossProfit / grossRevenue) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>

          {/* 4. BEBAN OPERASIONAL */}
          <div className="p-3.5">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-rose-500" />
                4. BEBAN OPERASIONAL (OPERATIONAL EXPENSES)
              </span>
              <span className="text-rose-600 dark:text-rose-400">({formatRupiah(operatingExpenses)})</span>
            </div>
            <div className="mt-2 pl-6 space-y-1">
              {operatingExpensesBreakdown.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Tidak ada beban operasional tercatat pada periode ini.</div>
              ) : (
                operatingExpensesBreakdown.map((op, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Beban {op.category}</span>
                    <span className="font-medium">({formatRupiah(op.amount)})</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. BEBAN LAIN-LAIN */}
          <div className="p-3.5">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-slate-500" />
                5. BEBAN LAIN-LAIN / NON-OPERASIONAL
              </span>
              <span className="text-slate-600 dark:text-slate-400">({formatRupiah(otherExpenses)})</span>
            </div>
            <div className="mt-2 pl-6 space-y-1">
              {otherExpensesBreakdown.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Tidak ada beban lain-lain.</div>
              ) : (
                otherExpensesBreakdown.map((ot, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Beban: {ot.category}</span>
                    <span className="font-medium">({formatRupiah(ot.amount)})</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 6. LABA BERSIH (NET PROFIT) */}
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border-t-2 border-emerald-500">
            <div className="flex items-center justify-between font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              <span>LABA BERSIH BERJALAN (NET PROFIT)</span>
              <span className={isNetProfitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {formatRupiah(netProfit)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Net Profit Margin</span>
              <span className="font-bold">
                {grossRevenue > 0 ? `${((netProfit / grossRevenue) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Catatan Kaki Akuntansi */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Laporan Laba Rugi disusun berdasarkan pengelompokan transaksi riil yang telah selesai (Completed) pada rentang tanggal terpilih, siap diekspor ke PDF/Excel untuk pelaporan keuangan kepada stakeholder dan keperluan perpajakan.
        </p>
      </div>
    </div>
  );
};
