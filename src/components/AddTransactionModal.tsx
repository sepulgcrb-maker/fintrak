import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Calendar, Clock, Wallet, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { CategoryType, TransactionType, TransactionStatus } from '../types';

const incomeCategories: CategoryType[] = ['Gaji', 'Penjualan', 'Proyek', 'Invoice', 'Investasi', 'Lainnya'];
const expenseCategories: CategoryType[] = ['Operasional', 'Belanja', 'Transportasi', 'Gaji Karyawan', 'Vendor', 'Tagihan', 'Makan & Minum', 'Kesehatan', 'Lainnya'];

export const AddTransactionModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, addModalDefaults, accounts, addTransaction } = useApp();

  const [type, setType] = useState<TransactionType>('income');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [description, setDescription] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [category, setCategory] = useState<CategoryType>('Gaji');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isAddModalOpen) {
      setType(addModalDefaults.type);
      setStatus(addModalDefaults.status);
      setCategory(addModalDefaults.type === 'income' ? 'Gaji' : 'Operasional');
      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
      }
    }
  }, [isAddModalOpen, addModalDefaults, accounts]);

  if (!isAddModalOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseRupiahInput(val);
    setAmountRaw(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseRupiahInput(amountRaw);
    if (!description || parsedAmount <= 0) return;

    addTransaction({
      accountId: accountId || accounts[0]?.id || 'acc-1',
      type,
      status,
      amount: parsedAmount,
      category,
      description,
      transactionDate,
      transactionTime,
      notes: notes || undefined,
      isScheduled: status !== 'completed',
    });

    // Reset & close
    setDescription('');
    setAmountRaw('');
    setNotes('');
    closeAddModal();
  };

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {status === 'completed' ? 'Catat Transaksi' : 'Rencanakan Transaksi'}
          </h3>
          <button
            id="close-add-modal-btn"
            onClick={closeAddModal}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Type Toggle: Pemasukan vs Pengeluaran */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Gaji');
              }}
              className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Operasional');
              }}
              className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
          </div>

          {/* Status Toggle: Sudah Terjadi vs Akan Datang */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'completed'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Sudah Terjadi
              </button>
              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  status !== 'completed'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Akan Datang / Terjadwal
              </button>
            </div>
          </div>

          {/* Nominal Input with Auto Rupiah */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">Rp</span>
              <input
                id="tx-amount-input"
                type="text"
                required
                placeholder="0"
                value={amountRaw}
                onChange={handleAmountChange}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-lg font-extrabold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Transaction Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Transaksi</label>
            <input
              id="tx-desc-input"
              type="text"
              required
              placeholder="Contoh: Pembayaran Proyek, Gaji Karyawan, Belanja ATK"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
            <div className="flex flex-wrap gap-1.5">
              {currentCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Account / Wallet */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rekening / Dompet</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatRupiah(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
              <input
                type="date"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam</label>
              <input
                type="time"
                value={transactionTime}
                onChange={e => setTransactionTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder="Catatan tambahan..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="save-transaction-btn"
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-950/20 active:scale-98 transition-transform cursor-pointer"
            >
              SIMPAN TRANSAKSI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddTransactionModal;
