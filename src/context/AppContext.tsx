import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatRupiah } from '../utils/formatters';
import { 
  Account, 
  Transaction, 
  AppNotification, 
  UserProfile, 
  ActiveTab, 
  CategoryBudget, 
  CategoryBudgetAlert, 
  CategoryType, 
  SavingsGoal,
  Receivable,
  Payable,
  JournalEntry,
  BankReconciliationItem,
  ClosingPeriod,
  AuditTrailItem,
  FixedAsset
} from '../types';

interface AppContextType {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  notifications: AppNotification[];
  categoryBudgets: CategoryBudget[];
  categoryAlerts: CategoryBudgetAlert[];
  savingsGoals: SavingsGoal[];
  setCategoryBudget: (category: CategoryType, monthlyThreshold: number, enabled?: boolean) => void;
  toggleCategoryBudget: (category: CategoryType) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addFundsToGoal: (goalId: string, amount: number, fromAccountId?: string) => Transaction | undefined;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAddModalOpen: boolean;
  openAddModal: (defaultType?: 'income' | 'expense', defaultStatus?: 'completed' | 'scheduled') => void;
  closeAddModal: () => void;
  addModalDefaults: { type: 'income' | 'expense'; status: 'completed' | 'scheduled' };
  isTransferModalOpen: boolean;
  openTransferModal: (fromAccountId?: string) => void;
  closeTransferModal: () => void;
  isReceiptModalOpen: boolean;
  selectedReceiptTx: Transaction | null;
  openReceiptModal: (tx: Transaction) => void;
  closeReceiptModal: () => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  markScheduledAsCompleted: (id: string) => void;
  
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string, transferToAccountId?: string) => void;
  setDefaultAccount: (id: string) => void;
  transferBalance: (fromId: string, toId: string, amount: number, notes?: string) => { outTx: Transaction; inTx: Transaction } | undefined;
  
  toggleHideBalance: () => void;
  toggleDarkMode: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  totalBalance: number;
  todayIncome: number;
  todayExpense: number;
  futureIncome: number;
  futureExpense: number;
  projectedBalance: number;
  refreshData: () => void;
  isRefreshing: boolean;

  // Modul Laporan Keuangan & Akuntansi State
  receivables: Receivable[];
  addReceivable: (rec: Omit<Receivable, 'id'>) => void;
  payReceivable: (id: string, amount: number, accountId: string) => void;
  deleteReceivable: (id: string) => void;

  payables: Payable[];
  addPayable: (pay: Omit<Payable, 'id'>) => void;
  payPayable: (id: string, amount: number, accountId: string) => void;
  deletePayable: (id: string) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournalEntry: (id: string) => void;

  bankReconciliations: BankReconciliationItem[];
  toggleBankReconciliation: (id: string) => void;
  addBankReconciliationItem: (item: Omit<BankReconciliationItem, 'id'>) => void;

  closingPeriods: ClosingPeriod[];
  closeAccountingPeriod: (periodType: 'monthly' | 'yearly', periodName: string, netIncome: number, notes?: string) => void;
  togglePeriodLock: (id: string) => void;

  auditTrails: AuditTrailItem[];
  addAuditLog: (action: string, details: string, module?: string) => void;

  fixedAssets: FixedAsset[];
  addFixedAsset: (asset: Omit<FixedAsset, 'id'>) => void;
  updateFixedAsset: (id: string, updates: Partial<FixedAsset>) => void;
  deleteFixedAsset: (id: string) => void;
}

const defaultUser: UserProfile = {
  id: 'user-1',
  name: 'Budi Santoso',
  email: 'budi.santoso@bisnis.id',
  phone: '+62 812-3456-7890',
  businessName: 'Santoso Media & Bisnis',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'IDR',
  monthlyBudget: 20000000,
  darkMode: false,
  hideBalance: false,
};

const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Rekening Utama (BCA)',
    accountNumber: '8291-092-110',
    type: 'bank',
    balance: 15000000,
    color: 'from-blue-600 to-indigo-700',
    icon: 'Landmark',
    isActive: true,
    isPrimary: true,
  },
  {
    id: 'acc-2',
    name: 'Kas Operasional',
    accountNumber: 'Petty Cash & Tunai',
    type: 'business',
    balance: 5500000,
    color: 'from-emerald-600 to-teal-700',
    icon: 'Briefcase',
    isActive: true,
  },
  {
    id: 'acc-3',
    name: 'E-Wallet',
    accountNumber: '0812-3456-7890',
    type: 'wallet',
    balance: 2750000,
    color: 'from-cyan-500 to-blue-600',
    icon: 'Smartphone',
    isActive: true,
  },
  {
    id: 'acc-4',
    name: 'Bank Mandiri Bisnis',
    accountNumber: '137-00-19283-1',
    type: 'bank',
    balance: 12500000,
    color: 'from-amber-600 to-yellow-600',
    icon: 'Building2',
    isActive: true,
  },
];

