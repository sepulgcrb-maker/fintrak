import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  Landmark, 
  Smartphone, 
  Briefcase 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';
import { Account } from '../types';

export const AccountsView: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    openTransferModal, 
    transactions, 
    user 
  } = useApp();

  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('bank');
  const [newAccBalance, setNewAccBalance] = useState('');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;

    addAccount({
      name: newAccName,
      accountNumber: newAccNumber || undefined,
      type: newAccType,
      balance: parseInt(newAccBalance.replace(/[^0-9]/g, ''), 10) || 0,
      color: 'from-blue-600 to-indigo-700',
      icon: newAccType === 'bank' ? 'Landmark' : newAccType === 'wallet' ? 'Smartphone' : 'Briefcase',
      isActive: true,
    });

    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance('');
    setIsAddAccountOpen(false);
  };

  const activeAccount = accounts.find(a => a.id === selectedAccId) || accounts[0];
  const accountTransactions = transactions.filter(t => t.accountId === activeAccount?.id);

  return (
    <div className="space-y-4 px-4 py-3 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Rekening & Dompet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola rekening bank, kas bisnis, dan e-wallet Anda
          </p>
        </div>
        <button
          id="add-account-btn"
          onClick={() => setIsAddAccountOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {accounts.map(acc => {
          const isSelected = acc.id === activeAccount?.id;
          return (
            <div
              key={acc.id}
              id={`account-card-${acc.id}`}
              onClick={() => setSelectedAccId(acc.id)}
              className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all border ${
                isSelected 
                  ? 'ring-2 ring-emerald-500 shadow-md' 
                  : 'opacity-90 hover:opacity-100 shadow-xs'
              } bg-gradient-to-br ${acc.color} text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                    {acc.type === 'bank' ? (
                      <Landmark className="w-4 h-4 text-white" />
                    ) : acc.type === 'wallet' ? (
                      <Smartphone className="w-4 h-4 text-white" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                    <p className="text-[10px] text-white/70">{acc.accountNumber || 'Aktif'}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openTransferModal(acc.id);
                  }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                  title="Pindah Saldo"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[10px] text-white/70">Saldo Rekening</p>
                <h3 className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {user.hideBalance ? '••••••••' : formatRupiah(acc.balance)}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {activeAccount && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Riwayat Mutasi: {activeAccount.name}
            </h4>
            <span className="text-xs text-slate-400">{accountTransactions.length} Transaksi</span>
          </div>

          <div className="space-y-2">
            {accountTransactions.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Belum ada mutasi pada rekening ini.
              </div>
            ) : (
              accountTransactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">{tx.transactionDate}, {tx.transactionTime}</p>
                  </div>
                  <p className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Rekening Baru</h3>
            
            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank BCA Bisnis, Kas Toko"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Rekening / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: 8291-092-110"
                  value={newAccNumber}
                  onChange={e => setNewAccNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Saldo Awal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AccountsView;
