import React, { useState } from 'react';
import { X, ArrowDownLeft, Calendar, Building, DollarSign } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { parseRupiahInput, formatRupiah } from '../../../utils/formatters';

interface AddReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddReceivableModal: React.FC<AddReceivableModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addReceivable, receivables } = useApp();

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(receivables.length + 1).padStart(4, '0')}`);
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [amountStr, setAmountStr] = useState('');
  const [branch, setBranch] = useState('Kantor Pusat');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseRupiahInput(amountStr);
    if (!customerName.trim() || amount <= 0) return;

    addReceivable({
      invoiceNumber,
      customerName,
      date,
      dueDate,
      amount,
      paidAmount: 0,
      status: 'unpaid',
      branch,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tambah Invoice Piutang Baru
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nomor Invoice</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Nama Pelanggan / Klien</label>
            <input
              type="text"
              placeholder="Contoh: PT Sumber Rejeki / Ibu Linda"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Tanggal Terbit</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Jatuh Tempo</label>
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
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Cabang / Proyek</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-medium mb-1 block">Keterangan / Catatan</label>
            <textarea
              placeholder="Rincian pesanan atau termin..."
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
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-colors"
            >
              Terbitkan Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