const todayStr = new Date().toISOString().split('T')[0];
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    accountId: 'acc-1',
    type: 'income',
    status: 'completed',
    amount: 10000000,
    category: 'Gaji',
    description: 'Gaji Bulanan',
    transactionDate: todayStr,
    transactionTime: '09:30',
    notes: 'Transfer payroll bulan ini',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    accountId: 'acc-2',
    type: 'expense',
    status: 'completed',
    amount: 750000,
    category: 'Operasional',
    description: 'Belanja Operasional',
    transactionDate: todayStr,
    transactionTime: '11:45',
    notes: 'ATK dan konsumsi meeting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    accountId: 'acc-4',
    type: 'income',
    status: 'completed',
    amount: 5000000,
    category: 'Invoice',
    description: 'Pembayaran Invoice',
    transactionDate: yesterdayStr,
    transactionTime: '14:20',
    notes: 'Pelunasan dari Klien PT Mitra',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    accountId: 'acc-4',
    type: 'income',
    status: 'pending',
    amount: 25000000,
    category: 'Proyek',
    description: 'Pembayaran Proyek',
    transactionDate: '2026-08-30',
    transactionTime: '10:00',
    isScheduled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    accountId: 'acc-2',
    type: 'expense',
    status: 'scheduled',
    amount: 8500000,
    category: 'Vendor',
    description: 'Pembayaran Vendor',
    transactionDate: '2026-09-02',
    transactionTime: '15:00',
    isScheduled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    accountId: 'acc-1',
    type: 'expense',
    status: 'overdue',
    amount: 1500000,
    category: 'Tagihan',
    description: 'Tagihan Internet',
    transactionDate: '2026-09-05',
    transactionTime: '08:00',
    isScheduled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialCategoryBudgets: CategoryBudget[] = [
  { category: 'Belanja', monthlyThreshold: 3000000, enabled: true },
  { category: 'Makan & Minum', monthlyThreshold: 2500000, enabled: true },
  { category: 'Operasional', monthlyThreshold: 8000000, enabled: true },
  { category: 'Tagihan', monthlyThreshold: 4000000, enabled: true },
  { category: 'Transportasi', monthlyThreshold: 1500000, enabled: true },
  { category: 'Hiburan', monthlyThreshold: 1000000, enabled: true },
  { category: 'Kesehatan', monthlyThreshold: 1500000, enabled: true },
  { category: 'Edukasi', monthlyThreshold: 2000000, enabled: true },
  { category: 'Lainnya', monthlyThreshold: 1500000, enabled: true },
];

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Pembayaran Vendor Terjadwal',
    message: 'Besok terdapat pembayaran vendor sebesar Rp 8.500.000.',
    type: 'warning',
    date: todayStr,
    read: false,
    relatedTransactionId: 'tx-5',
  },
  {
    id: 'notif-2',
    title: 'Tagihan Jatuh Tempo',
    message: 'Tagihan internet akan jatuh tempo hari ini.',
    type: 'alert',
    date: todayStr,
    read: false,
    relatedTransactionId: 'tx-6',
  },
  {
    id: 'notif-3',
    title: 'Pemasukan Proyek Akan Datang',
    message: 'Pembayaran Proyek sebesar Rp 25.000.000 dijadwalkan pada 30 Agustus 2026.',
    type: 'info',
    date: todayStr,
    read: true,
    relatedTransactionId: 'tx-4',
  }
];

const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 30000000,
    currentAmount: 18500000,
    deadline: '2026-12-31',
    category: 'Dana Darurat',
    color: 'from-emerald-500 to-teal-700',
    notes: 'Prioritas utama perlindungan arus kas keluarga & usaha'
  },
  {
    id: 'goal-2',
    title: 'Upgrade Laptop & Kerja',
    targetAmount: 15000000,
    currentAmount: 9000000,
    deadline: '2026-11-15',
    category: 'Gadget',
    color: 'from-blue-600 to-indigo-700',
    notes: 'Untuk menunjang produktivitas editing & coding'
  },
  {
    id: 'goal-3',
    title: 'Liburan Akhir Tahun ke Jepang',
    targetAmount: 25000000,
    currentAmount: 12500000,
    deadline: '2026-12-20',
    category: 'Liburan',
    color: 'from-purple-600 to-indigo-800',
    notes: 'Tiket pesawat & akomodasi Tokyo - Kyoto'
  }
];

const initialReceivables: Receivable[] = [
  {
    id: 'rec-1',
    invoiceNumber: 'INV-2026-001',
    customerName: 'PT Mega Solusi Digital',
    date: '2026-08-15',
    dueDate: '2026-09-15',
    amount: 15000000,
    paidAmount: 5000000,
    status: 'partial',
    productOrService: 'Pengembangan Web & Aplikasi',
    branch: 'Jakarta Pusat',
    notes: 'Term of payment: DP 30%, Pelunasan 30 hari',
  },
  {
    id: 'rec-2',
    invoiceNumber: 'INV-2026-002',
    customerName: 'CV Sejahtera Abadi',
    date: '2026-08-25',
    dueDate: '2026-09-20',
    amount: 7500000,
    paidAmount: 0,
    status: 'unpaid',
    productOrService: 'Jasa Konsultasi IT & Cloud',
    branch: 'Surabaya',
    notes: 'Invoice jasa konsultasi bulan Agustus',
  },
  {
    id: 'rec-3',
    invoiceNumber: 'INV-2026-003',
    customerName: 'PT Berkah Niaga Sentosa',
    date: '2026-08-01',
    dueDate: '2026-08-25',
    amount: 22000000,
    paidAmount: 22000000,
    status: 'paid',
    productOrService: 'Maintenance Sistem ERP',
    branch: 'Bandung',
    notes: 'Lunas via transfer BCA',
  },
  {
    id: 'rec-4',
    invoiceNumber: 'INV-2026-004',
    customerName: 'Toko Makmur Jaya',
    date: '2026-07-20',
    dueDate: '2026-08-10',
    amount: 4200000,
    paidAmount: 0,
    status: 'overdue',
    productOrService: 'Software Kasir & POS',
    branch: 'Jakarta Barat',
    notes: 'Melewati jatuh tempo 25 hari',
  },
];

