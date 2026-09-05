import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah } from '../../../utils/formatters';

interface ClosePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNetIncome?: number;
}

export const ClosePeriodModal: React.FC<ClosePeriodModalProps> = ({
  isOpen,
  onClose,
  currentNetIncome = 0,
}) => {
  const { closeAccountingPeriod } = useApp();

  const now = new Date();
  const currentMonthYear = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  
  const [periodName, setPeriodName] = useState(`Tutup Buku ${currentMonthYear}`);
  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodName.trim()) return;

    closeAccountingPeriod({
      periodName,
      periodType,
      closedDate: new Date().toISOString().split('T')[0],
      closedBy: 'Finance Admin',
      netIncome: currentNetIncome,
      isLocked: true,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tutup Buku & Kunci Periode Akuntansi
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
              Laba Bersih yang Akan Ditutup ke Laba Ditahan:
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {formatRupiah(currentNetIncome)}
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nama Periode</label>
            <input
              type="text"
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              required
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Jenis Periode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriodType('monthly')}
                className={`py-2 rounded-xl font-semibold border text-center transition-colors ${
                  periodType === 'monthly'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Bulanan (Monthly)
              </button>
              <button
                type="button"
                onClick={() => setPeriodType('yearly')}
                className={`py-2 rounded-xl font-semibold border text-center transition-colors ${
                  periodType === 'yearly'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Tahunan (Yearly)
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Catatan Penutupan Buku</label>
            <textarea
              placeholder="Catatan saldo akhir, audit atau rekonsiliasi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Setelah periode ditutup, status periode otomatis terkunci untuk mencegah perubahan transaksi historis tanpa izin.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kunci & Tutup Buku</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
