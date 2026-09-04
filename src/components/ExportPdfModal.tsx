import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileDown, 
  Check, 
  Calendar, 
  SlidersHorizontal, 
  Building2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  CheckSquare, 
  Square,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { exportFinancialReportPDF } from '../utils/pdfExport';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPeriod?: 'today' | 'week' | 'month' | 'year' | 'all';
}

type PeriodType = 'today' | 'week' | 'month' | '30days' | 'year' | 'all' | 'custom';

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  defaultPeriod = 'month',
}) => {
  const { user, accounts, transactions, categoryBudgets } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const firstDayOfMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);
  const [customStartDate, setCustomStartDate] = useState<string>(firstDayOfMonth);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  
  // Options
  const [includeReceiptNumber, setIncludeReceiptNumber] = useState(true);
  const [includeAccountsSummary, setIncludeAccountsSummary] = useState(true);
  const [includeCategoryBreakdown, setIncludeCategoryBreakdown] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Compute active date boundaries based on period
  const { startDate, endDate, periodTitle } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (period === 'today') {
      return {
        startDate: todayStr,
        endDate: todayStr,
        periodTitle: `Laporan Transaksi Hari Ini (${formatDateIndonesian(todayStr)})`,
      };
    }
    if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      const start = d.toISOString().slice(0, 10);
      return {
        startDate: start,
        endDate: todayStr,
        periodTitle: `Laporan Transaksi 7 Hari Terakhir (${start} s/d ${todayStr})`,
      };
    }
    if (period === '30days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      const start = d.toISOString().slice(0, 10);
      return {
        startDate: start,
        endDate: todayStr,
        periodTitle: `Laporan Transaksi 30 Hari Terakhir (${start} s/d ${todayStr})`,
      };
    }
    if (period === 'month') {
      const start = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-01`;
      return {
        startDate: start,
        endDate: todayStr,
        periodTitle: `Laporan Transaksi Bulan ${monthNames[curMonth]} ${curYear}`,
      };
    }
    if (period === 'year') {
      const start = `${curYear}-01-01`;
      return {
        startDate: start,
        endDate: todayStr,
        periodTitle: `Laporan Keuangan & Transaksi Tahun ${curYear}`,
      };
    }
    if (period === 'custom') {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
        periodTitle: `Laporan Transaksi Periode ${customStartDate || 'Awal'} s/d ${customEndDate || 'Akhir'}`,
      };
    }
    return {
      startDate: undefined,
      endDate: undefined,
      periodTitle: 'Laporan Seluruh Riwayat Transaksi FinTrack',
    };
  }, [period, todayStr, customStartDate, customEndDate]);

  // Compute matching transactions for preview
  const previewTransactions = useMemo(() => {
    let list = [...transactions];
    if (startDate) list = list.filter(t => t.transactionDate >= startDate);
    if (endDate) list = list.filter(t => t.transactionDate <= endDate);
    if (selectedAccountId !== 'all') list = list.filter(t => t.accountId === selectedAccountId);
    if (selectedType !== 'all') list = list.filter(t => t.type === selectedType);
    return list;
  }, [transactions, startDate, endDate, selectedAccountId, selectedType]);

  const previewIncome = useMemo(() => 
    previewTransactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    [previewTransactions]
  );

  const previewExpense = useMemo(() => 
    previewTransactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    [previewTransactions]
  );

  const netSavings = previewIncome - previewExpense;

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      setIsExporting(true);
      exportFinancialReportPDF({
        user,
        accounts,
        transactions,
        categoryBudgets,
        periodTitle,
        startDate,
        endDate,
        accountId: selectedAccountId,
        typeFilter: selectedType,
        includeAccountsSummary,
        includeCategoryBreakdown,
        includeReceiptNumber,
      });

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsExporting(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="export-pdf-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Ekspor Riwayat Transaksi ke PDF
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Unduh rekap mutasi lengkap berstandar dokumen resmi
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Period Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Pilih Periode Waktu
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'month', label: 'Bulan Ini' },
                { id: 'today', label: 'Hari Ini' },
                { id: 'week', label: '7 Hari' },
                { id: '30days', label: '30 Hari' },
                { id: 'year', label: 'Tahun Ini' },
                { id: 'all', label: 'Semua' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as PeriodType)}
                  className={`py-2 px-2.5 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    period === p.id
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Range Button */}
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`w-full py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  period === 'custom'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Rentang Tanggal Kustom</span>
              </button>
            </div>

            {/* Custom Dates Inputs */}
            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-150">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filters: Account & Type */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Sumber Rekening
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
              >
                <option value="all">Semua Rekening & Dompet</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Arus Transaksi
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
              >
                <option value="all">Semua Arus (Masuk & Keluar)</option>
                <option value="income">Pemasukan Saja (+)</option>
                <option value="expense">Pengeluaran Saja (-)</option>
              </select>
            </div>
          </div>

          {/* Report Sections Customization Checkboxes */}
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Bagian Dokumen Yang Disertakan
            </span>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeReceiptNumber}
                onChange={(e) => setIncludeReceiptNumber(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
              />
              <span>Sertakan Kolom Nomor Resi Transaksi Resmi</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAccountsSummary}
                onChange={(e) => setIncludeAccountsSummary(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
              />
              <span>Sertakan Tabel Ringkasan Rekening & Saldo</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCategoryBreakdown}
                onChange={(e) => setIncludeCategoryBreakdown(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
              />
              <span>Sertakan Analisis Distribusi Pos Pengeluaran & Anggaran</span>
            </label>
          </div>

          {/* Live Data Summary Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Data Siap Diekspor
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono">
                {previewTransactions.length} Transaksi
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-500/20 text-center">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Masuk</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs truncate block">
                  +{formatRupiah(previewIncome)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Keluar</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs truncate block">
                  -{formatRupiah(previewExpense)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Arus Bersih</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate block">
                  {formatRupiah(netSavings)}
                </span>
              </div>
            </div>

            {previewTransactions.length === 0 && (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Tidak ada transaksi pada filter ini. PDF akan mencetak dokumen kosong.</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            id="download-pdf-confirm-btn"
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className={`py-2.5 px-5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 ${
              exportSuccess
                ? 'bg-emerald-600'
                : 'bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500'
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Dokumen PDF Berhasil Dibuat!</span>
              </>
            ) : isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Unduh Dokumen PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPdfModal;