const initialPayables: Payable[] = [
  {
    id: 'pay-1',
    billNumber: 'BILL-2026-081',
    vendorName: 'PT Cloud Hosting Global',
    date: '2026-08-20',
    dueDate: '2026-09-10',
    amount: 3500000,
    paidAmount: 1500000,
    status: 'partial',
    category: 'Teknologi & Server',
    department: 'IT Infrastructure',
    notes: 'Tagihan server cloud semester ganjil',
  },
  {
    id: 'pay-2',
    billNumber: 'BILL-2026-082',
    vendorName: 'CV Distributor Kertas & ATK',
    date: '2026-08-28',
    dueDate: '2026-09-15',
    amount: 1850000,
    paidAmount: 0,
    status: 'unpaid',
    category: 'Operasional Kantor',
    department: 'General Affairs',
    notes: 'Suplai kertas, toner, & ATK kantor',
  },
  {
    id: 'pay-3',
    billNumber: 'BILL-2026-083',
    vendorName: 'Vendor Sewa Gedung Kantor',
    date: '2026-09-01',
    dueDate: '2026-09-25',
    amount: 12000000,
    paidAmount: 0,
    status: 'unpaid',
    category: 'Sewa & Gedung',
    department: 'Finance & HR',
    notes: 'Sewa ruang kerja kuartal IV',
  },
  {
    id: 'pay-4',
    billNumber: 'BILL-2026-080',
    vendorName: 'PT Logistik Cepat Aman',
    date: '2026-08-05',
    dueDate: '2026-08-20',
    amount: 950000,
    paidAmount: 950000,
    status: 'paid',
    category: 'Logistik & Pengiriman',
    department: 'Operasional',
    notes: 'Lunas',
  },
];

const initialJournalEntries: JournalEntry[] = [
  {
    id: 'jrn-1',
    entryNumber: 'JU-20260901-001',
    date: '2026-09-01',
    description: 'Penerimaan Pendapatan Proyek Klien',
    reference: 'INV-2026-003',
    isAuto: true,
    lines: [
      { id: 'jl-1', accountCode: '1-1100', accountName: 'Kas & Bank BCA', debit: 22000000, credit: 0 },
      { id: 'jl-2', accountCode: '4-1000', accountName: 'Pendapatan Jasa & Proyek', debit: 0, credit: 22000000 }
    ]
  },
  {
    id: 'jrn-2',
    entryNumber: 'JU-20260902-002',
    date: '2026-09-02',
    description: 'Pembayaran Beban Operasional Kantor & Konsumsi',
    reference: 'VOUCHER-0902',
    isAuto: true,
    lines: [
      { id: 'jl-3', accountCode: '6-1100', accountName: 'Beban Operasional & ATK', debit: 750000, credit: 0 },
      { id: 'jl-4', accountCode: '1-1102', accountName: 'Kas Operasional Tunai', debit: 0, credit: 750000 }
    ]
  },
  {
    id: 'jrn-3',
    entryNumber: 'JU-20260903-003',
    date: '2026-09-03',
    description: 'Pencatatan Piutang Usaha Proyek Web',
    reference: 'INV-2026-001',
    isAuto: true,
    lines: [
      { id: 'jl-5', accountCode: '1-1200', accountName: 'Piutang Usaha (AR)', debit: 15000000, credit: 0 },
      { id: 'jl-6', accountCode: '4-1000', accountName: 'Pendapatan Usaha Belum Tertagih', debit: 0, credit: 15000000 }
    ]
  },
  {
    id: 'jrn-4',
    entryNumber: 'JU-20260904-004',
    date: '2026-09-04',
    description: 'Pencatatan Beban Sewa Kantor Terutang',
    reference: 'BILL-2026-083',
    isAuto: false,
    lines: [
      { id: 'jl-7', accountCode: '6-1200', accountName: 'Beban Sewa Gedung', debit: 12000000, credit: 0 },
      { id: 'jl-8', accountCode: '2-1100', accountName: 'Hutang Usaha (AP)', debit: 0, credit: 12000000 }
    ]
  }
];

