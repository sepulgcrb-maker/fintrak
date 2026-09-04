export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'completed' | 'pending' | 'scheduled' | 'overdue' | 'cancelled';

export type CategoryType = 
  | 'Gaji' 
  | 'Penjualan' 
  | 'Proyek' 
  | 'Invoice' 
  | 'Investasi' 
  | 'Operasional' 
  | 'Belanja' 
  | 'Transportasi' 
  | 'Gaji Karyawan' 
  | 'Vendor' 
  | 'Tagihan' 
  | 'Makan & Minum'
  | 'Kesehatan'
  | 'Edukasi'
  | 'Hiburan'
  | 'Tabungan'
  | 'Lainnya';

export interface Account {
  id: string;
  name: string;
  accountNumber?: string;
  type: 'bank' | 'wallet' | 'cash' | 'business';
  balance: number;
  color: string;
  icon: string;
  isActive: boolean;
  isPrimary?: boolean;
  notes?: string;
}

export interface Transaction {
  id: string;
  receiptNumber?: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  category: CategoryType;
  description: string;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm
  notes?: string;
  recipient?: string;
  isScheduled?: boolean;
  reminderDaysBefore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  category: CategoryType;
  monthlyThreshold: number;
  enabled: boolean;
}

export interface CategoryBudgetAlert {
  category: CategoryType;
  currentSpent: number;
  threshold: number;
  percentage: number;
  exceededAmount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  date: string;
  read: boolean;
  relatedTransactionId?: string;
  category?: CategoryType;
  isBudgetAlert?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  avatarUrl: string;
  currency: string;
  monthlyBudget: number;
  darkMode: boolean;
  hideBalance: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: 'add_income' | 'add_expense' | 'view_planning' | 'view_reports';
  }[];
}

export type ActiveTab = 'home' | 'transactions' | 'planning' | 'calendar' | 'reports' | 'accounts' | 'profile' | 'finai';

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category?: string; // 'Dana Darurat', 'Kendaraan', 'Liburan', 'Gadget', 'Pendidikan', 'Properti', 'Lainnya'
  color?: string;
  icon?: string;
  notes?: string;
}
