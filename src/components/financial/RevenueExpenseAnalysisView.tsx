import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  Users, 
  Building2, 
  Package, 
  Layers, 
  Truck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';

interface RevenueExpenseAnalysisViewProps {
  startDate: string;
  endDate: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];

export const RevenueExpenseAnalysisView: React.FC<RevenueExpenseAnalysisViewProps> = ({
  startDate,
  endDate,
}) => {
  const { transactions, receivables, payables } = useApp();
  const [activeSegment, setActiveSegment] = useState<'revenue' | 'expense'>('revenue');
  const [breakdownMode, setBreakdownMode] = useState<'category' | 'entity' | 'branch'>('category');

  const filteredTransactions = transactions.filter(
    t => t.status === 'completed' && t.transactionDate >= startDate && t.transactionDate <= endDate
  );

  // 1. REVENUE BREAKDOWNS
  // By Category
  const revByCategoryMap = new Map<string, number>();
  filteredTransactions
    .filter(t => t.type === 'income')
    .forEach(t => {
      revByCategoryMap.set(t.category, (revByCategoryMap.get(t.category) || 0) + t.amount);
    });
  const revByCategoryData = Array.from(revByCategoryMap.entries()).map(([name, value]) => ({ name, value }));

  // By Customer (from Receivables & Invoices)
  const revByCustomerMap = new Map<string, number>();
  receivables.forEach(r => {
    revByCustomerMap.set(r.customerName, (revByCustomerMap.get(r.customerName) || 0) + r.amount);
  });
  const revByCustomerData = Array.from(revByCustomerMap.entries()).map(([name, value]) => ({ name, value }));

  // By Branch
  const revByBranchMap = new Map<string, number>();
  receivables.forEach(r => {
    const branch = r.branch || 'Kantor Pusat';
    revByBranchMap.set(branch, (revByBranchMap.get(branch) || 0) + r.amount);
  });
  const revByBranchData = Array.from(revByBranchMap.entries()).map(([name, value]) => ({ name, value }));

  // 2. EXPENSE BREAKDOWNS
  // By Category
  const expByCategoryMap = new Map<string, number>();
  filteredTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expByCategoryMap.set(t.category, (expByCategoryMap.get(t.category) || 0) + t.amount);
    });
  const expByCategoryData = Array.from(expByCategoryMap.entries()).map(([name, value]) => ({ name, value }));

  // By Supplier / Vendor (from Payables)
  const expByVendorMap = new Map<string, number>();
  payables.forEach(p => {
    expByVendorMap.set(p.vendorName, (expByVendorMap.get(p.vendorName) || 0) + p.amount);
  });
  const expByVendorData = Array.from(expByVendorMap.entries()).map(([name, value]) => ({ name, value }));

  // By Department
  const expByDeptMap = new Map<string, number>();
  payables.forEach(p => {
    const dept = p.department || 'Operasional Umum';
    expByDeptMap.set(dept, (expByDeptMap.get(dept) || 0) + p.amount);
  });
  const expByDeptData = Array.from(expByDeptMap.entries()).map(([name, value]) => ({ name, value }));

  // Pick data based on mode
  let currentData = activeSegment === 'revenue'
    ? (breakdownMode === 'category' ? revByCategoryData : breakdownMode === 'entity' ? revByCustomerData : revByBranchData)
    : (breakdownMode === 'category' ? expByCategoryData : breakdownMode === 'entity' ? expByVendorData : expByDeptData);

  if (currentData.length === 0) {
    currentData = [{ name: 'Belum ada data', value: 1 }];
  }

  const totalSegmentAmount = currentData.reduce((s, i) => s + (i.name === 'Belum ada data' ? 0 : i.value), 0);

  return (
    <div className="p-4 space-y-4">
      {/* Segment Switcher: Pendapatan vs Pengeluaran */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveSegment('revenue')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSegment === 'revenue'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Analisis Pendapatan (Revenue)
        </button>
        <button
          onClick={() => setActiveSegment('expense')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSegment === 'expense'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Analisis Pengeluaran (Expense)
        </button>
      </div>

      {/* Dimensional Breakdown Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setBreakdownMode('category')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            breakdownMode === 'category'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{activeSegment === 'revenue' ? 'Per Kategori/Produk' : 'Per Kategori Beban'}</span>
        </button>

        <button
          onClick={() => setBreakdownMode('entity')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            breakdownMode === 'entity'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {activeSegment === 'revenue' ? <Users className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
          <span>{activeSegment === 'revenue' ? 'Per Pelanggan' : 'Per Supplier/Vendor'}</span>
        </button>

        <button
          onClick={() => setBreakdownMode('branch')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
            breakdownMode === 'branch'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{activeSegment === 'revenue' ? 'Per Cabang' : 'Per Departemen'}</span>
        </button>
      </div>

      {/* Chart & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-800 dark:text-white mb-2">
            Proporsi Distribusi {activeSegment === 'revenue' ? 'Pendapatan' : 'Beban'}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Nominal']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white">
            <span>Rincian & Kontribusi Persentase</span>
            <span>Total: {formatRupiah(totalSegmentAmount)}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs flex-1 overflow-y-auto max-h-72">
            {currentData.map((item, idx) => {
              const pct = totalSegmentAmount > 0 ? ((item.value / totalSegmentAmount) * 100).toFixed(1) : '0';
              return (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">{formatRupiah(item.value)}</div>
                    <div className="text-[10px] text-slate-400">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            Membantu identifikasi pos penghasil kas utama dan pos pemborosan biaya.
          </div>
        </div>
      </div>
    </div>
  );
};