const initialBankReconciliations: BankReconciliationItem[] = [
  {
    id: 'rec-item-1',
    transactionId: 'tx-1',
    accountId: 'acc-1',
    statementDate: todayStr,
    description: 'TRSF CR Gaji Bulanan Payroll',
    amount: 10000000,
    isMatched: true,
    reconciledAt: todayStr,
    notes: 'Cocok dengan mutasi bank BCA',
  },
  {
    id: 'rec-item-2',
    transactionId: 'tx-3',
    accountId: 'acc-4',
    statementDate: yesterdayStr,
    description: 'TRSF CR Pembayaran Invoice PT Mitra',
    amount: 5000000,
    isMatched: true,
    reconciledAt: yesterdayStr,
    notes: 'Cocok dengan mutasi rekening Mandiri',
  },
  {
    id: 'rec-item-3',
    transactionId: 'tx-2',
    accountId: 'acc-2',
    statementDate: todayStr,
    description: 'TARIK TUNAI / BELANJA OPERASIONAL',
    amount: 750000,
    isMatched: false,
    notes: 'Kuitansi fisik di petty cash kasir',
  },
];

const initialClosingPeriods: ClosingPeriod[] = [
  {
    id: 'close-1',
    periodType: 'monthly',
    periodName: 'Juli 2026',
    closedDate: '2026-08-01',
    closedBy: 'Budi Santoso (Direktur)',
    isLocked: true,
    netIncome: 14250000,
    notes: 'Tutup buku bulanan selesai dan telah diverifikasi akuntan internal.',
  },
  {
    id: 'close-2',
    periodType: 'monthly',
    periodName: 'Agustus 2026',
    closedDate: '2026-09-01',
    closedBy: 'Budi Santoso (Direktur)',
    isLocked: true,
    netIncome: 18920000,
    notes: 'Tutup buku periode Agustus 2026, status locked.',
  },
];

const initialFixedAssets: FixedAsset[] = [
  {
    id: 'asset-1',
    assetCode: 'AST-2025-001',
    name: 'MacBook Pro M2 Max 32GB (Workstation Dev)',
    category: 'equipment',
    purchaseDate: '2025-01-15',
    acquisitionCost: 18000000,
    salvageValue: 2000000,
    usefulLifeYears: 4,
    accumulatedDepreciation: 3750000,
    depreciationMethod: 'straight_line',
    location: 'Kantor Pusat - Ruang IT',
    pic: 'Budi Santoso',
    notes: 'Aset hardware pengembangan sistem dan server',
    status: 'active',
  },
  {
    id: 'asset-2',
    assetCode: 'AST-2024-002',
    name: 'Mobil Operasional Daihatsu Gran Max Box',
    category: 'vehicles',
    purchaseDate: '2024-06-10',
    acquisitionCost: 25000000,
    salvageValue: 5000000,
    usefulLifeYears: 8,
    accumulatedDepreciation: 2750000,
    depreciationMethod: 'straight_line',
    location: 'Gudang Logistik Bandung',
    pic: 'Ahmad Subagyo',
    notes: 'Armada logistik dan distribusi barang',
    status: 'active',
  },
  {
    id: 'asset-3',
    assetCode: 'AST-2025-003',
    name: 'Mesin Server & Network Switch Cisco Gigabit',
    category: 'equipment',
    purchaseDate: '2025-03-20',
    acquisitionCost: 12500000,
    salvageValue: 1500000,
    usefulLifeYears: 4,
    accumulatedDepreciation: 1800000,
    depreciationMethod: 'straight_line',
    location: 'Server Room Utama',
    pic: 'Tim IT Support',
    notes: 'Infrastruktur cloud lokal dan backup otomatis',
    status: 'active',
  },
];

