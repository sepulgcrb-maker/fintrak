import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  ChevronDown, 
  Building2,
  Filter
} from 'lucide-react';
import { FinancialPeriod } from '../../types';
import { useApp } from '../../context/AppContext';
import { DateFilterRange } from '../../utils/financialCalculations';
import { 
  exportFinancialSuitePDF, 
  exportFinancialSuiteExcel, 
  exportFinancialSuiteCSV, 
  triggerPrintFinancialReport, 
  FinancialExportData 
} from '../../utils/financialExport';

export interface FinancialHeaderProps {
  currentPeriod?: FinancialPeriod;
  onPeriodChange?: (p: FinancialPeriod) => void;
  dateRange?: DateFilterRange;
  periodLabel?: string;
  customStartDate?: string;
  customEndDate?: string;
  onCustomStartChange?: (d: string) => void;
  onCustomEndChange?: (d: string) => void;
  exportData?: FinancialExportData;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  periodType?: string;
  setPeriodType?: (p: any) => void;
  selectedYear?: number;
  setSelectedYear?: (y: number) => void;
  selectedMonth?: number;
  setSelectedMonth?: (m: number) => void;
  setCustomStartDate?: (d: string) => void;
  setCustomEndDate?: (d: string) => void;
}

export const FinancialHeader: React.FC<FinancialHeaderProps> = ({
  currentPeriod,
  onPeriodChange,
  dateRange,
  periodLabel,
  customStartDate = '',
  customEndDate = '',
  onCustomStartChange,
  onCustomEndChange,
  exportData,
  onExportPdf,
  onExportExcel,
  onExportCsv,
  periodType,
  setPeriodType,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  setCustomStartDate,
  setCustomEndDate,
}) => {
  const { user } = useApp();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const activePeriod: FinancialPeriod = (currentPeriod as FinancialPeriod) || 
    (periodType === 'monthly' ? 'month' : 
     periodType === 'quarterly' ? 'quarter' : 
     periodType === 'yearly' ? 'year' : 
     periodType === 'custom' ? 'custom' : 
     (periodType as FinancialPeriod)) || 'month';

  const handlePeriodChange = (p: FinancialPeriod) => {
    if (onPeriodChange) onPeriodChange(p);
    if (setPeriodType) {
      if (p === 'month') setPeriodType('monthly');
      else if (p === 'quarter') setPeriodType('quarterly');
      else if (p === 'year') setPeriodType('yearly');
      else setPeriodType(p);
    }
  };

  const handleCustomStart = (val: string) => {
    if (onCustomStartChange) onCustomStartChange(val);
    if (setCustomStartDate) setCustomStartDate(val);
  };

  const handleCustomEnd = (val: string) => {
    if (onCustomEndChange) onCustomEndChange(val);
    if (setCustomEndDate) setCustomEndDate(val);
  };

  const displayPeriodLabel = dateRange?.label || periodLabel || 'Bulan Ini';

  const handleExportPDF = () => {
    setIsExporting('pdf');
    try {
      if (onExportPdf) {
        onExportPdf();
      } else if (exportData) {
        exportFinancialSuitePDF(exportData);
      }
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  const handleExportExcel = () => {
    setIsExporting('excel');
    try {
      if (onExportExcel) {
        onExportExcel();
      } else if (exportData) {
        exportFinancialSuiteExcel(exportData);
      }
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  const handleExportCSV = () => {
    setIsExporting('csv');
    try {
      if (onExportCsv) {
        onExportCsv();
      } else if (exportData) {
        exportFinancialSuiteCSV(exportData);
      }
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3">
      {/* Title & Organization Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Modul Laporan Keuangan
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.businessName || 'Sistem Keuangan Terpadu'} • Standar PSAK & Pajak
              </p>
            </div>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors"
            title="Download PDF Laporan Resmi"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 transition-colors"
            title="Download Spreadsheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            disabled={isExporting !== null}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900 transition-colors"
            title="Download Data CSV"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            id="btn-print-report"
            onClick={triggerPrintFinancialReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Cetak Laporan / Print Preview"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Filter Periode Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            id="filter-today"
            onClick={() => handlePeriodChange('today')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activePeriod === 'today'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            id="filter-week"
            onClick={() => handlePeriodChange('week')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activePeriod === 'week'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            id="filter-month"
            onClick={() => handlePeriodChange('month')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activePeriod === 'month'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bulan Ini
          </button>
          <button
            id="filter-quarter"
            onClick={() => handlePeriodChange('quarter')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activePeriod === 'quarter'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Kuartal
          </button>
          <button
            id="filter-year"
            onClick={() => handlePeriodChange('year')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activePeriod === 'year'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tahun
          </button>
          <button
            id="filter-custom"
            onClick={() => {
              handlePeriodChange('custom');
              setShowCustomModal(!showCustomModal);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              activePeriod === 'custom'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Kustom</span>
          </button>
        </div>

        {/* Date Range Badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{displayPeriodLabel}</span>
        </div>
      </div>

      {/* Custom Date Pickers (Shown if activePeriod === 'custom' or toggled) */}
      {activePeriod === 'custom' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Mulai:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => handleCustomStart(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Sampai:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => handleCustomEnd(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <span className="text-xs text-slate-400">Data laporan otomatis diperbarui sesuai rentang tanggal ini.</span>
        </div>
      )}
    </header>
  );
};
