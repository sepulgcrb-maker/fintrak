import React, { useState } from 'react';
import { X, ArrowUpRight, Calendar, Building } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { parseRupiahInput, formatRupiah } from '../../../utils/formatters';

interface AddPayableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPayableModal: React.FC<AddPayableModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addPayable, payables } = useApp();

  const [billNumber, setBillNumber] = useState(`BILL-${new Date().getFullYear()}-${String(payables.length + 1).padStart(4, '0')}`);
  const [vendorName, setVendorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [amountStr, setAmountStr] = useState('');
  const [department, setDepartment] = useState('Operasional');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseRupiahInput(amountStr);
    if (!vendorName.trim() || amount <= 0) return;

    addPayable({
      billNumber,
      vendorName,
      date,
      dueDate,
      amount,
      paidAmount: 0,
      status: 'unpaid',
      department,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tambah Faktur Hutang / Tagihan Supplier
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nomor Faktur / Tagihan</label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nama Vendor / Supplier</label>
            <input
              type="text"
              placeholder="Contoh: CV Mitra Logistik / Toko Bahan"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Tanggal Faktur</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Jatuh Tempo Bayar</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nominal Tagihan (Rp)</label>
            <input
              type="text"
              placeholder="Rp 0"
              value={amountStr ? formatRupiah(parseRupiahInput(amountStr), false) : ''}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold"
              required
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Departemen Pembebanan</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Keterangan / Deskripsi Barang/Jasa</label>
            <textarea
              placeholder="Rincian pembelian material atau sewa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors"
            >
              Catat Faktur Hutang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