const initialAuditTrails: AuditTrailItem[] = [
  {
    id: 'audit-1',
    timestamp: '2026-09-01 09:15:20',
    action: 'TUTUP BUKU BULANAN',
    user: 'Budi Santoso',
    details: 'Melakukan closing periode Agustus 2026 dengan laba bersih Rp 18.920.000',
    module: 'Closing Periode',
  },
  {
    id: 'audit-2',
    timestamp: '2026-09-02 11:30:10',
    action: 'BUAT INVOICE PIUTANG',
    user: 'Staff Keuangan',
    details: 'Menerbitkan INV-2026-002 untuk CV Sejahtera Abadi senilai Rp 7.500.000',
    module: 'Piutang',
  },
  {
    id: 'audit-3',
    timestamp: '2026-09-03 14:05:44',
    action: 'REKONSILIASI BANK',
    user: 'Budi Santoso',
    details: 'Menandai mutasi BCA Rp 10.000.000 cocok dengan rekening koran',
    module: 'Kas & Bank',
  },
  {
    id: 'audit-4',
    timestamp: '2026-09-04 10:20:00',
    action: 'PEMBAYARAN PIUTANG',
    user: 'Budi Santoso',
    details: 'Menerima pembayaran piutang PT Mega Solusi Digital Rp 5.000.000 ke Rekening BCA',
    module: 'Piutang',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fintrack_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('fintrack_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fintrack_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('fintrack_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('fintrack_category_budgets');
    return saved ? JSON.parse(saved) : initialCategoryBudgets;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('fintrack_savings_goals');
    return saved ? JSON.parse(saved) : initialSavingsGoals;
  });

  // Financial & Accounting State
  const [receivables, setReceivables] = useState<Receivable[]>(() => {
    const saved = localStorage.getItem('fintrack_receivables');
    return saved ? JSON.parse(saved) : initialReceivables;
  });

  const [payables, setPayables] = useState<Payable[]>(() => {
    const saved = localStorage.getItem('fintrack_payables');
    return saved ? JSON.parse(saved) : initialPayables;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('fintrack_journal_entries');
    return saved ? JSON.parse(saved) : initialJournalEntries;
  });

  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliationItem[]>(() => {
    const saved = localStorage.getItem('fintrack_bank_reconciliations');
    return saved ? JSON.parse(saved) : initialBankReconciliations;
  });

  const [closingPeriods, setClosingPeriods] = useState<ClosingPeriod[]>(() => {
    const saved = localStorage.getItem('fintrack_closing_periods');
    return saved ? JSON.parse(saved) : initialClosingPeriods;
  });

  const [auditTrails, setAuditTrails] = useState<AuditTrailItem[]>(() => {
    const saved = localStorage.getItem('fintrack_audit_trails');
    return saved ? JSON.parse(saved) : initialAuditTrails;
  });

  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(() => {
    const saved = localStorage.getItem('fintrack_fixed_assets');
    return saved ? JSON.parse(saved) : initialFixedAssets;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaults, setAddModalDefaults] = useState<{ type: 'income' | 'expense'; status: 'completed' | 'scheduled' }>({
    type: 'income',
    status: 'completed',
  });
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Receipt Modal State
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const openReceiptModal = (tx: Transaction) => {
    setSelectedReceiptTx(tx);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedReceiptTx(null);
  };

  useEffect(() => {
    localStorage.setItem('fintrack_user', JSON.stringify(user));
    if (user.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fintrack_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fintrack_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fintrack_category_budgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  useEffect(() => {
    localStorage.setItem('fintrack_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('fintrack_receivables', JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    localStorage.setItem('fintrack_payables', JSON.stringify(payables));
  }, [payables]);

  useEffect(() => {
    localStorage.setItem('fintrack_journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('fintrack_bank_reconciliations', JSON.stringify(bankReconciliations));
  }, [bankReconciliations]);

  useEffect(() => {
    localStorage.setItem('fintrack_closing_periods', JSON.stringify(closingPeriods));
  }, [closingPeriods]);

  useEffect(() => {
    localStorage.setItem('fintrack_audit_trails', JSON.stringify(auditTrails));
  }, [auditTrails]);

  useEffect(() => {
    localStorage.setItem('fintrack_fixed_assets', JSON.stringify(fixedAssets));
  }, [fixedAssets]);

  const currentMonthPrefix = todayStr.slice(0, 7);

  // Real-time calculation of category spending against monthly thresholds
  const categoryAlerts: CategoryBudgetAlert[] = React.useMemo(() => {
    return categoryBudgets
      .filter(b => b.enabled && b.monthlyThreshold > 0)
      .map(b => {
        const currentSpent = transactions
          .filter(
            t =>
              t.type === 'expense' &&
              t.status === 'completed' &&
              t.category === b.category &&
              t.transactionDate.startsWith(currentMonthPrefix)
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const percentage = Math.round((currentSpent / b.monthlyThreshold) * 100);
        const exceededAmount = Math.max(0, currentSpent - b.monthlyThreshold);

        return {
          category: b.category,
          currentSpent,
          threshold: b.monthlyThreshold,
          percentage,
          exceededAmount,
        };
      })
      .filter(alert => alert.percentage >= 100);
  }, [categoryBudgets, transactions, currentMonthPrefix]);

  // Real-time automatic notification trigger when a category threshold is breached
  useEffect(() => {
    if (categoryAlerts.length === 0) return;

    categoryAlerts.forEach(alert => {
      const alertId = `budget-alert-${alert.category}-${currentMonthPrefix}`;
      setNotifications(prev => {
        const exists = prev.some(n => n.id === alertId);
        if (exists) return prev;

        const newNotif: AppNotification = {
          id: alertId,
          title: `🚨 Peringatan FinAI: Anggaran ${alert.category} Terlampaui!`,
          message: `Pengeluaran ${alert.category} bulan ini telah mencapai Rp ${alert.currentSpent.toLocaleString('id-ID')} (${alert.percentage}% dari batas threshold Rp ${alert.threshold.toLocaleString('id-ID')}). Berlebih Rp ${alert.exceededAmount.toLocaleString('id-ID')}.`,
          type: 'alert',
          date: todayStr,
          read: false,
          category: alert.category,
          isBudgetAlert: true,
        };
        return [newNotif, ...prev];
      });
    });
  }, [categoryAlerts, currentMonthPrefix]);

  const totalBalance = accounts.reduce((sum, acc) => (acc.isActive ? sum + acc.balance : sum), 0);

  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed' && t.transactionDate === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed' && t.transactionDate === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const futureIncome = transactions
    .filter(t => t.type === 'income' && (t.status === 'pending' || t.status === 'scheduled'))
    .reduce((sum, t) => sum + t.amount, 0);

  const futureExpense = transactions
    .filter(t => t.type === 'expense' && (t.status === 'scheduled' || t.status === 'pending' || t.status === 'overdue'))
    .reduce((sum, t) => sum + t.amount, 0);

  const projectedBalance = totalBalance + futureIncome - futureExpense;

  const openAddModal = (type: 'income' | 'expense' = 'income', status: 'completed' | 'scheduled' = 'completed') => {
    setAddModalDefaults({ type, status });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const openTransferModal = (fromAccountId?: string) => {
    if (fromAccountId) setSelectedAccountId(fromAccountId);
    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => setIsTransferModalOpen(false);

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Transaction => {
    const now = new Date();
    const datePart = (txData.transactionDate || todayStr).replace(/[^0-9]/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = txData.receiptNumber || `RESI-${datePart}-${randPart}`;

    const newTx: Transaction = {
      ...txData,
      receiptNumber,
      id: `tx-${Date.now()}`,
      userId: user.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (newTx.status === 'completed') {
      setAccounts(prev =>
        prev.map(acc => {
          if (acc.id === newTx.accountId) {
            return {
              ...acc,
              balance: newTx.type === 'income' ? acc.balance + newTx.amount : acc.balance - newTx.amount,
            };
          }
          return acc;
        })
      );
    }

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx && tx.status === 'completed') {
      setAccounts(prev =>
        prev.map(acc => {
          if (acc.id === tx.accountId) {
            return {
              ...acc,
              balance: tx.type === 'income' ? acc.balance - tx.amount : acc.balance + tx.amount,
            };
          }
          return acc;
        })
      );
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const markScheduledAsCompleted = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status === 'completed') return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setTransactions(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'completed',
              transactionDate: todayStr,
              transactionTime: timeStr,
              updatedAt: now.toISOString(),
            }
          : t
      )
    );

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === tx.accountId) {
          return {
            ...acc,
            balance: tx.type === 'income' ? acc.balance + tx.amount : acc.balance - tx.amount,
          };
        }
        return acc;
      })
    );

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: tx.type === 'income' ? 'Pemasukan Diterima' : 'Pengeluaran Diselesaikan',
      message: `Transaksi "${tx.description}" telah berhasil diselesaikan.`,
      type: 'success',
      date: todayStr,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals(prev => [newGoal, ...prev]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const addFundsToGoal = (goalId: string, amount: number, fromAccountId?: string): Transaction | undefined => {
    if (amount <= 0) return undefined;

    let createdTx: Transaction | undefined;

    // Deduct from account if provided
    if (fromAccountId) {
      const sourceAcc = accounts.find(a => a.id === fromAccountId);
      if (sourceAcc && sourceAcc.balance >= amount) {
        setAccounts(prev =>
          prev.map(acc => (acc.id === fromAccountId ? { ...acc, balance: acc.balance - amount } : acc))
        );

        // Record a transaction for funding the savings goal
        const goal = savingsGoals.find(g => g.id === goalId);
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        createdTx = addTransaction({
          accountId: fromAccountId,
          type: 'expense',
          status: 'completed',
          amount,
          category: 'Tabungan',
          description: `Alokasi Tabungan: ${goal ? goal.title : 'Target Dana'}`,
          transactionDate: today,
          transactionTime: timeStr,
          notes: `Setoran dana ke target ${goal?.title || ''}`,
        });
      }
    }

    setSavingsGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    return createdTx;
  };

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const setDefaultAccount = (id: string) => {
    setAccounts(prev => prev.map(a => ({ ...a, isPrimary: a.id === id })));
  };

  const deleteAccount = (id: string, transferToAccountId?: string) => {
    const accToDelete = accounts.find(a => a.id === id);
    if (!accToDelete) return;

    if (transferToAccountId && transferToAccountId !== id && accToDelete.balance > 0) {
      setAccounts(prev =>
        prev
          .map(acc => {
            if (acc.id === transferToAccountId) {
              return { ...acc, balance: acc.balance + accToDelete.balance };
            }
            return acc;
          })
          .filter(acc => acc.id !== id)
      );

      // Reassign transactions to the new account
      setTransactions(prev =>
        prev.map(tx => (tx.accountId === id ? { ...tx, accountId: transferToAccountId } : tx))
      );
    } else {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  const transferBalance = (fromId: string, toId: string, amount: number, notes?: string) => {
    if (fromId === toId || amount <= 0) return;

    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);
    if (!fromAcc || !toAcc) return;

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
        return acc;
      })
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateClean = todayStr.replace(/[^0-9]/g, '');
    const randOut = Math.floor(1000 + Math.random() * 9000);
    const randIn = Math.floor(1000 + Math.random() * 9000);
    
    const outTx: Transaction = {
      id: `tx-${Date.now()}-out`,
      receiptNumber: `RESI-${dateClean}-${randOut}`,
      userId: user.id,
      accountId: fromId,
      type: 'expense',
      status: 'completed',
      amount,
      category: 'Lainnya',
      description: `Transfer ke ${toAcc.name}`,
      transactionDate: todayStr,
      transactionTime: timeStr,
      notes: notes || 'Pindah saldo antar rekening',
      recipient: toAcc.name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const inTx: Transaction = {
      id: `tx-${Date.now()}-in`,
      receiptNumber: `RESI-${dateClean}-${randIn}`,
      userId: user.id,
      accountId: toId,
      type: 'income',
      status: 'completed',
      amount,
      category: 'Lainnya',
      description: `Transfer dari ${fromAcc.name}`,
      transactionDate: todayStr,
      transactionTime: timeStr,
      notes: notes || 'Pindah saldo antar rekening',
      recipient: user.name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setTransactions(prev => [outTx, inTx, ...prev]);
    return { outTx, inTx };
  };

  const setCategoryBudget = (category: CategoryType, monthlyThreshold: number, enabled: boolean = true) => {
    setCategoryBudgets(prev => {
      const existingIndex = prev.findIndex(b => b.category === category);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], monthlyThreshold, enabled };
        return updated;
      } else {
        return [...prev, { category, monthlyThreshold, enabled }];
      }
    });
  };

  const toggleCategoryBudget = (category: CategoryType) => {
    setCategoryBudgets(prev =>
      prev.map(b => (b.category === category ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const toggleHideBalance = () => {
    setUser(prev => ({ ...prev, hideBalance: !prev.hideBalance }));
  };

  const toggleDarkMode = () => {
    setUser(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Financial & Accounting Handlers
  const addAuditLog = (action: string, details: string, module: string = 'Akuntansi') => {
    const newLog: AuditTrailItem = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action,
      user: user.name || 'Admin Keuangan',
      details,
      module,
    };
    setAuditTrails(prev => [newLog, ...prev]);
  };

  const addReceivable = (rec: Omit<Receivable, 'id'>) => {
    const id = `rec-${Date.now()}`;
    const newRec: Receivable = { ...rec, id };
    setReceivables(prev => [newRec, ...prev]);
    addAuditLog('BUAT PIUTANG', `Menerbitkan invoice ${rec.invoiceNumber} untuk ${rec.customerName} sebesar ${formatRupiah(rec.amount)}`, 'Piutang');
  };

  const payReceivable = (id: string, amount: number, accountId: string) => {
    const rec = receivables.find(r => r.id === id);
    if (!rec) return;

    setReceivables(prev => prev.map(item => {
      if (item.id === id) {
        const newPaid = item.paidAmount + amount;
        const newStatus = newPaid >= item.amount ? 'paid' : 'partial';
        return { ...item, paidAmount: newPaid, status: newStatus };
      }
      return item;
    }));

    addTransaction({
      accountId,
      type: 'income',
      status: 'completed',
      amount,
      category: 'Invoice',
      description: `Pelunasan Piutang: ${rec.invoiceNumber} (${rec.customerName})`,
      transactionDate: new Date().toISOString().split('T')[0],
      transactionTime: new Date().toTimeString().slice(0, 5),
      notes: `Pelunasan piutang ${rec.invoiceNumber}`,
    });
    addAuditLog('PEMBAYARAN PIUTANG', `Penerimaan kas sebesar ${formatRupiah(amount)} untuk invoice ${rec.invoiceNumber} (${rec.customerName})`, 'Piutang');
  };

  const deleteReceivable = (id: string) => {
    const rec = receivables.find(r => r.id === id);
    setReceivables(prev => prev.filter(r => r.id !== id));
    if (rec) {
      addAuditLog('HAPUS PIUTANG', `Menghapus invoice piutang ${rec.invoiceNumber}`, 'Piutang');
    }
  };

  const addPayable = (pay: Omit<Payable, 'id'>) => {
    const id = `pay-${Date.now()}`;
    const newPay: Payable = { ...pay, id };
    setPayables(prev => [newPay, ...prev]);
    addAuditLog('BUAT HUTANG', `Mencatat faktur tagihan ${pay.billNumber} dari ${pay.vendorName} sebesar ${formatRupiah(pay.amount)}`, 'Hutang');
  };

  const payPayable = (id: string, amount: number, accountId: string) => {
    const payable = payables.find(p => p.id === id);
    if (!payable) return;

    setPayables(prev => prev.map(item => {
      if (item.id === id) {
        const newPaid = item.paidAmount + amount;
        const newStatus = newPaid >= item.amount ? 'paid' : 'partial';
        return { ...item, paidAmount: newPaid, status: newStatus };
      }
      return item;
    }));

    addTransaction({
      accountId,
      type: 'expense',
      status: 'completed',
      amount,
      category: 'Vendor',
      description: `Bayar Hutang: ${payable.billNumber} (${payable.vendorName})`,
      transactionDate: new Date().toISOString().split('T')[0],
      transactionTime: new Date().toTimeString().slice(0, 5),
      notes: `Pembayaran hutang faktur ${payable.billNumber}`,
    });
    addAuditLog('PEMBAYARAN HUTANG', `Pengeluaran kas sebesar ${formatRupiah(amount)} untuk tagihan ${payable.billNumber} (${payable.vendorName})`, 'Hutang');
  };

  const deletePayable = (id: string) => {
    const payable = payables.find(p => p.id === id);
    setPayables(prev => prev.filter(p => p.id !== id));
    if (payable) {
      addAuditLog('HAPUS HUTANG', `Menghapus faktur hutang ${payable.billNumber}`, 'Hutang');
    }
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const id = `jrn-${Date.now()}`;
    const newEntry: JournalEntry = { ...entry, id };
    setJournalEntries(prev => [newEntry, ...prev]);
    addAuditLog('TAMBAH JURNAL UMUM', `Membuat jurnal ${entry.entryNumber}: ${entry.description}`, 'Jurnal Umum');
  };

  const deleteJournalEntry = (id: string) => {
    const entry = journalEntries.find(j => j.id === id);
    setJournalEntries(prev => prev.filter(j => j.id !== id));
    if (entry) {
      addAuditLog('HAPUS JURNAL', `Menghapus jurnal ${entry.entryNumber}`, 'Jurnal Umum');
    }
  };

  const toggleBankReconciliation = (id: string) => {
    setBankReconciliations(prev => prev.map(item => {
      if (item.id === id) {
        const newMatched = !item.isMatched;
        return {
          ...item,
          isMatched: newMatched,
          reconciledAt: newMatched ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return item;
    }));
    addAuditLog('UPDATE REKONSILIASI', `Memperbarui status rekonsiliasi bank item ID: ${id}`, 'Kas & Bank');
  };

  const addBankReconciliationItem = (item: Omit<BankReconciliationItem, 'id'>) => {
    const newItem: BankReconciliationItem = { ...item, id: `recon-${Date.now()}` };
    setBankReconciliations(prev => [newItem, ...prev]);
    addAuditLog('TAMBAH ITEM REKONSILIASI', `Menambah data mutasi bank untuk rekonsiliasi: ${item.description}`, 'Kas & Bank');
  };

  const closeAccountingPeriod = (periodType: 'monthly' | 'yearly', periodName: string, netIncome: number, notes?: string) => {
    const newClosing: ClosingPeriod = {
      id: `closing-${Date.now()}`,
      periodType,
      periodName,
      closedDate: new Date().toISOString().split('T')[0],
      closedBy: user.name || 'Admin',
      isLocked: true,
      netIncome,
      notes,
    };
    setClosingPeriods(prev => [newClosing, ...prev]);
    addAuditLog(`TUTUP BUKU ${periodType.toUpperCase()}`, `Menutup buku periode ${periodName} dengan Laba Bersih ${formatRupiah(netIncome)}`, 'Closing Periode');
  };

  const togglePeriodLock = (id: string) => {
    setClosingPeriods(prev => prev.map(p => {
      if (p.id === id) {
        const updatedLock = !p.isLocked;
        addAuditLog(updatedLock ? 'KUNCI PERIODE' : 'BUKA KUNCI PERIODE', `${updatedLock ? 'Mengunci' : 'Membuka kunci'} transaksi periode ${p.periodName}`, 'Closing Periode');
        return { ...p, isLocked: updatedLock };
      }
      return p;
    }));
  };

  const addFixedAsset = (asset: Omit<FixedAsset, 'id'>) => {
    const id = `asset-${Date.now()}`;
    const newAsset: FixedAsset = { ...asset, id };
    setFixedAssets(prev => [newAsset, ...prev]);
    addAuditLog('TAMBAH ASET TETAP', `Mendaftarkan aset tetap: ${asset.name} (${formatRupiah(asset.acquisitionCost)})`, 'Aset Tetap');
  };

  const updateFixedAsset = (id: string, updates: Partial<FixedAsset>) => {
    setFixedAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    const existing = fixedAssets.find(a => a.id === id);
    addAuditLog('UPDATE ASET TETAP', `Memperbarui data aset tetap: ${existing?.name || id}`, 'Aset Tetap');
  };

  const deleteFixedAsset = (id: string) => {
    const existing = fixedAssets.find(a => a.id === id);
    setFixedAssets(prev => prev.filter(a => a.id !== id));
    if (existing) {
      addAuditLog('HAPUS ASET TETAP', `Menghapus aset tetap: ${existing.name}`, 'Aset Tetap');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        accounts,
        transactions,
        notifications,
        categoryBudgets,
        categoryAlerts,
        savingsGoals,
        setCategoryBudget,
        toggleCategoryBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addFundsToGoal,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        openAddModal,
        closeAddModal,
        addModalDefaults,
        isTransferModalOpen,
        openTransferModal,
        closeTransferModal,
        isReceiptModalOpen,
        selectedReceiptTx,
        openReceiptModal,
        closeReceiptModal,
        selectedAccountId,
        setSelectedAccountId,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        markScheduledAsCompleted,
        addAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount,
        transferBalance,
        toggleHideBalance,
        toggleDarkMode,
        updateUserProfile,
        markNotificationAsRead,
        clearAllNotifications,
        totalBalance,
        todayIncome,
        todayExpense,
        futureIncome,
        futureExpense,
        projectedBalance,
        refreshData,
        isRefreshing,

        // Financial & Accounting Exports
        receivables,
        addReceivable,
        payReceivable,
        deleteReceivable,
        payables,
        addPayable,
        payPayable,
        deletePayable,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        bankReconciliations,
        toggleBankReconciliation,
        addBankReconciliationItem,
        closingPeriods,
        closeAccountingPeriod,
        togglePeriodLock,
        auditTrails,
        addAuditLog,
        fixedAssets,
        addFixedAsset,
        updateFixedAsset,
        deleteFixedAsset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
