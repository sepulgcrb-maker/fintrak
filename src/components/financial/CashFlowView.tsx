import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  TrendingUp, 
  Building2, 
  Coins, 
  PiggyBank 
} from 'lucide-react';
import { CashFlowReport } from '../../utils/financialCalculations';
import { formatRupiah } from '../../utils/formatters';

export interface CashFlowViewProps {
  cashFlow?: CashFlowReport;
  periodLabel?: string;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  cashFlow,
  periodLabel = 'Periode Berjalan',
}) => {
  const defaultCashFlow: CashFlowReport = {
    startingCash: 0,
    endingCash: 0,
    netCashChange: 0,
    operatingCashIn: 0,
    operatingCashOut: 0,
    netOperatingCashFlow: 0,
    investingCashIn: 0,
    investingCashOut: 0,
    netInvestingCashFlow: 0,
    financingCashIn: 0,
    financingCashOut: 0,
    netFinancingCashFlow: 0,
  };

  const cf = cashFlow || defaultCashFlow;
  const isNetPositive = cf.netCashChange >= 0;

  return (
    <div className="p-4 space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Saldo Kas Awal</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatRupiah(cf.startingCash)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awal periode {periodLabel}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Perubahan Kas Bersih</span>
            <TrendingUp className={`w-4 h-4 ${isNetPositive ? 'text-emerald-500' : 'text-rose-500'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isNetPositive ? `+${formatRupiah(cf.netCashChange)}` : formatRupiah(cf.netCashChange)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Kas Masuk vs Kas Keluar</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span>Saldo Kas Akhir</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-400">
            {formatRupiah(cf.endingCash)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total di seluruh akun saat ini</div>
        </div>
      </div>

      {/* Main Cash Flow Breakdown by 3 Activities */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Aktivitas Arus Kas (Metode Langsung)
          </span>
          <span className="text-xs text-slate-500">{periodLabel}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          {/* 1. AKTIVITAS OPERASIONAL */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                1. ARUS KAS DARI AKTIVITAS OPERASIONAL
              </span>
              <span className={`font-bold ${cf.netOperatingCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatRupiah(cf.netOperatingCashFlow)}
              </span>
            </div>
            <div className="pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>(+) Kas diterima dari pelanggan & pendapatan operasional</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(cf.operatingCashIn)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Kas dibayarkan untuk operasional, vendor, gaji, utilitas</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">({formatRupiah(cf.operatingCashOut)})</span>
              </div>
            </div>
          </div>

          {/* 2. AKTIVITAS INVESTASI */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                2. ARUS KAS DARI AKTIVITAS INVESTASI
              </span>
              <span className={`font-bold ${cf.netInvestingCashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatRupiah(cf.netInvestingCashFlow)}
              </span>
            </div>
            <div className="pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>(+) Penjualan aset / return investasi</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(cf.investingCashIn)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Pembelian aset tetap & penempatan investasi</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">({formatRupiah(cf.investingCashOut)})</span>
              </div>
            </div>
          </div>

          {/* 3. AKTIVITAS PENDANAAN */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                3. ARUS KAS DARI AKTIVITAS PENDANAAN
              </span>
              <span className={`font-bold ${cf.netFinancingCashFlow >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatRupiah(cf.netFinancingCashFlow)}
              </span>
            </div>
            <div className="pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>(+) Setoran modal pemilik / penerimaan pinjaman</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(cf.financingCashIn)}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) Prive pemilik / pembayaran pokok pinjaman</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">({formatRupiah(cf.financingCashOut)})</span>
              </div>
            </div>
          </div>

          {/* TOTAL REKONSILIASI KAS */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 space-y-2 font-medium">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Kenaikan / (Penurunan) Kas Bersih:</span>
              <span className={`font-bold ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isNetPositive ? `+${formatRupiah(cf.netCashChange)}` : formatRupiah(cf.netCashChange)}
              </span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Saldo Kas Awal Periode:</span>
              <span className="font-semibold">{formatRupiah(cf.startingCash)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
              <span>SALDO KAS AKHIR PERIODE:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatRupiah(cf.endingCash)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
