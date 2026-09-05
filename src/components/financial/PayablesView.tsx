import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Trash2,
  Building 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payable } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface PayablesViewProps {
  onOpenAddModal: () => void;
  onOpenPayModal: (payable: Payable) => void;
}

export const PayablesView: React.FC<PayablesViewProps> = ({
  onOpenAddModal,
  onOpenPayModal,
}) => {
  const { payables, deletePayable } = useApp();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'unpaid' | 'partial' | 'paid' | 'overdue'>('ALL');

  const today = new Date().toISOString().split('T')[0];

  const processedPayables = payables.map(p => {
    const outstanding = Math.max(0, p.amount - p.paidAmount);
    const isOverdue = p.status !== 'paid' && p.dueDate < today;
    
    const dueTime = new Date(p.dueDate).getTime();
    const todayTime = new Date(today).getTime();
    const daysDiff = Math.floor((todayTime - dueTime) / (1000 * 60 * 60 * 24));

    return {
      ...p,
      outstanding,
      isOverdue,
      daysDiff,
    };
  });

  const filtered = processedPayables.filter(p => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'overdue') return p.isOverdue;
    return p.status === filterStatus;
  });

  const totalPayable = processedPayables.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = processedPayables.reduce((s, p) => s + p.outstanding, 0);
  const totalOverdue = processedPayables.filter(p => p.isOverdue).reduce((s, p) => s + p.outstanding, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Kewajiban Tagihan</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalPayable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{payables.length} Faktur Supplier/Vendor</div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 shadow-xs">
          <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold mb-1">Sisa Hutang Harus Dibayar</div>
          <div className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300">
            {formatRupiah(totalOutstanding)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Outstanding kewajiban kas</div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 shadow-xs">
          <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold mb-1">Hutang Jatuh Tempo</div>
          <div className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-300">
            {formatRupiah(totalOverdue)}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Prioritas pembayaran segera</div>
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'ALL' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Semua ({payables.length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'unpaid' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setFilterStatus('partial')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'partial' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Sebagian
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'overdue' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Jatuh Tempo
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'paid' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Lunas
          </button>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Faktur Hutang</span>
        </button>
      </div>

      {/* Bill List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Tidak ada faktur hutang dengan filter ini.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {p.billNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {p.vendorName}
                  </span>
                  {p.department && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {p.department}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'paid' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : p.isOverdue
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {p.status === 'paid' ? 'LUNAS' : p.isOverdue ? `JATUH TEMPO (+${p.daysDiff}h)` : p.status === 'partial' ? 'SEBAGIAN' : 'BELUM DIBAYAR'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Tagihan: {p.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Jatuh Tempo: {p.dueDate}
                  </span>
                  {p.notes && <span className="text-slate-400 italic">• {p.notes}</span>}
                </div>
              </div>

              {/* Financial Status & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Total: {formatRupiah(p.amount)}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Sisa: <span className={p.outstanding > 0 ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-emerald-500'}>
                      {formatRupiah(p.outstanding)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.outstanding > 0 && (
                    <button
                      onClick={() => onOpenPayModal(p)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                    >
                      Bayar Hutang
                    </button>
                  )}
                  <button
                    onClick={() => deletePayable(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Hapus Faktur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
