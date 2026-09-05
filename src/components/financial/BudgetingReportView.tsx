import React from 'react';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Settings 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { calculateBudgetRealization } from '../../utils/financialCalculations';

export const BudgetingReportView: React.FC = () => {
  const { categoryBudgets, transactions } = useApp();
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  const budgetItems = calculateBudgetRealization(categoryBudgets, transactions, currentMonthPrefix);

  const totalBudget = budgetItems.reduce((s, b) => s + b.budget, 0);
  const totalRealization = budgetItems.reduce((s, b) => s + b.realization, 0);
  const totalVariance = totalBudget - totalRealization;
  const overallPercentage = totalBudget > 0 ? Math.round((totalRealization / totalBudget) * 100) : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Pagu Anggaran</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalBudget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Bulan {currentMonthPrefix}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Realisasi Pengeluaran</div>
          <div className={`text-base sm:text-lg font-bold ${overallPercentage >= 100 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {formatRupiah(totalRealization)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{overallPercentage}% terserap</div>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-xs ${
          totalVariance >= 0 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
        }`}>
          <div className="text-xs font-semibold mb-1 opacity-80">Sisa Kuota Anggaran</div>
          <div className={`text-base sm:text-lg font-bold ${totalVariance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
            {formatRupiah(totalVariance)}
          </div>
          <div className="text-[11px] opacity-75 mt-1">
            {totalVariance >= 0 ? 'Dalam batas aman pengeluaran' : 'Over-budget / Melebihi plafon'}
          </div>
        </div>
      </div>

      {/* Progress Bar Overall */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
        <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-white">
          <span>Tingkat Penyerapan Anggaran Bulan Berjalan</span>
          <span className={overallPercentage >= 100 ? 'text-rose-600' : 'text-emerald-600'}>
            {overallPercentage}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              overallPercentage >= 100 ? 'bg-rose-500' : overallPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Budget Realization Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white">
          <span className="uppercase tracking-wider">Perbandingan Anggaran vs Realisasi per Kategori</span>
          <span className="text-slate-400 font-normal">Auto-update transaksi riil</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {budgetItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic">Belum ada anggaran kategori aktif.</div>
          ) : (
            budgetItems.map((item, idx) => (
              <div key={idx} className="p-3.5 space-y-2 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                    <span>{item.category}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      item.status === 'over' 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        : item.status === 'warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}>
                      {item.status === 'over' ? 'OVER BUDGET' : item.status === 'warning' ? 'WASPADA' : 'AMAN'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatRupiah(item.realization)}
                    </span>
                    <span className="text-slate-400 ml-1">/ {formatRupiah(item.budget)}</span>
                  </div>
                </div>

                {/* Progress bar per item */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        item.status === 'over' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Terpakai: {item.percentage}%</span>
                    <span>Selisih: {formatRupiah(item.variance)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
