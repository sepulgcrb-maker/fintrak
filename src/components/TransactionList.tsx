import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight,
  Briefcase,
  Layers,
  FileText,
  ShoppingBag,
  TrendingUp,
  Settings,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, getRelativeDateLabel } from '../utils/formatters';
import { getReceiptNumber } from '../utils/receipt';

export const TransactionList: React.FC<{ limit?: number; showFilters?: boolean; title?: string }> = ({ 
  limit, 
  showFilters = false, 
  title = 'Transaksi Terbaru' 
}) => {
  const { transactions, accounts, user, setActiveTab, openReceiptModal } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchType = filterType === 'all' || t.type === filterType;
    const query = search.trim().toLowerCase();
    const matchSearch = query === '' || 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      (t.notes && t.notes.toLowerCase().includes(query)) ||
      (t.recipient && t.recipient.toLowerCase().includes(query));
    return matchType && matchSearch;
  });

  const displayList = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

  const getAccountName = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'Rekening';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Gaji': return <Briefcase className="w-4 h-4" />;
      case 'Proyek': return <Layers className="w-4 h-4" />;
      case 'Invoice': return <FileText className="w-4 h-4" />;
      case 'Penjualan': return <ShoppingBag className="w-4 h-4" />;
      case 'Investasi': return <TrendingUp className="w-4 h-4" />;
      case 'Operasional': return <Settings className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {displayList.length} Mutasi
          </span>
        </div>
        {limit && (
          <button
            id="view-all-tx-btn"
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline focus:outline-none cursor-pointer"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="tx-search-input"
              type="text"
              placeholder="Cari pedagang/merchant, kategori, catatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              + Pemasukan
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}
            >
              - Pengeluaran
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayList.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
            <Filter className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Coba sesuaikan filter pencarian Anda</p>
          </div>
        ) : (
          displayList.map(tx => {
            const isIncome = tx.type === 'income';
            const isPending = tx.status === 'pending' || tx.status === 'scheduled';
            const receiptNum = getReceiptNumber(tx);
            
            return (
              <div
                key={tx.id}
                id={`tx-item-${tx.id}`}
                onClick={() => openReceiptModal(tx)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isIncome 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {getCategoryIcon(tx.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {tx.description}
                      </h4>
                      {isPending && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          Akan Datang
                        </span>
                      )}
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {receiptNum}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{tx.category}</span>
                      <span>•</span>
                      <span>{getRelativeDateLabel(tx.transactionDate)}, {tx.transactionTime}</span>
                      <span>•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{getAccountName(tx.accountId)}</span>
                    </p>
                    {tx.notes && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate mt-0.5 max-w-[200px] sm:max-w-xs">
                        "{tx.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2 flex flex-col items-end">
                  <p
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {user.hideBalance ? '••••••' : formatRupiah(tx.amount)}
                  </p>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        tx.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : tx.status === 'overdue'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {tx.status === 'completed'
                        ? 'Selesai'
                        : tx.status === 'overdue'
                        ? 'Jatuh Tempo'
                        : tx.status === 'pending'
                        ? 'Menunggu'
                        : 'Terjadwal'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReceiptModal(tx);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Lihat Resi Transaksi"
                    >
                      <FileText className="w-2.5 h-2.5" />
                      <span>Resi</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default TransactionList;
