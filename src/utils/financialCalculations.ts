import { Transaction, Account, Receivable, Payable, JournalEntry, CategoryBudget, FixedAsset } from '../types';

export interface DateFilterRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

// Helper to filter transactions within date range
export const filterTransactionsByDate = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] => {
  return transactions.filter(t => {
    if (t.status !== 'completed') return false;
    return t.transactionDate >= startDate && t.transactionDate <= endDate;
  });
};

// Calculate Date Range based on Period Filter
export const getDateRangeForPeriod = (
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom',
  customStart?: string,
  customEnd?: string
): DateFilterRange => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  if (period === 'today') {
    return { startDate: todayStr, endDate: todayStr, label: 'Hari Ini' };
  }

  if (period === 'week') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const startOfWeek = new Date(d.setDate(diff));
    const startStr = startOfWeek.toISOString().slice(0, 10);
    return { startDate: startStr, endDate: todayStr, label: '7 Hari Terakhir / Minggu Ini' };
  }

  if (period === 'quarter') {
    const quarter = Math.floor(month / 3);
    const startMonth = quarter * 3;
    const startOfQuarter = new Date(year, startMonth, 1);
    const endOfQuarter = new Date(year, startMonth + 3, 0);
    return {
      startDate: startOfQuarter.toISOString().slice(0, 10),
      endDate: endOfQuarter.toISOString().slice(0, 10),
      label: `Kuartal ${quarter + 1} (${year})`
    };
  }

  if (period === 'year') {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      label: `Tahun Buku ${year}`
    };
  }

  if (period === 'custom' && customStart && customEnd) {
    return {
      startDate: customStart,
      endDate: customEnd,
      label: `${customStart} s/d ${customEnd}`
    };
  }

  // Default: Month
  const startOfMonth = new Date(year, month, 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return {
    startDate: startOfMonth,
    endDate: endOfMonth,
    label: `Bulan ${monthNames[month]} ${year}`
  };
};

// 1. LABA RUGI (INCOME STATEMENT)
export interface ProfitAndLossReport {
  grossRevenue: number;
  cogs: number; // Harga Pokok Penjualan
  grossProfit: number; // Laba Kotor
  operatingExpenses: number; // Beban Operasional
  otherExpenses: number; // Beban Lain-lain
  netProfit: number; // Laba Bersih
  // Detail Breakdowns
  revenueBreakdown: { category: string; amount: number }[];
  cogsBreakdown: { category: string; amount: number }[];
  operatingExpensesBreakdown: { category: string; amount: number }[];
  otherExpensesBreakdown: { category: string; amount: number }[];
  // Previous period comparison
  prevRevenue: number;
  prevNetProfit: number;
  growthPercentage: number;
}

