import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  ProfitAndLossReport, 
  BalanceSheetReport, 
  CashFlowReport, 
  TaxReport, 
  BudgetRealizationItem 
} from './financialCalculations';
import { Receivable, Payable, JournalEntry, UserProfile } from '../types';
import { formatRupiah, formatDateIndonesian } from './formatters';

export interface FinancialExportData {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  generatedDate: string;
  pnl?: ProfitAndLossReport;
  balanceSheet?: BalanceSheetReport;
  cashFlow?: CashFlowReport;
  taxReport?: TaxReport;
  receivables?: Receivable[];
  payables?: Payable[];
  journalEntries?: JournalEntry[];
  budgets?: BudgetRealizationItem[];
}

// 1. EXPORT TO PDF
export const exportFinancialSuitePDF = (data: FinancialExportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header / Letterhead
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName.toUpperCase(), 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`MODUL SISTEM KEUANGAN & AKUNTANSI TERPADU (FINTRACK)`, 14, 18);
  doc.text(`Dicetak: ${data.generatedDate}`, 14, 23);

  let currentY = 36;

  // Title Block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.reportTitle, 14, currentY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode Laporan: ${data.periodLabel}`, 14, currentY + 6);

  currentY += 14;

  // LABA RUGI TABLE IF AVAILABLE
  if (data.pnl) {
    const pnlRows = [
      ['PENDAPATAN USAHA (REVENUE)', formatRupiah(data.pnl.grossRevenue), '100%'],
      ...data.pnl.revenueBreakdown.map(r => [`  - ${r.category}`, formatRupiah(r.amount), `${((r.amount / (data.pnl!.grossRevenue || 1)) * 100).toFixed(1)}%`]),
      ['HARGA POKOK PENJUALAN (HPP/COGS)', `(${formatRupiah(data.pnl.cogs)})`, `${((data.pnl.cogs / (data.pnl.grossRevenue || 1)) * 100).toFixed(1)}%`],
      ['LABA KOTOR (GROSS PROFIT)', formatRupiah(data.pnl.grossProfit), `${((data.pnl.grossProfit / (data.pnl.grossRevenue || 1)) * 100).toFixed(1)}%`],
      ['BEBAN OPERASIONAL', `(${formatRupiah(data.pnl.operatingExpenses)})`, `${((data.pnl.operatingExpenses / (data.pnl.grossRevenue || 1)) * 100).toFixed(1)}%`],
      ...data.pnl.operatingExpensesBreakdown.map(o => [`  - ${o.category}`, `(${formatRupiah(o.amount)})`, '']),
      ['BEBAN LAIN-LAIN', `(${formatRupiah(data.pnl.otherExpenses)})`, ''],
      ['LABA BERSIH BERJALAN (NET PROFIT)', formatRupiah(data.pnl.netProfit), `${((data.pnl.netProfit / (data.pnl.grossRevenue || 1)) * 100).toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Komponen Laba Rugi', 'Nominal (Rp)', 'Rasio']],
      body: pnlRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // NERACA IF AVAILABLE
  if (data.balanceSheet) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Ringkasan Neraca Keuangan (Balance Sheet)', 14, currentY);
    currentY += 4;

    const bsRows = [
      ['ASET LANCAR (Kas, Bank, Piutang, Persediaan)', formatRupiah(data.balanceSheet.currentAssets.total)],
      ['  - Kas & Bank', formatRupiah(data.balanceSheet.currentAssets.cashAndBank)],
      ['  - Piutang Usaha (AR)', formatRupiah(data.balanceSheet.currentAssets.accountsReceivable)],
      ['  - Persediaan & Perlengkapan', formatRupiah(data.balanceSheet.currentAssets.suppliesInventory)],
      ['ASET TETAP (Peralatan, Kendaraan, Akumulasi)', formatRupiah(data.balanceSheet.fixedAssets.total)],
      ['TOTAL ASET', formatRupiah(data.balanceSheet.totalAssets)],
      ['LIABILITAS / KEWAJIBAN (Hutang Usaha, Pajak, Pinjaman)', formatRupiah(data.balanceSheet.liabilities.total)],
      ['EKUITAS / MODAL (Modal Pemilik, Laba Ditahan, Laba Berjalan)', formatRupiah(data.balanceSheet.equity.total)],
      ['TOTAL LIABILITAS & EKUITAS', formatRupiah(data.balanceSheet.totalLiabilitiesAndEquity)],
      ['STATUS PERSAMAAN AKUNTANSI (A = L + E)', data.balanceSheet.isBalanced ? 'SEIMBANG (BALANCED)' : 'SELISIH']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Akun Neraca', 'Jumlah (IDR)']],
      body: bsRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // PIUTANG & HUTANG OVERVIEW
  if (data.receivables && data.receivables.length > 0) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Daftar Piutang Usaha (Accounts Receivable)', 14, currentY);
    currentY += 4;

    const recRows = data.receivables.map(r => [
      r.invoiceNumber,
      r.customerName,
      r.dueDate,
      formatRupiah(r.amount),
      formatRupiah(r.amount - r.paidAmount),
      r.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['No. Inv', 'Pelanggan', 'Jatuh Tempo', 'Total', 'Outstanding', 'Status']],
      body: recRows,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Resmi Sistem FinTrack • Halaman ${i} dari ${totalPages} • Bersifat Rahasia`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  const filename = `Laporan_Keuangan_${data.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

// 2. EXPORT TO EXCEL (.xlsx)
export const exportFinancialSuiteExcel = (data: FinancialExportData) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan & Laba Rugi
  if (data.pnl) {
    const pnlData = [
      ['LAPORAN LABA RUGI'],
      ['Perusahaan:', data.companyName],
      ['Periode:', data.periodLabel],
      ['Tanggal Ekspor:', data.generatedDate],
      [],
      ['Komponen', 'Nominal (Rp)'],
      ['Pendapatan Usaha', data.pnl.grossRevenue],
      ['Harga Pokok Penjualan (HPP)', data.pnl.cogs],
      ['Laba Kotor (Gross Profit)', data.pnl.grossProfit],
      ['Beban Operasional', data.pnl.operatingExpenses],
      ['Beban Lain-lain', data.pnl.otherExpenses],
      ['Laba Bersih Berjalan', data.pnl.netProfit],
      [],
      ['Rincian Pendapatan:']
    ];

    data.pnl.revenueBreakdown.forEach(r => {
      pnlData.push([`  - ${r.category}`, r.amount]);
    });

    pnlData.push([], ['Rincian Beban Operasional:']);
    data.pnl.operatingExpensesBreakdown.forEach(o => {
      pnlData.push([`  - ${o.category}`, o.amount]);
    });

    const wsPnl = XLSX.utils.aoa_to_sheet(pnlData);
    XLSX.utils.book_append_sheet(wb, wsPnl, 'Laba Rugi');
  }

  // Sheet 2: Neraca (Balance Sheet)
  if (data.balanceSheet) {
    const bsData = [
      ['NERACA KEUANGAN (BALANCE SHEET)'],
      ['Perusahaan:', data.companyName],
      ['Periode:', data.periodLabel],
      [],
      ['Akun', 'Nominal (Rp)'],
      ['Aset Lancar - Kas & Bank', data.balanceSheet.currentAssets.cashAndBank],
      ['Aset Lancar - Piutang Usaha', data.balanceSheet.currentAssets.accountsReceivable],
      ['Aset Lancar - Persediaan', data.balanceSheet.currentAssets.suppliesInventory],
      ['TOTAL ASET LANCAR', data.balanceSheet.currentAssets.total],
      [],
      ['Aset Tetap - Peralatan', data.balanceSheet.fixedAssets.equipment],
      ['Aset Tetap - Kendaraan', data.balanceSheet.fixedAssets.vehicles],
      ['Akumulasi Penyusutan', data.balanceSheet.fixedAssets.accumulatedDepreciation],
      ['TOTAL ASET TETAP', data.balanceSheet.fixedAssets.total],
      ['TOTAL ASET KESELURUHAN', data.balanceSheet.totalAssets],
      [],
      ['Liabilitas - Hutang Usaha', data.balanceSheet.liabilities.accountsPayable],
      ['Liabilitas - Pajak Terutang', data.balanceSheet.liabilities.taxPayable],
      ['Liabilitas - Pinjaman Bank', data.balanceSheet.liabilities.bankLoan],
      ['TOTAL LIABILITAS', data.balanceSheet.liabilities.total],
      [],
      ['Ekuitas - Modal Pemilik', data.balanceSheet.equity.ownerCapital],
      ['Ekuitas - Laba Ditahan', data.balanceSheet.equity.retainedEarnings],
      ['Ekuitas - Laba Berjalan', data.balanceSheet.equity.currentNetProfit],
      ['TOTAL EKUITAS', data.balanceSheet.equity.total],
      ['TOTAL LIABILITAS & EKUITAS', data.balanceSheet.totalLiabilitiesAndEquity],
      ['Status Keseimbangan:', data.balanceSheet.isBalanced ? 'SEIMBANG' : 'SELISIH']
    ];

    const wsBs = XLSX.utils.aoa_to_sheet(bsData);
    XLSX.utils.book_append_sheet(wb, wsBs, 'Neraca');
  }

  // Sheet 3: Arus Kas
  if (data.cashFlow) {
    const cfData = [
      ['LAPORAN ARUS KAS (CASH FLOW)'],
      ['Perusahaan:', data.companyName],
      ['Periode:', data.periodLabel],
      [],
      ['Aktivitas', 'Kas Masuk', 'Kas Keluar', 'Arus Kas Bersih'],
      ['Aktivitas Operasional', data.cashFlow.operatingCashIn, data.cashFlow.operatingCashOut, data.cashFlow.netOperatingCashFlow],
      ['Aktivitas Investasi', data.cashFlow.investingCashIn, data.cashFlow.investingCashOut, data.cashFlow.netInvestingCashFlow],
      ['Aktivitas Pendanaan', data.cashFlow.financingCashIn, data.cashFlow.financingCashOut, data.cashFlow.netFinancingCashFlow],
      [],
      ['Kenaikan/(Penurunan) Kas Bersih', '', '', data.cashFlow.netCashChange],
      ['Saldo Kas Awal Periode', '', '', data.cashFlow.startingCash],
      ['Saldo Kas Akhir Periode', '', '', data.cashFlow.endingCash],
    ];

    const wsCf = XLSX.utils.aoa_to_sheet(cfData);
    XLSX.utils.book_append_sheet(wb, wsCf, 'Arus Kas');
  }

  // Sheet 4: Piutang
  if (data.receivables && data.receivables.length > 0) {
    const recData = [
      ['DAFTAR PIUTANG USAHA (ACCOUNTS RECEIVABLE)'],
      ['No. Invoice', 'Pelanggan', 'Tanggal', 'Jatuh Tempo', 'Nominal', 'Terbayar', 'Sisa Tagihan', 'Status', 'Cabang', 'Keterangan'],
      ...data.receivables.map(r => [
        r.invoiceNumber,
        r.customerName,
        r.date,
        r.dueDate,
        r.amount,
        r.paidAmount,
        r.amount - r.paidAmount,
        r.status,
        r.branch || '-',
        r.notes || ''
      ])
    ];
    const wsRec = XLSX.utils.aoa_to_sheet(recData);
    XLSX.utils.book_append_sheet(wb, wsRec, 'Piutang');
  }

  // Sheet 5: Hutang
  if (data.payables && data.payables.length > 0) {
    const payData = [
      ['DAFTAR HUTANG USAHA (ACCOUNTS PAYABLE)'],
      ['No. Faktur', 'Vendor/Supplier', 'Tanggal', 'Jatuh Tempo', 'Nominal', 'Terbayar', 'Sisa Hutang', 'Status', 'Departemen', 'Keterangan'],
      ...data.payables.map(p => [
        p.billNumber,
        p.vendorName,
        p.date,
        p.dueDate,
        p.amount,
        p.paidAmount,
        p.amount - p.paidAmount,
        p.status,
        p.department || '-',
        p.notes || ''
      ])
    ];
    const wsPay = XLSX.utils.aoa_to_sheet(payData);
    XLSX.utils.book_append_sheet(wb, wsPay, 'Hutang');
  }

  // Sheet 6: Jurnal Umum
  if (data.journalEntries && data.journalEntries.length > 0) {
    const jrnRows: any[][] = [
      ['JURNAL UMUM (GENERAL JOURNAL)'],
      ['No. Jurnal', 'Tanggal', 'Keterangan', 'Kode Akun', 'Nama Akun', 'Debit (Rp)', 'Kredit (Rp)']
    ];

    data.journalEntries.forEach(entry => {
      entry.lines.forEach((line, idx) => {
        jrnRows.push([
          idx === 0 ? entry.entryNumber : '',
          idx === 0 ? entry.date : '',
          idx === 0 ? entry.description : '',
          line.accountCode,
          line.accountName,
          line.debit,
          line.credit
        ]);
      });
    });

    const wsJrn = XLSX.utils.aoa_to_sheet(jrnRows);
    XLSX.utils.book_append_sheet(wb, wsJrn, 'Jurnal Umum');
  }

  const filename = `Laporan_Keuangan_${data.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};

// 3. EXPORT TO CSV
export const exportFinancialSuiteCSV = (data: FinancialExportData) => {
  let csvContent = `LAPORAN KEUANGAN FINTRACK - ${data.companyName}\n`;
  csvContent += `Periode: ${data.periodLabel}\n`;
  csvContent += `Tanggal Cetak: ${data.generatedDate}\n\n`;

  if (data.pnl) {
    csvContent += `=== LAPORAN LABA RUGI ===\n`;
    csvContent += `Komponen,Nominal (IDR)\n`;
    csvContent += `Pendapatan Usaha,${data.pnl.grossRevenue}\n`;
    csvContent += `Harga Pokok Penjualan (HPP),${data.pnl.cogs}\n`;
    csvContent += `Laba Kotor,${data.pnl.grossProfit}\n`;
    csvContent += `Beban Operasional,${data.pnl.operatingExpenses}\n`;
    csvContent += `Beban Lain-lain,${data.pnl.otherExpenses}\n`;
    csvContent += `Laba Bersih,${data.pnl.netProfit}\n\n`;
  }

  if (data.balanceSheet) {
    csvContent += `=== NERACA (BALANCE SHEET) ===\n`;
    csvContent += `Total Aset,${data.balanceSheet.totalAssets}\n`;
    csvContent += `Total Liabilitas,${data.balanceSheet.liabilities.total}\n`;
    csvContent += `Total Ekuitas,${data.balanceSheet.equity.total}\n\n`;
  }

  if (data.receivables) {
    csvContent += `=== PIUTANG USAHA ===\n`;
    csvContent += `No. Invoice,Pelanggan,Jatuh Tempo,Total,Outstanding,Status\n`;
    data.receivables.forEach(r => {
      csvContent += `"${r.invoiceNumber}","${r.customerName}","${r.dueDate}",${r.amount},${r.amount - r.paidAmount},"${r.status}"\n`;
    });
    csvContent += `\n`;
  }

  if (data.payables) {
    csvContent += `=== HUTANG USAHA ===\n`;
    csvContent += `No. Faktur,Vendor,Jatuh Tempo,Total,Outstanding,Status\n`;
    data.payables.forEach(p => {
      csvContent += `"${p.billNumber}","${p.vendorName}","${p.dueDate}",${p.amount},${p.amount - p.paidAmount},"${p.status}"\n`;
    });
    csvContent += `\n`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Keuangan_${data.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 4. PRINT REPORT TRIGGER
export const triggerPrintFinancialReport = () => {
  window.print();
};

export interface GenericExportOptions {
  type?: string;
  periodLabel: string;
  companyName: string;
  pnl?: ProfitAndLossReport;
  balanceSheet?: BalanceSheetReport;
  cashFlow?: CashFlowReport;
  tax?: TaxReport;
  taxReport?: TaxReport;
  receivables?: Receivable[];
  payables?: Payable[];
  journalEntries?: JournalEntry[];
  budgets?: BudgetRealizationItem[];
}

export const exportFinancialReportToPdf = (options: GenericExportOptions) => {
  return exportFinancialSuitePDF({
    companyName: options.companyName || 'FinTrack Enterprise',
    reportTitle: options.type ? `Laporan ${options.type.toUpperCase()}` : 'Laporan Keuangan Komprehensif',
    periodLabel: options.periodLabel,
    generatedDate: new Date().toLocaleDateString('id-ID'),
    pnl: options.pnl,
    balanceSheet: options.balanceSheet,
    cashFlow: options.cashFlow,
    taxReport: options.tax || options.taxReport,
    receivables: options.receivables,
    payables: options.payables,
    journalEntries: options.journalEntries,
    budgets: options.budgets,
  });
};

export const exportFinancialReportToExcel = (options: GenericExportOptions) => {
  return exportFinancialSuiteExcel({
    companyName: options.companyName || 'FinTrack Enterprise',
    reportTitle: options.type ? `Laporan ${options.type.toUpperCase()}` : 'Laporan Keuangan Komprehensif',
    periodLabel: options.periodLabel,
    generatedDate: new Date().toLocaleDateString('id-ID'),
    pnl: options.pnl,
    balanceSheet: options.balanceSheet,
    cashFlow: options.cashFlow,
    taxReport: options.tax || options.taxReport,
    receivables: options.receivables,
    payables: options.payables,
    journalEntries: options.journalEntries,
    budgets: options.budgets,
  });
};

export const exportFinancialReportToCsv = (options: GenericExportOptions) => {
  return exportFinancialSuiteCSV({
    companyName: options.companyName || 'FinTrack Enterprise',
    reportTitle: options.type ? `Laporan ${options.type.toUpperCase()}` : 'Laporan Keuangan Komprehensif',
    periodLabel: options.periodLabel,
    generatedDate: new Date().toLocaleDateString('id-ID'),
    pnl: options.pnl,
    balanceSheet: options.balanceSheet,
    cashFlow: options.cashFlow,
    taxReport: options.tax || options.taxReport,
    receivables: options.receivables,
    payables: options.payables,
    journalEntries: options.journalEntries,
    budgets: options.budgets,
  });
};
