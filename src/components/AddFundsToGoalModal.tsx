import React, { useState } from 'react';
import { X, PiggyBank, PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SavingsGoal } from '../types';
import { formatRupiah } from '../utils/formatters';

interface AddFundsToGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const AddFundsToGoalModal: React.FC<AddFundsToGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { accounts, addFundsToGoal, openReceiptModal } = useApp();
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) return;

    const tx = addFundsToGoal(goal.id, parsedAmount, selectedAccountId || undefined);
    setAmount('');
    onClose();

    if (tx) {
      openReceiptModal(tx);
    }
  };

  const quickAmounts = [100000, 250000, 500000, 1000000, 2000000, remaining].filter(
    (val, idx, arr) => val > 0 && arr.indexOf(val) === idx
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Tabungan</h3>
              <p className="text-xs text-slate-500">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Terkumpul Sekarang:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{formatRupiah(goal.currentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target Akhir:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{formatRupiah(goal.targetAmount)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sisa Kekurangan:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatRupiah(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nominal Setoran Tabungan (Rp)
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Quick amount chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickAmounts.map(val => (
              <button
                type="button"
                key={val}
                onClick={() => setAmount(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-semibold transition-all cursor-pointer"
              >
                +{formatRupiah(val)}
              </button>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sumber Dana (Potong Saldo Rekening)
            </label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — {formatRupiah(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Setor Tabungan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddFundsToGoalModal;
