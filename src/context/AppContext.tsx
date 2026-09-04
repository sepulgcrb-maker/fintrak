import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Transaction, AppNotification, UserProfile, ActiveTab, CategoryBudget, CategoryBudgetAlert, CategoryType, SavingsGoal } from '../types';

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
