import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Trash2,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Receivable } from '../../types';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface ReceivablesViewProps {
  onOpenAddModal: () => void;
  onOpenPayModal: (rec: Receivable) => void;
}

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  onOpenAddModal,
  onOpenPayModal,
}) => {
  const { receivables, deleteReceivable } = useApp();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'unpaid' | 'partial' | 'paid' | 'overdue'>('ALL');

  // Compute Aging
  const today = new Date().toISOString().split('T')[0];

  const processedReceivables = receivables.map(r => {
    const outstanding = Math.max(0, r.amount - r.paidAmount);
    const isOverdue = r.status !== 'paid' && r.dueDate < today;
    
    // Days aging
    const dueTime = new Date(r.dueDate).getTime();
    const todayTime = new Date(today).getTime();
    const daysDiff = Math.floor((todayTime - dueTime) / (1000 * 60 * 60 * 24));
    
    let agingCategory: 'current' | '30-days' | '60-days' | '90-plus' = 'current';
    if (daysDiff > 60) agingCategory = '90-plus';
    else if (daysDiff > 30) agingCategory = '60-days';
    else if (daysDiff > 0) agingCategory = '30-days';

    return {
      ...r,
      outstanding,
      isOverdue,
      daysDiff,
      agingCategory,
    };
  });

  const filtered = processedReceivables.filter(r => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'overdue') return r.isOverdue;
    return r.status === filterStatus;
  });

  const totalReceivable = processedReceivables.reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = processedReceivables.reduce((s, r) => s + r.outstanding, 0);
  const totalOverdue = processedReceivables.filter(r => r.isOverdue).reduce((s, r) => s + r.outstanding, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Tagihan Invoice</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(totalReceivable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{receivables.length} Total Invoice</div>
        </div>

        <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 shadow-xs">
          <div className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold mb-1">Total Piutang Belum Lunas</div>
          <div className="text-base sm:text-lg font-bold text-cyan-700 dark:text-cyan-300">
            {formatRupiah(totalOutstanding)}
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1">Outstanding tagihan aktif</div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 shadow-xs">
          <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold mb-1">Jatuh Tempo (Overdue)</div>
          <div className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-300">
            {formatRupiah(totalOverdue)}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Perlu tindak lanjut penagihan</div>
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'ALL' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Semua ({receivables.length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'unpaid' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setFilterStatus('partial')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'partial' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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
              filterStatus === 'paid' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Lunas
          </button>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Invoice Piutang</span>
        </button>
      </div>

      {/* Invoice List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Tidak ada invoice piutang dengan filter ini.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-cyan-300 dark:hover:border-cyan-800 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {r.invoiceNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {r.customerName}
                  </span>
                  {r.branch && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {r.branch}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.status === 'paid' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : r.isOverdue
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {r.status === 'paid' ? 'LUNAS' : r.isOverdue ? `JATUH TEMPO (+${r.daysDiff}h)` : r.status === 'partial' ? 'SEBAGIAN' : 'BELUM BAYAR'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Terbit: {r.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Jatuh Tempo: {r.dueDate}
                  </span>
                  {r.notes && <span className="text-slate-400 italic">• {r.notes}</span>}
                </div>
              </div>

              {/* Financial Status & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Total: {formatRupiah(r.amount)}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Sisa: <span className={r.outstanding > 0 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : 'text-emerald-500'}>
                      {formatRupiah(r.outstanding)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {r.outstanding > 0 && (
                    <button
                      onClick={() => onOpenPayModal(r)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
                    >
                      Terima Bayar
                    </button>
                  )}
                  <button
                    onClick={() => deleteReceivable(r.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Hapus Invoice"
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
