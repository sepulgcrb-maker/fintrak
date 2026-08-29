import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight,
  TrendingDown,
  BellRing
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryType, CategoryBudget } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: { category: CategoryType; defaultThreshold: number; icon: string; desc: string }[] = [
  { category: 'Belanja', defaultThreshold: 3000000, icon: '🛍️', desc: 'Belanja kebutuhan pribadi, pakaian & harian' },
  { category: 'Makan & Minum', defaultThreshold: 2500000, icon: '🍔', desc: 'Restoran, kafe, groceries & pesan antar' },
  { category: 'Operasional', defaultThreshold: 8000000, icon: '💼', desc: 'Operasional usaha, kantor & alat kerja' },
  { category: 'Tagihan', defaultThreshold: 4000000, icon: '⚡', desc: 'Listrik, internet, sewa & langganan' },
  { category: 'Transportasi', defaultThreshold: 1500000, icon: '🚗', desc: 'Bensin, tol, parkir & transportasi umum' },
  { category: 'Hiburan', defaultThreshold: 1000000, icon: '🎬', desc: 'Bioskop, liburan & rekreasi' },
  { category: 'Kesehatan', defaultThreshold: 1500000, icon: '💊', desc: 'Obat, dokter, asuransi & gym' },
  { category: 'Edukasi', defaultThreshold: 2000000, icon: '📚', desc: 'Kursus, buku & biaya pendidikan' },
  { category: 'Vendor', defaultThreshold: 10000000, icon: '🏭', desc: 'Pembayaran supplier dan mitra kerja' },
  { category: 'Gaji Karyawan', defaultThreshold: 15000000, icon: '👥', desc: 'Payroll tim dan upah freelance' },
  { category: 'Lainnya', defaultThreshold: 1500000, icon: '📦', desc: 'Pengeluaran tak terduga lainnya' },
];

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({ isOpen, onClose }) => {
  const { categoryBudgets, setCategoryBudget, toggleCategoryBudget, transactions } = useApp();

  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [customValue, setCustomValue] = useState<string>('');

  if (!isOpen) return null;

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  // Compute current spent per category this month
  const getCategorySpending = (category: CategoryType) => {
    return transactions
      .filter(
        t =>
          t.type === 'expense' &&
          t.status === 'completed' &&
          t.category === category &&
          t.transactionDate.startsWith(currentMonthPrefix)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleOpenEdit = (category: CategoryType, currentThreshold: number) => {
    setEditingCategory(category);
    setCustomValue(currentThreshold.toString());
  };

  const handleSaveThreshold = (category: CategoryType) => {
    const num = parseInt(customValue.replace(/\D/g, ''), 10) || 0;
    setCategoryBudget(category, num, true);
    setEditingCategory(null);
  };

  const handleApplyPreset = (category: CategoryType, amount: number) => {
    setCategoryBudget(category, amount, true);
    if (editingCategory === category) {
      setEditingCategory(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Batas Anggaran Kategori (FinAI Alert)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FinAI akan mengirim notifikasi saat pengeluaran melampaui batas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Sistem Pemantauan Otomatis:</strong> Setiap transaksi yang dicatat akan diverifikasi langsung oleh FinAI. Peringatan real-time akan muncul jika saldo terpakai mencapai 100% dari limit bulanan.
            </p>
          </div>

          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map(item => {
              const currentBudget = categoryBudgets.find(b => b.category === item.category);
              const threshold = currentBudget ? currentBudget.monthlyThreshold : item.defaultThreshold;
              const isEnabled = currentBudget ? currentBudget.enabled : false;
              const spent = getCategorySpending(item.category);
              const percentage = threshold > 0 ? Math.round((spent / threshold) * 100) : 0;
              const isOver = isEnabled && threshold > 0 && spent > threshold;
              const isWarning = isEnabled && threshold > 0 && percentage >= 80 && !isOver;

              const isEditingThis = editingCategory === item.category;

              return (
                <div
                  key={item.category}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOver
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                      : isWarning
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                      : isEnabled
                      ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0">
                        {item.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.category}
                          </h4>
                          {isOver && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full animate-pulse">
                              <ShieldAlert className="w-3 h-3" /> Over Limit {percentage}%
                            </span>
                          )}
                          {isWarning && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Waspada {percentage}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Alert Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCategoryBudget(item.category)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={isEnabled ? 'Nonaktifkan Peringatan' : 'Aktifkan Peringatan'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Spending Progress Bar */}
                  {isEnabled && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 dark:text-slate-400">
                          Terpakai: <strong className="text-slate-900 dark:text-white">{formatRupiah(spent)}</strong>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Batas: <strong className="text-slate-900 dark:text-white">{formatRupiah(threshold)}</strong>
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>

                      {isOver && (
                        <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          ⚠️ Melebihi batas sebesar {formatRupiah(spent - threshold)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Threshold Editor */}
                  {isEditingThis ? (
                    <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Setel Batas Nominal Bulanan:
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            Rp
                          </span>
                          <input
                            type="text"
                            value={customValue}
                            onChange={e => setCustomValue(e.target.value.replace(/\D/g, ''))}
                            placeholder="Contoh: 3000000"
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveThreshold(item.category)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                        >
                          Batal
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[1000000, 2500000, 5000000, 10000000].map(val => (
                          <button
                            key={val}
                            onClick={() => {
                              setCustomValue(val.toString());
                              handleApplyPreset(item.category, val);
                            }}
                            className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:border-emerald-500"
                          >
                            {formatRupiah(val)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenEdit(item.category, threshold)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" /> Ubah Batas Threshold
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
export default CategoryBudgetModal;