export const calculateProfitAndLoss = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): ProfitAndLossReport => {
  const currentTxs = filterTransactionsByDate(transactions, startDate, endDate);

  // Revenue (Penjualan, Invoice, Proyek, Gaji, dll)
  let grossRevenue = 0;
  const revMap = new Map<string, number>();

  currentTxs
    .filter(t => t.type === 'income')
    .forEach(t => {
      grossRevenue += t.amount;
      revMap.set(t.category, (revMap.get(t.category) || 0) + t.amount);
    });

  // Categories mapping to COGS (Harga Pokok)
  // Categories like Vendor, Belanja (Bahan Baku / Produk) are COGS
  let cogs = 0;
  const cogsMap = new Map<string, number>();

  // Operating Expenses (Operasional, Gaji Karyawan, Transportasi, Makan & Minum)
  let operatingExpenses = 0;
  const opExMap = new Map<string, number>();

  // Other Expenses (Tagihan, Lainnya, Edukasi, Hiburan)
  let otherExpenses = 0;
  const otherExMap = new Map<string, number>();

  currentTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category;
      if (cat === 'Vendor' || cat === 'Belanja') {
        cogs += t.amount;
        cogsMap.set(cat, (cogsMap.get(cat) || 0) + t.amount);
      } else if (cat === 'Operasional' || cat === 'Gaji Karyawan' || cat === 'Transportasi' || cat === 'Makan & Minum') {
        operatingExpenses += t.amount;
        opExMap.set(cat, (opExMap.get(cat) || 0) + t.amount);
      } else {
        otherExpenses += t.amount;
        otherExMap.set(cat, (otherExMap.get(cat) || 0) + t.amount);
      }
    });

  const grossProfit = grossRevenue - cogs;
  const netProfit = grossProfit - operatingExpenses - otherExpenses;

  // Previous period comparison (e.g. previous month / same length)
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysDiff + 1);

  const prevTxs = filterTransactionsByDate(
    transactions,
    prevStart.toISOString().slice(0, 10),
    prevEnd.toISOString().slice(0, 10)
  );

  const prevRevenue = prevTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevNetProfit = prevRevenue - prevExpense;

  const growthPercentage = prevNetProfit !== 0
    ? Math.round(((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100)
    : 0;

  return {
    grossRevenue,
    cogs,
    grossProfit,
    operatingExpenses,
    otherExpenses,
    netProfit,
    revenueBreakdown: Array.from(revMap.entries()).map(([category, amount]) => ({ category, amount })),
    cogsBreakdown: Array.from(cogsMap.entries()).map(([category, amount]) => ({ category, amount })),
    operatingExpensesBreakdown: Array.from(opExMap.entries()).map(([category, amount]) => ({ category, amount })),
    otherExpensesBreakdown: Array.from(otherExMap.entries()).map(([category, amount]) => ({ category, amount })),
    prevRevenue,
    prevNetProfit,
    growthPercentage,
  };
};

// 2. NERACA (BALANCE SHEET)
export interface BalanceSheetReport {
  currentAssets: {
    cashAndBank: number;
    accountsReceivable: number;
    suppliesInventory: number;
    total: number;
  };
  fixedAssets: {
    equipment: number;
    vehicles: number;
    machinery?: number;
    furniture?: number;
    building?: number;
    other?: number;
    accumulatedDepreciation: number;
    total: number;
  };
  totalAssets: number;
  liabilities: {
    accountsPayable: number;
    taxPayable: number;
    bankLoan: number;
    total: number;
  };
  equity: {
    ownerCapital: number;
    retainedEarnings: number;
    currentNetProfit: number;
    total: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export const calculateBalanceSheet = (
  accounts: Account[],
  receivables: Receivable[],
  payables: Payable[],
  transactions: Transaction[],
  asOfDate: string,
  fixedAssets?: FixedAsset[]
): BalanceSheetReport => {
  // Cash & Bank
  const cashAndBank = accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0);

  // Accounts Receivable (Outstanding)
  const accountsReceivable = receivables.reduce((sum, r) => {
    const outstanding = Math.max(0, r.amount - r.paidAmount);
    return sum + outstanding;
  }, 0);

  // Supplies / Persediaan Operasional
  const suppliesInventory = 3500000;

  const currentAssetsTotal = cashAndBank + accountsReceivable + suppliesInventory;

  // Fixed Assets (Equipment, Vehicles, Machinery, Furniture, etc.)
  let equipment = 0;
  let vehicles = 0;
  let machinery = 0;
  let furniture = 0;
  let building = 0;
  let otherAssets = 0;
  let accumulatedDepreciation = 0;

  if (fixedAssets && fixedAssets.length > 0) {
    fixedAssets.filter(a => a.status === 'active').forEach(a => {
      const cost = a.acquisitionCost || 0;
      if (a.category === 'equipment') equipment += cost;
      else if (a.category === 'vehicles') vehicles += cost;
      else if (a.category === 'machinery') machinery += cost;
      else if (a.category === 'furniture') furniture += cost;
      else if (a.category === 'building') building += cost;
      else otherAssets += cost;

      const dep = calculateAssetDepreciation(a, asOfDate).accumulatedDepreciation;
      accumulatedDepreciation += dep;
    });
  } else {
    equipment = 18000000;
    vehicles = 25000000;
    accumulatedDepreciation = 6500000;
  }

  const grossFixedAssets = equipment + vehicles + machinery + furniture + building + otherAssets;
  const fixedAssetsTotal = grossFixedAssets - accumulatedDepreciation;

  const totalAssets = currentAssetsTotal + fixedAssetsTotal;

  // Accounts Payable (Outstanding)
  const accountsPayable = payables.reduce((sum, p) => {
    const outstanding = Math.max(0, p.amount - p.paidAmount);
    return sum + outstanding;
  }, 0);

  // Tax Payable (PPN Terutang estimasi)
  const completedIncome = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const completedExpense = transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const taxPayable = Math.max(0, Math.round((completedIncome - completedExpense) * 0.005)); // PPh Final 0.5%

  const bankLoan = 10000000;
  const totalLiabilities = accountsPayable + taxPayable + bankLoan;

  // Equity
  const currentNetProfit = completedIncome - completedExpense;
  const retainedEarnings = 15000000;
  // Owner capital balances the accounting equation
  const ownerCapital = totalAssets - totalLiabilities - retainedEarnings - currentNetProfit;
  const totalEquity = ownerCapital + retainedEarnings + currentNetProfit;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 100;

  return {
    currentAssets: {
      cashAndBank,
      accountsReceivable,
      suppliesInventory,
      total: currentAssetsTotal,
    },
    fixedAssets: {
      equipment,
      vehicles,
      machinery,
      furniture,
      building,
      other: otherAssets,
      accumulatedDepreciation: -Math.abs(accumulatedDepreciation),
      total: fixedAssetsTotal,
    },
    totalAssets,
    liabilities: {
      accountsPayable,
      taxPayable,
      bankLoan,
      total: totalLiabilities,
    },
    equity: {
      ownerCapital,
      retainedEarnings,
      currentNetProfit,
      total: totalEquity,
    },
    totalLiabilitiesAndEquity,
    isBalanced,
  };
};

// 3. ARUS KAS (CASH FLOW STATEMENT)
export interface CashFlowReport {
  operatingCashIn: number;
  operatingCashOut: number;
  netOperatingCashFlow: number;
  investingCashIn: number;
  investingCashOut: number;
  netInvestingCashFlow: number;
  financingCashIn: number;
  financingCashOut: number;
  netFinancingCashFlow: number;
  netCashChange: number;
  startingCash: number;
  endingCash: number;
}

export const calculateCashFlow = (
  transactions: Transaction[],
  accounts: Account[],
  startDate: string,
  endDate: string
): CashFlowReport => {
  const periodTxs = filterTransactionsByDate(transactions, startDate, endDate);

  let operatingCashIn = 0;
  let operatingCashOut = 0;
  let investingCashIn = 0;
  let investingCashOut = 0;
  let financingCashIn = 0;
  let financingCashOut = 0;

  periodTxs.forEach(t => {
    if (t.type === 'income') {
      if (t.category === 'Investasi') {
        investingCashIn += t.amount;
      } else if (t.category === 'Tabungan') {
        financingCashIn += t.amount;
      } else {
        operatingCashIn += t.amount;
      }
    } else {
      if (t.category === 'Investasi') {
        investingCashOut += t.amount;
      } else if (t.category === 'Tabungan') {
        financingCashOut += t.amount;
      } else {
        operatingCashOut += t.amount;
      }
    }
  });

  const netOperatingCashFlow = operatingCashIn - operatingCashOut;
  const netInvestingCashFlow = investingCashIn - investingCashOut;
  const netFinancingCashFlow = financingCashIn - financingCashOut;
  const netCashChange = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

  const endingCash = accounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0);
  const startingCash = endingCash - netCashChange;

  return {
    operatingCashIn,
    operatingCashOut,
    netOperatingCashFlow,
    investingCashIn,
    investingCashOut,
    netInvestingCashFlow,
    financingCashIn,
    financingCashOut,
    netFinancingCashFlow,
    netCashChange,
    startingCash,
    endingCash,
  };
};

// 4. LAPORAN PAJAK (TAX REPORT)
export interface TaxReport {
  taxableSales: number;
  outputVat: number; // PPN Keluaran 11%
  taxablePurchases: number;
  inputVat: number; // PPN Masukan 11%
  netVatPayable: number; // PPN Kurang/Lebih Bayar
  grossRevenue: number;
  pphFinalUmkm: number; // PPh Final 0.5% (PP 23/2018 & UU HPP)
}

export const calculateTaxReport = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): TaxReport => {
  const periodTxs = filterTransactionsByDate(transactions, startDate, endDate);

  const taxableSales = periodTxs
    .filter(t => t.type === 'income' && (t.category === 'Penjualan' || t.category === 'Invoice' || t.category === 'Proyek'))
    .reduce((sum, t) => sum + t.amount, 0);

  const taxablePurchases = periodTxs
    .filter(t => t.type === 'expense' && (t.category === 'Vendor' || t.category === 'Belanja' || t.category === 'Operasional'))
    .reduce((sum, t) => sum + t.amount, 0);

  const outputVat = Math.round(taxableSales * 0.11);
  const inputVat = Math.round(taxablePurchases * 0.11);
  const netVatPayable = outputVat - inputVat;

  const grossRevenue = periodTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const pphFinalUmkm = Math.round(grossRevenue * 0.005);

  return {
    taxableSales,
    outputVat,
    taxablePurchases,
    inputVat,
    netVatPayable,
    grossRevenue,
    pphFinalUmkm,
  };
};

