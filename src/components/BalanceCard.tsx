import React from 'react';
import { Eye, EyeOff, RotateCw, ArrowUpRight, ArrowDownLeft, Send, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';

export const BalanceCard: React.FC = () => {
  const {
    totalBalance,
    projectedBalance,
    user,
    toggleHideBalance,
    refreshData,
    isRefreshing,
    openAddModal,
    openTransferModal,
    setActiveTab,
  } = useApp();

  return (
    <div className="px-4 py-2">
      <div 
        id="main-balance-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-xl shadow-emerald-950/20 border border-slate-800"
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
              FT
            </div>
            <div>
              <span className="text-[11px] font-medium tracking-wider text-slate-300 uppercase">
                FinTrack Platinum
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <button
              id="toggle-balance-visibility-btn"
              onClick={toggleHideBalance}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none p-0.5"
              title={user.hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            >
              {user.hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              id="refresh-balance-btn"
              onClick={refreshData}
              className={`text-slate-300 hover:text-white transition-colors focus:outline-none p-0.5 ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Data"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 mb-2 relative z-10">
          <p className="text-xs font-medium text-slate-400">Total Saldo</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white font-mono">
            {user.hideBalance ? '••••••••••••' : formatRupiah(totalBalance)}
          </h2>
        </div>

        <div 
          onClick={() => setActiveTab('planning')}
          className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 cursor-pointer hover:bg-emerald-500/25 transition-all mt-1"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Estimasi Saldo Masa Depan:</span>
          <span className="font-bold text-white">
            {user.hideBalance ? '••••••' : formatRupiah(projectedBalance)}
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 relative z-10">
          <button
            id="quick-income-btn"
            onClick={() => openAddModal('income', 'completed')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>

          <button
            id="quick-expense-btn"
            onClick={() => openAddModal('expense', 'completed')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-950/40 transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>

          <button
            id="quick-transfer-btn"
            onClick={() => openTransferModal()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-transform active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default BalanceCard;
