import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Account, UserProfile, CategoryBudget } from '../types';
import { getReceiptNumber } from './receipt';

export interface PDFExportOptions {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  categoryBudgets: CategoryBudget[];
  periodTitle?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  typeFilter?: 'all' | 'income' | 'expense';
  statusFilter?: 'all' | 'completed' | 'pending' | 'scheduled';
  includeAccountsSummary?: boolean;
  includeCategoryBreakdown?: boolean;
  includeReceiptNumber?: boolean;
}

export const exportFinancialReportPDF = ({
  user,
  accounts,
  transactions,
  categoryBudgets,
  periodTitle = 'Laporan Keuangan & Riwayat Transaksi',
  startDate,
  endDate,
  accountId,
  typeFilter = 'all',
  statusFilter = 'all',
  includeAccountsSummary = true,
  includeCategoryBreakdown = true,
  includeReceiptNumber = true,
}: PDFExportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // 1. Filter transactions based on criteria
  let filteredTx = [...transactions];
  if (startDate) {
    filteredTx = filteredTx.filter((t) => t.transactionDate >= startDate);
  }
  if (endDate) {
    filteredTx = filteredTx.filter((t) => t.transactionDate <= endDate);
  }
  if (accountId && accountId !== 'all') {
    filteredTx = filteredTx.filter((t) => t.accountId === accountId);
  }
  if (typeFilter && typeFilter !== 'all') {
    filteredTx = filteredTx.filter((t) => t.type === typeFilter);
  }
  if (statusFilter && statusFilter !== 'all') {
    filteredTx = filteredTx.filter((t) => t.status === statusFilter);
  }

  // Calculate statistics from filtered transactions
  const completedTx = filteredTx.filter((t) => t.status === 'completed');
  const totalIncome = completedTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = completedTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;
  
  // Total balance of relevant accounts
  const relevantAccounts = accountId && accountId !== 'all' 
    ? accounts.filter(a => a.id === accountId)
    : accounts;
  const totalBalance = relevantAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Category breakdown for expenses
  const categoryExpenseMap: { [cat: string]: number } = {};
  completedTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryExpenseMap[t.category] = (categoryExpenseMap[t.category] || 0) + t.amount;
    });

  // 1. Header Banner
  doc.setFillColor(16, 185, 129); // Emerald color
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('FINTRACK - LAPORAN KEUANGAN & TRANSAKSI', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(
    `Pemilik/Usaha: ${user.businessName || user.name} | Tanggal Cetak: ${printDateStr}`,
    margin,
    20
  );

  let currentY = 35;

  // 2. Metadata / Period Info
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(periodTitle, margin, currentY);
  currentY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const dateRangeStr =
    startDate && endDate
      ? `Rentang Tanggal: ${startDate} s/d ${endDate} | Total: ${filteredTx.length} Transaksi Tercatat`
      : startDate
      ? `Mulai Tanggal: ${startDate} | Total: ${filteredTx.length} Transaksi Tercatat`
      : endDate
      ? `Sampai Tanggal: ${endDate} | Total: ${filteredTx.length} Transaksi Tercatat`
      : `Periode: Seluruh Riwayat Transaksi | Total: ${filteredTx.length} Transaksi Tercatat`;
  doc.text(dateRangeStr, margin, currentY);
  currentY += 7.5;

  // 3. Summary KPI Cards
  const cardGap = 3;
  const cardWidth = (pageWidth - margin * 2 - cardGap * 3) / 4;
  const cardHeight = 17;

  const kpis = [
    { label: 'Total Saldo', value: `Rp ${totalBalance.toLocaleString('id-ID')}`, color: [16, 185, 129] },
    { label: 'Pemasukan', value: `+Rp ${totalIncome.toLocaleString('id-ID')}`, color: [16, 185, 129] },
    { label: 'Pengeluaran', value: `-Rp ${totalExpense.toLocaleString('id-ID')}`, color: [239, 68, 68] },
    {
      label: 'Arus Kas Bersih',
      value: `${netCashFlow >= 0 ? '+' : ''}Rp ${netCashFlow.toLocaleString('id-ID')}`,
      color: netCashFlow >= 0 ? [16, 185, 129] : [239, 68, 68],
    },
  ];

  kpis.forEach((kpi, index) => {
    const x = margin + index * (cardWidth + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 2.5, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 2.5, currentY + 12);
  });

  currentY += cardHeight + 7;

  // 4. Accounts Summary Table (if enabled)
  if (includeAccountsSummary && relevantAccounts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Ringkasan Rekening & Dompet', margin, currentY);
    currentY += 2.5;

    const accountRows = relevantAccounts.map((acc) => [
      acc.name,
      acc.type.toUpperCase(),
      acc.accountNumber || '-',
      `Rp ${acc.balance.toLocaleString('id-ID')}`,
      acc.isActive ? 'Aktif' : 'Nonaktif',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Nama Akun / Dompet', 'Tipe', 'No. Rekening', 'Saldo Saat Ini', 'Status']],
      body: accountRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;
  }

  // 5. Category Spending Breakdown Table (if enabled)
  const categoryKeys = Object.keys(categoryExpenseMap).sort(
    (a, b) => categoryExpenseMap[b] - categoryExpenseMap[a]
  );

  if (includeCategoryBreakdown && categoryKeys.length > 0) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Distribusi Pos Pengeluaran', margin, currentY);
    currentY += 2.5;

    const catRows = categoryKeys.map((cat) => {
      const amount = categoryExpenseMap[cat];
      const percentage = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) + '%' : '0%';
      const budgetObj = categoryBudgets.find((b) => b.category === cat);
      const budgetLimit = budgetObj && budgetObj.enabled && budgetObj.monthlyThreshold > 0
        ? `Rp ${budgetObj.monthlyThreshold.toLocaleString('id-ID')}`
        : 'Tidak Diatur';
      const statusStr = budgetObj && budgetObj.enabled && budgetObj.monthlyThreshold > 0 && amount > budgetObj.monthlyThreshold
        ? 'OVERBUDGET'
        : 'Aman';

      return [cat, `Rp ${amount.toLocaleString('id-ID')}`, percentage, budgetLimit, statusStr];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Kategori Pengeluaran', 'Total Pengeluaran', 'Persentase', 'Batas Anggaran', 'Status']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.cell.raw === 'OVERBUDGET') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;
  }

  // 6. Detailed Transaction History Table
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rincian Mutasi & Riwayat Transaksi (${filteredTx.length} Catatan)`, margin, currentY);
  currentY += 2.5;

  const getAccountName = (id: string) => {
    const a = accounts.find((acc) => acc.id === id);
    return a ? a.name : '-';
  };

  const headers = includeReceiptNumber
    ? [['Tanggal', 'No. Resi', 'Keterangan', 'Kategori', 'Akun/Dompet', 'Arus', 'Nominal', 'Status']]
    : [['Tanggal', 'Keterangan', 'Kategori', 'Akun/Dompet', 'Arus', 'Nominal', 'Status']];

  const txRows = filteredTx.map((t) => {
    const receiptNum = getReceiptNumber(t);
    const amountStr = `${t.type === 'income' ? '+' : '-'}Rp ${t.amount.toLocaleString('id-ID')}`;
    const statusStr = t.status === 'completed' ? 'Selesai' : t.status === 'scheduled' ? 'Terjadwal' : 'Menunggu';
    const accName = getAccountName(t.accountId);
    const flowStr = t.type === 'income' ? 'Masuk' : 'Keluar';

    if (includeReceiptNumber) {
      return [
        t.transactionDate,
        receiptNum,
        t.description,
        t.category,
        accName,
        flowStr,
        amountStr,
        statusStr,
      ];
    }

    return [
      t.transactionDate,
      t.description,
      t.category,
      accName,
      flowStr,
      amountStr,
      statusStr,
    ];
  });

  const columnStylesConfig = includeReceiptNumber
    ? {
        0: { cellWidth: 17 }, // Tanggal
        1: { cellWidth: 26, fontStyle: 'bold' as const }, // No. Resi
        2: { cellWidth: 'auto' as const }, // Keterangan
        3: { cellWidth: 23 }, // Kategori
        4: { cellWidth: 24 }, // Akun
        5: { cellWidth: 13, halign: 'center' as const }, // Arus
        6: { cellWidth: 25, halign: 'right' as const, fontStyle: 'bold' as const }, // Nominal
        7: { cellWidth: 15, halign: 'center' as const }, // Status
      }
    : {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' as const },
        2: { cellWidth: 26 },
        3: { cellWidth: 28 },
        4: { cellWidth: 15, halign: 'center' as const },
        5: { cellWidth: 28, halign: 'right' as const, fontStyle: 'bold' as const },
        6: { cellWidth: 18, halign: 'center' as const },
      };

  const amountColIndex = includeReceiptNumber ? 6 : 5;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: headers,
    body: txRows,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
    },
    columnStyles: columnStylesConfig,
    didParseCell: (data) => {
      if (data.column.index === amountColIndex) {
        const raw = String(data.cell.raw);
        if (raw.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (raw.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  // 7. Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FinTrack Pro - Dokumen Laporan & Riwayat Transaksi Resmi | Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Save the PDF
  const cleanName = (user.businessName || user.name || 'FinTrack').replace(/[^a-zA-Z0-9]/g, '_');
  const dateSuffix = new Date().toISOString().slice(0, 10);
  const filename = `FinTrack_Laporan_Transaksi_${cleanName}_${dateSuffix}.pdf`;
  doc.save(filename);
};

