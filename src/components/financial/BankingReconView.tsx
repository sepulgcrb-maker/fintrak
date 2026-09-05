import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeftRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Wallet, 
  Check, 
  X,
  CreditCard,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';

export const BankingReconView: React.FC = () => {
  const { 
    accounts, 
    bankReconciliations, 
    toggleBankReconciliation, 
    openTransferModal,
    addBankReconciliationItem 
  } = useApp();

  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [showAddMutation, setShowAddMutation] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newType, setNewType] = useState<'debit' | 'credit'>('credit');
  const [newBank, setNewBank] = useState(accounts[0]?.id || 'acc-1');

  // Filter recon items
  const filteredRecon = bankReconciliations.filter(item => {
    if (selectedAccountId === 'ALL') return true;
    return item.bankAccountId === selectedAccountId;
  });

  const matchedCount = filteredRecon.filter(r => r.isMatched).length;
  const unmatchedCount = filteredRecon.filter(r => !r.isMatched).length;

  const totalBankBalance = accounts.reduce((s, a) => s + (a.isActive ? a.balance : 0), 0);

  const handleAddMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || newAmount <= 0) return;

    addBankReconciliationItem({
      bankAccountId: newBank,
      transactionDate: newDate,
      description: newDesc,
      amount: newAmount,
      type: newType,
      isMatched: false,
    });

    setNewDesc('');
    setNewAmount(0);
    setShowAddMutation(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Kas & Rekening Bank Overview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-500" />
            Daftar Kas & Rekening Bank Aktif
          </h3>
          <button
            onClick={openTransferModal}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer Saldo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {accounts.map(acc => (
            <div 
              key={acc.id}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs"
                  style={{ backgroundColor: acc.color }}
                >
                  {acc.type === 'bank' ? <Building2 className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {acc.name}
                    {acc.isDefault && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-normal">
                        Utama
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">{acc.type}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatRupiah(acc.balance)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rekonsiliasi Bank Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Rekonsiliasi Bank & Kas
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pencocokan mutasi rekening koran bank dengan buku kas internal
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMutation(!showAddMutation)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Mutasi Koran</span>
            </button>
          </div>
        </div>

        {/* Add Mutation Form Collapse */}
        {showAddMutation && (
          <form onSubmit={handleAddMutation} className="p-3.5 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 space-y-3 text-xs animate-in fade-in">
            <div className="font-bold text-slate-800 dark:text-white">Input Baris Rekening Koran Baru:</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-500 mb-1 block">Rekening Bank</label>
                <select
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 mb-1 block">Tanggal</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 mb-1 block">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: BIAYA ADM / SETORAN"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-slate-500 mb-1 block">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 mb-1 block">Tipe</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="credit">Masuk (CR)</option>
                    <option value="debit">Keluar (DB)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMutation(false)}
                className="px-3 py-1 text-slate-500 hover:text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Simpan Mutasi
              </button>
            </div>
          </form>
        )}

        {/* Status Counters */}
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {matchedCount} Cocok
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {unmatchedCount} Belum Dicocokkan
            </span>
          </div>

          <div className="text-slate-500">
            Total Saldo Buku Kas: <strong className="text-slate-900 dark:text-white">{formatRupiah(totalBankBalance)}</strong>
          </div>
        </div>

        {/* Table of Reconciliation Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Akun Bank</th>
                <th className="py-2.5 px-3">Mutasi Rekening Koran</th>
                <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                <th className="py-2.5 px-3 text-center">Status Rekonsiliasi</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecon.map(item => {
                const bank = accounts.find(a => a.id === item.bankAccountId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{item.transactionDate}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {bank?.name || 'Bank Operasional'}
                    </td>
                    <td className="py-2.5 px-3 max-w-[240px] truncate">{item.description}</td>
                    <td className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                      item.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.type === 'credit' ? `+${formatRupiah(item.amount)}` : `-${formatRupiah(item.amount)}`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        item.isMatched 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {item.isMatched ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.isMatched ? 'COCOK' : 'BELUM COCOK'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggleBankReconciliation(item.id)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                          item.isMatched
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {item.isMatched ? 'Batalkan' : 'Cocokkan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
