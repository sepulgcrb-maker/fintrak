import React, { useState } from 'react';
import { X, ArrowUpRight, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Payable } from '../../../types';
import { parseRupiahInput, formatRupiah } from '../../../utils/formatters';

interface PayPayableModalProps {
  isOpen: boolean;
  onClose: () => void;
  payable: Payable | null;
}

export const PayPayableModal: React.FC<PayPayableModalProps> = ({
  isOpen,
  onClose,
  payable,
}) => {
  const { payPayable, accounts } = useApp();

  const outstanding = payable ? Math.max(0, payable.amount - payable.paidAmount) : 0;
  const [payAmountStr, setPayAmountStr] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || 'acc-1');

  if (!isOpen || !payable) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = payAmountStr ? parseRupiahInput(payAmountStr) : outstanding;
    if (amount <= 0) return;

    payPayable(payable.id, amount, sourceAccountId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bayar Faktur Hutang Supplier
              </h3>
              <p className="text-[11px] text-slate-500">{payable.billNumber} • {payable.vendorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Total Tagihan Faktur:</span>
              <span>{formatRupiah(payable.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Sudah Dibayar:</span>
              <span>{formatRupiah(payable.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Sisa Hutang (Outstanding):</span>
              <span className="text-amber-600 dark:text-amber-400">{formatRupiah(outstanding)}</span>
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nominal Dibayarkan (Rp)</label>
            <input
              type="text"
              placeholder={formatRupiah(outstanding, false)}
              value={payAmountStr ? formatRupiah(parseRupiahInput(payAmountStr), false) : ''}
              onChange={(e) => setPayAmountStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold"
            />
            <div className="text-[11px] text-slate-400 mt-1">Kosongkan untuk melunasi seluruh sisa hutang.</div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Sumber Kas / Rekening Bank Pembayar</label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type}) - Saldo: {formatRupiah(acc.balance)}
                </option>
              ))}
            </select>
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
            >
              Konfirmasi Bayar Hutang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
