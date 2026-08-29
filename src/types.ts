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
}

export interface Transaction {
  id: string;
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

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  date: string;
  read: boolean;
  relatedTransactionId?: string;
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

export type ActiveTab = 'home' | 'transactions' | 'planning' | 'calendar' | 'reports' | 'accounts' | 'profile';
