import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Account, UserProfile, CategoryBudget } from '../types';

export interface PDFExportOptions {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  categoryBudgets: CategoryBudget[];
  periodTitle?: string;
  startDate?: string;
  endDate?: string;
  includeAccountsSummary?: boolean;
}

export const exportFinancialReportPDF = ({
  user,
  accounts,
  transactions,
  categoryBudgets,
  periodTitle = 'Laporan Keuangan & Riwayat Transaksi',
  startDate,
  endDate,
  includeAccountsSummary = true,
}: PDFExportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Filter transactions by date if provided
  let filteredTx = [...transactions];
  if (startDate) {
    filteredTx = filteredTx.filter((t) => t.transactionDate >= startDate);
  }
  if (endDate) {
    filteredTx = filteredTx.filter((t) => t.transactionDate <= endDate);
  }

  // Calculate statistics
  const completedTx = filteredTx.filter((t) => t.status === 'completed');
  const totalIncome = completedTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = completedTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

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
  doc.setFontSize(16);
  doc.text('FINTRACK PRO - LAPORAN KEUANGAN', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Bisnis/Pengguna: ${user.businessName || user.name} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    margin,
    20
  );

  let currentY = 36;

  // 2. Metadata / Period Info
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(periodTitle, margin, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const dateRangeStr =
    startDate && endDate
      ? `Periode: ${startDate} s/d ${endDate}`
      : startDate
      ? `Dari: ${startDate}`
      : endDate
      ? `Sampai: ${endDate}`
      : 'Periode: Seluruh Riwayat Transaksi Tercatat';
  doc.text(dateRangeStr, margin, currentY);
  currentY += 8;

  // 3. Summary KPI Cards
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  const kpis = [
    { label: 'Total Saldo', value: `Rp ${totalBalance.toLocaleString('id-ID')}`, color: [16, 185, 129] },
    { label: 'Total Pemasukan', value: `Rp ${totalIncome.toLocaleString('id-ID')}`, color: [16, 185, 129] },
    { label: 'Total Pengeluaran', value: `Rp ${totalExpense.toLocaleString('id-ID')}`, color: [239, 68, 68] },
    {
      label: 'Arus Kas Bersih',
      value: `${netCashFlow >= 0 ? '+' : ''}Rp ${netCashFlow.toLocaleString('id-ID')}`,
      color: netCashFlow >= 0 ? [16, 185, 129] : [239, 68, 68],
    },
  ];

  kpis.forEach((kpi, index) => {
    const x = margin + index * (cardWidth + 3);
    // Background card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, currentY + 5.5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3, currentY + 13);
  });

  currentY += cardHeight + 8;

  // 4. Accounts Summary Table (if enabled)
  if (includeAccountsSummary && accounts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Ringkasan Rekening & Dompet', margin, currentY);
    currentY += 3;

    const accountRows = accounts.map((acc) => [
      acc.name,
      acc.type.toUpperCase(),
      acc.accountNumber || '-',
      `Rp ${acc.balance.toLocaleString('id-ID')}`,
      acc.isActive ? 'Aktif' : 'Nonaktif',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Nama Akun', 'Tipe', 'No. Rekening', 'Saldo', 'Status']],
      body: accountRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. Category Spending Breakdown Table
  const categoryKeys = Object.keys(categoryExpenseMap).sort(
    (a, b) => categoryExpenseMap[b] - categoryExpenseMap[a]
  );

  if (categoryKeys.length > 0) {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Distribusi Pos Pengeluaran', margin, currentY);
    currentY += 3;

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
      head: [['Kategori', 'Total Pengeluaran', 'Porsi', 'Batas Anggaran', 'Status']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
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

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 6. Detailed Transaction History Table
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rincian Mutasi Transaksi (${filteredTx.length} Catatan)`, margin, currentY);
  currentY += 3;

  const getAccountName = (id: string) => {
    const a = accounts.find((acc) => acc.id === id);
    return a ? a.name : '-';
  };

  const txRows = filteredTx.map((t) => [
    t.transactionDate,
    t.description,
    t.category,
    getAccountName(t.accountId),
    t.type === 'income' ? 'Masuk' : 'Keluar',
    `${t.type === 'income' ? '+' : '-'}Rp ${t.amount.toLocaleString('id-ID')}`,
    t.status === 'completed' ? 'Selesai' : t.status === 'scheduled' ? 'Terjadwal' : 'Batal',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Tanggal', 'Keterangan', 'Kategori', 'Akun/Dompet', 'Arus', 'Nominal', 'Status']],
    body: txRows,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25 },
      3: { cellWidth: 28 },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.column.index === 5) {
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
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FinTrack Pro - Dokumen diekspor otomatis untuk kebutuhan pencatatan & analisis data | Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `FinTrack_Laporan_${(user.businessName || user.name)
    .replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
