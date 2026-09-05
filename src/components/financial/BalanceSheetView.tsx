import React from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Layers, 
  ShieldCheck, 
  Wallet, 
  Coins 
} from 'lucide-react';
import { BalanceSheetReport } from '../../utils/financialCalculations';
import { formatRupiah } from '../../utils/formatters';

export interface BalanceSheetViewProps {
  balanceSheet?: BalanceSheetReport;
  asOfDateLabel?: string;
  periodLabel?: string;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({
  balanceSheet,
  asOfDateLabel,
  periodLabel,
}) => {
  const displayDate = asOfDateLabel || periodLabel || 'Per Hari Ini';

  const defaultBalanceSheet: BalanceSheetReport = {
    currentAssets: { cashAndBank: 0, accountsReceivable: 0, suppliesInventory: 0, total: 0 },
    fixedAssets: { equipment: 0, vehicles: 0, accumulatedDepreciation: 0, total: 0 },
    totalAssets: 0,
    liabilities: { accountsPayable: 0, taxPayable: 0, bankLoan: 0, total: 0 },
    equity: { ownerCapital: 0, retainedEarnings: 0, currentNetProfit: 0, total: 0 },
    totalLiabilitiesAndEquity: 0,
    isBalanced: true,
  };

  const bs = balanceSheet || defaultBalanceSheet;

  return (
    <div className="p-4 space-y-4">
      {/* Accounting Equation Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
        bs.isBalanced 
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            bs.isBalanced 
              ? 'bg-emerald-500 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            {bs.isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold">
              {bs.isBalanced 
                ? 'Status Neraca Seimbang (Balanced)' 
                : 'Peringatan: Selisih Pembukuan Dideteksi'}
            </h3>
            <p className="text-xs opacity-80">
              Persamaan Akuntansi ({displayDate}): Total Aset = Total Liabilitas + Total Ekuitas
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold opacity-70">Total Aset vs Liabilitas+Ekuitas</div>
          <div className="text-sm font-bold">
            {formatRupiah(bs.totalAssets)} = {formatRupiah(bs.totalLiabilitiesAndEquity)}
          </div>
        </div>
      </div>

      {/* Two Column Layout on Desktop: ASET vs LIABILITAS & EKUITAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SISI KIRI: ASET */}
        <div className="space-y-4">
          {/* Card Total Aset */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ASET (AKTIVA)
              </span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                {formatRupiah(bs.totalAssets)}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {/* ASET LANCAR */}
              <div className="p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-slate-800 dark:text-white text-sm">
                  <span>ASET LANCAR (CURRENT ASSETS)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(bs.currentAssets.total)}
                  </span>
                </div>
                <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>• Kas & Rekening Bank</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(bs.currentAssets.cashAndBank)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Piutang Usaha (Accounts Receivable)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(bs.currentAssets.accountsReceivable)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Persediaan & Perlengkapan Operasional</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(bs.currentAssets.suppliesInventory)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ASET TETAP */}
              <div className="p-3.5 space-y-2">
                <div className="flex justify-between font-bold text-slate-800 dark:text-white text-sm">
                  <span>ASET TETAP (FIXED ASSETS)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(bs.fixedAssets.total)}
                  </span>
                </div>
                <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>• Peralatan Usaha & Komputer</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(bs.fixedAssets.equipment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Kendaraan Operasional</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(bs.fixedAssets.vehicles)}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>• Akumulasi Penyusutan (Depresiasi)</span>
                    <span className="font-semibold">
                      ({formatRupiah(Math.abs(bs.fixedAssets.accumulatedDepreciation))})
                    </span>
                  </div>
                </div>
              </div>

              {/* TOTAL ASET SUMMARY */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
                <span>TOTAL ASET KESELURUHAN</span>
                <span className="text-blue-600 dark:text-blue-400 text-base">
                  {formatRupiah(bs.totalAssets)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: LIABILITAS & EKUITAS */}
        <div className="space-y-4">
          {/* LIABILITAS */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                1. LIABILITAS / KEWAJIBAN (PASSIVA)
              </span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {formatRupiah(bs.liabilities.total)}
              </span>
            </div>

            <div className="p-3.5 space-y-2 text-xs">
              <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>• Hutang Usaha (Accounts Payable)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatRupiah(bs.liabilities.accountsPayable)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Hutang Pajak Terutang (PPN / PPh)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatRupiah(bs.liabilities.taxPayable)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Kewajiban Jangka Panjang / Pinjaman Bank</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatRupiah(bs.liabilities.bankLoan)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* EKUITAS / MODAL */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                2. EKUITAS / MODAL BERSIH
              </span>
              <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                {formatRupiah(bs.equity.total)}
              </span>
            </div>

            <div className="p-3.5 space-y-2 text-xs">
              <div className="pl-3 space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>• Modal Disetor Pemilik</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatRupiah(bs.equity.ownerCapital)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Laba Ditahan (Retained Earnings)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatRupiah(bs.equity.retainedEarnings)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Laba Periode Berjalan</span>
                  <span className={`font-semibold ${bs.equity.currentNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatRupiah(bs.equity.currentNetProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL LIABILITAS & EKUITAS */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex justify-between items-center font-bold text-sm shadow-xs">
            <span>TOTAL LIABILITAS & EKUITAS</span>
            <span className="text-emerald-400 text-base">
              {formatRupiah(bs.totalLiabilitiesAndEquity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
