import React from 'react';
import { 
  Receipt, 
  Percent, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle 
} from 'lucide-react';
import { TaxReport } from '../../utils/financialCalculations';
import { formatRupiah } from '../../utils/formatters';

export interface TaxReportViewProps {
  taxReport?: TaxReport;
  periodLabel?: string;
}

export const TaxReportView: React.FC<TaxReportViewProps> = ({
  taxReport,
  periodLabel = 'Bulan Ini',
}) => {
  const defaultReport: TaxReport = {
    grossRevenue: 0,
    taxableSales: 0,
    outputVat: 0,
    taxablePurchases: 0,
    inputVat: 0,
    netVatPayable: 0,
    pphFinalUmkm: 0,
  };

  const tr = taxReport || defaultReport;
  const isVatUnderpaid = tr.netVatPayable >= 0;

  return (
    <div className="p-4 space-y-4">
      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PPN NETO TERUTANG */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          isVatUnderpaid 
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
            : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              PPN 11% (Pajak Pertambahan Nilai)
            </span>
            <span className="text-xs text-slate-500">{periodLabel}</span>
          </div>
          <div className={`text-xl font-black ${isVatUnderpaid ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
            {formatRupiah(Math.abs(tr.netVatPayable))}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Status: <strong>{isVatUnderpaid ? 'PPN Kurang Bayar (Wajib Setor Kas Negara)' : 'PPN Lebih Bayar (Bisa Dikompensasikan)'}</strong>
          </div>
        </div>

        {/* PPh Final UMKM */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              PPh Final UMKM (PP 23/2018 - 0.5%)
            </span>
            <span className="text-xs text-slate-500">{periodLabel}</span>
          </div>
          <div className="text-xl font-black text-blue-700 dark:text-blue-300">
            {formatRupiah(tr.pphFinalUmkm)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Dihitung dari Omzet Bruto: <strong>{formatRupiah(tr.grossRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Rincian Perhitungan Pajak */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Rincian Faktur Pajak Masukan & Keluaran
          </span>
          <span className="text-xs text-slate-500">Tarif Standar UU HPP: 11%</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* Penjualan & PPN Keluaran */}
          <div className="p-4 space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>1. DASAR PENGENAAN PAJAK (DPP) PENJUALAN</span>
              <span>{formatRupiah(tr.taxableSales)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pl-4">
              <span>• PPN Keluaran (Output VAT 11% dipungut dari pembeli)</span>
              <span>+{formatRupiah(tr.outputVat)}</span>
            </div>
          </div>

          {/* Pembelian & PPN Masukan */}
          <div className="p-4 space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>2. DASAR PENGENAAN PAJAK (DPP) PEMBELIAN / VENDOR</span>
              <span>{formatRupiah(tr.taxablePurchases)}</span>
            </div>
            <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold pl-4">
              <span>• PPN Masukan (Input VAT 11% dibayarkan ke supplier)</span>
              <span>-{formatRupiah(tr.inputVat)}</span>
            </div>
          </div>

          {/* Rekap Pajak Neto */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 space-y-2 font-medium">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Selisih PPN (Keluaran - Masukan):</span>
              <span className={`font-bold ${isVatUnderpaid ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatRupiah(tr.netVatPayable)}
              </span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Kewajiban PPh Final 0.5% (Pasal 4 ayat 2):</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(tr.pphFinalUmkm)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
              <span>TOTAL ESTIMASI KEWAJIBAN SETOR PAJAK BULANAN:</span>
              <span className="text-amber-600 dark:text-amber-400">
                {formatRupiah(Math.max(0, tr.netVatPayable) + tr.pphFinalUmkm)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Guide Notes */}
      <div className="p-3.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Data laporan pajak dihitung otomatis berdasarkan data invoice penjualan dan pembelian resmi. Anda dapat mengunduh rekap ini dalam format Excel atau PDF untuk pelaporan SPT Masa PPN dan SPT Tahunan Badan / Orang Pribadi.
        </p>
      </div>
    </div>
  );
};