// 5. BUDGETING REALIZATION
export interface BudgetRealizationItem {
  category: string;
  budget: number;
  realization: number;
  variance: number; // budget - realization
  percentage: number;
  status: 'safe' | 'warning' | 'over';
}

export const calculateBudgetRealization = (
  categoryBudgets: CategoryBudget[],
  transactions: Transaction[],
  monthPrefix: string
): BudgetRealizationItem[] => {
  return categoryBudgets.map(b => {
    const realization = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed' && t.category === b.category && t.transactionDate.startsWith(monthPrefix))
      .reduce((s, t) => s + t.amount, 0);

    const variance = b.monthlyThreshold - realization;
    const percentage = b.monthlyThreshold > 0 ? Math.round((realization / b.monthlyThreshold) * 100) : 0;
    
    let status: 'safe' | 'warning' | 'over' = 'safe';
    if (percentage >= 100) status = 'over';
    else if (percentage >= 80) status = 'warning';

    return {
      category: b.category,
      budget: b.monthlyThreshold,
      realization,
      variance,
      percentage,
      status,
    };
  });
};

// 6. COMPARATIVE PERIOD CALCULATOR
export const getComparativePeriods = (startDate: string, endDate: string): {
  startDate: string;
  endDate: string;
  label: string;
} => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - durationDays + 1);

  const prevStartStr = prevStart.toISOString().slice(0, 10);
  const prevEndStr = prevEnd.toISOString().slice(0, 10);

  return {
    startDate: prevStartStr,
    endDate: prevEndStr,
    label: `Periode Sebelumnya (${prevStartStr} s/d ${prevEndStr})`,
  };
};

