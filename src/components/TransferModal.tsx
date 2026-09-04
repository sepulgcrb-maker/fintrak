import React, { useState } from 'react';
import { X, Send, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

export const TransferModal: React.FC = () => {
  const { isTransferModalOpen, closeTransferModal, accounts, transferBalance, selectedAccountId, openReceiptModal } = useApp();

  const [fromAccountId, setFromAccountId] = useState(selectedAccountId || accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(
    accounts.find(a => a.id !== (selectedAccountId || accounts[0]?.id))?.id || accounts[1]?.id || ''
  );
  const [amountRaw, setAmountRaw] = useState('');
  const [notes, setNotes] = useState('');

  if (!isTransferModalOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseRupiahInput(val);
    setAmountRaw(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseRupiahInput(amountRaw);
    if (amount <= 0 || fromAccountId === toAccountId) return;

    const result = transferBalance(fromAccountId, toAccountId, amount, notes);
    setAmountRaw('');
    setNotes('');
    closeTransferModal();

    if (result?.outTx) {
      openReceiptModal(result.outTx);
    }
  };

  const fromAccount = accounts.find(a => a.id === fromAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-xs">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Send className="w-4 h-4 text-emerald-500" />
            Transfer Antar Rekening
          </h3>
          <button
            onClick={closeTransferModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dari Rekening Asal</label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo: {formatRupiah(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center my-1">
            <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ke Rekening Tujuan</label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {accounts
                .filter(a => a.id !== fromAccountId)
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Saldo: {formatRupiah(acc.balance)})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Transfer (Rp)</label>
            <input
              type="text"
              required
              placeholder="0"
              value={amountRaw}
              onChange={handleAmountChange}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {fromAccount && (
              <p className="text-[10px] text-slate-400 mt-1">
                Saldo tersedia: {formatRupiah(fromAccount.balance)}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
            <input
              type="text"
              placeholder="Contoh: Pengisian petty cash operasional"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={closeTransferModal}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm cursor-pointer"
            >
              Kirim Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TransferModal;
