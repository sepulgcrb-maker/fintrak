import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { DashboardWallets } from './components/DashboardWallets';
import { SummaryCards } from './components/SummaryCards';
import { QuickActions } from './components/QuickActions';
import { TransactionList } from './components/TransactionList';
import { FuturePlanningView } from './components/FuturePlanningView';
import { AccountsView } from './components/AccountsView';
import { CalendarView } from './components/CalendarView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { FinAIChat } from './components/FinAIChat';
import { BottomNavigation } from './components/BottomNavigation';
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransferModal } from './components/TransferModal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';

const AppContent: React.FC = () => {
  const { activeTab, isReceiptModalOpen, selectedReceiptTx, closeReceiptModal } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile-first viewport wrapper */}
      <main className="w-full max-w-md min-h-screen flex flex-col relative pb-16 bg-slate-50 dark:bg-slate-950 sm:shadow-2xl sm:border-x sm:border-slate-200/80 dark:sm:border-slate-800/80">
        
        {/* Top App Bar */}
        <Header />

        {/* Dynamic Screen Routing */}
        <div className="flex-1">
          {activeTab === 'home' && (
            <div className="space-y-1 pb-6 animate-in fade-in duration-150">
              <BalanceCard />
              <DashboardWallets />
              <SummaryCards />
              <QuickActions />
              <TransactionList limit={5} showFilters={false} title="Transaksi Terbaru" />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="animate-in fade-in duration-150">
              <TransactionList showFilters={true} title="Semua Mutasi Rekening" />
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="animate-in fade-in duration-150">
              <FuturePlanningView />
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="animate-in fade-in duration-150">
              <AccountsView />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-in fade-in duration-150">
              <CalendarView />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in fade-in duration-150">
              <ReportsView />
            </div>
          )}

          {activeTab === 'finai' && (
            <div className="animate-in fade-in duration-150">
              <FinAIChat />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-150">
              <ProfileView />
            </div>
          )}
        </div>

        {/* Bottom Floating Navigation */}
        <BottomNavigation />

        {/* Global Modals */}
        <AddTransactionModal />
        <TransferModal />
        <TransactionReceiptModal 
          isOpen={isReceiptModalOpen}
          onClose={closeReceiptModal}
          transaction={selectedReceiptTx}
        />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