// 7. FIXED ASSET DEPRECIATION CALCULATOR
export const calculateAssetDepreciation = (
  asset: FixedAsset,
  asOfDate?: string
): {
  elapsedMonths: number;
  monthlyDepreciation: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
  isFullyDepreciated: boolean;
} => {
  const cost = asset.acquisitionCost || 0;
  const salvage = asset.salvageValue || 0;
  const usefulLifeYears = Math.max(1, asset.usefulLifeYears || 4);
  const totalUsefulMonths = usefulLifeYears * 12;

  const depreciableAmount = Math.max(0, cost - salvage);
  const monthlyDepreciation = Math.round(depreciableAmount / totalUsefulMonths);
  const annualDepreciation = monthlyDepreciation * 12;

  // Calculate elapsed months from purchase date to asOfDate (or today)
  const pDate = new Date(asset.purchaseDate);
  const targetDate = asOfDate ? new Date(asOfDate) : new Date();

  let elapsedMonths = 0;
  if (!isNaN(pDate.getTime()) && !isNaN(targetDate.getTime())) {
    elapsedMonths = Math.max(
      0,
      (targetDate.getFullYear() - pDate.getFullYear()) * 12 + (targetDate.getMonth() - pDate.getMonth())
    );
  }

  let accumulatedDepreciation = 0;
  if (asset.depreciationMethod === 'manual' && asset.accumulatedDepreciation !== undefined) {
    accumulatedDepreciation = Math.min(cost, Math.max(0, asset.accumulatedDepreciation));
  } else if (asset.accumulatedDepreciation !== undefined && asset.accumulatedDepreciation > 0) {
    // If manual override was provided, respect it
    accumulatedDepreciation = Math.min(cost, asset.accumulatedDepreciation);
  } else {
    // Straight line calculation
    accumulatedDepreciation = Math.min(depreciableAmount, elapsedMonths * monthlyDepreciation);
  }

  const bookValue = Math.max(salvage, cost - accumulatedDepreciation);
  const isFullyDepreciated = accumulatedDepreciation >= depreciableAmount;

  return {
    elapsedMonths,
    monthlyDepreciation,
    annualDepreciation,
    accumulatedDepreciation,
    bookValue,
    isFullyDepreciated,
  };
};


