import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialSubTab } from '../../types';
import { FinancialHeader } from './FinancialHeader';
import { FinancialSubNav } from './FinancialSubNav';

import { FinancialDashboardView } from './FinancialDashboardView';
import { ProfitAndLossView } from './ProfitAndLossView';
import { BalanceSheetView } from './BalanceSheetView';
import { CashFlowView } from './CashFlowView';
import { GeneralLedgerView } from './GeneralLedgerView';
import { GeneralJournalView } from './GeneralJournalView';
import { ReceivablesView } from './ReceivablesView';
import { PayablesView } from './PayablesView';
import { BankingReconView } from './BankingReconView';
import { TaxReportView } from './TaxReportView';
import { RevenueExpenseAnalysisView } from './RevenueExpenseAnalysisView';
import { BudgetingReportView } from './BudgetingReportView';
import { ClosingAuditView } from './ClosingAuditView';

import { AddReceivableModal } from './modals/AddReceivableModal';
import { PayReceivableModal } from './modals/PayReceivableModal';
import { AddPayableModal } from './modals/AddPayableModal';
import { PayPayableModal } from './modals/PayPayableModal';
import { AddJournalEntryModal } from './modals/AddJournalEntryModal';
import { ClosePeriodModal } from './modals/ClosePeriodModal';

import { 
  calculateProfitAndLoss, 
  calculateBalanceSheet, 
  calculateCashFlow, 
  calculateTaxReport, 
  getComparativePeriods 
} from '../../utils/financialCalculations';
import { 
  exportFinancialReportToPdf, 
  exportFinancialReportToExcel, 
  exportFinancialReportToCsv 
} from '../../utils/financialExport';
import { Receivable, Payable } from '../../types';

export const FinancialModuleContainer: React.FC = () => {
  const { transactions, accounts, receivables, payables, userProfile } = useApp();

  // Active sub navigation
  const [activeSubTab, setActiveSubTab] = useState<FinancialSubTab>('dashboard');

  // Period filtering
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly' | 'custom'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Modals state
  const [isAddReceivableOpen, setIsAddReceivableOpen] = useState(false);
  const [isPayReceivableOpen, setIsPayReceivableOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);

  const [isAddPayableOpen, setIsAddPayableOpen] = useState(false);
  const [isPayPayableOpen, setIsPayPayableOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);

  const [isAddJournalOpen, setIsAddJournalOpen] = useState(false);
  const [isClosePeriodOpen, setIsClosePeriodOpen] = useState(false);

  // Compute active date boundaries
  const { startDate, endDate, periodLabel } = useMemo(() => {
    if (periodType === 'monthly') {
      const start = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const end = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('id-ID', { month: 'long' });
      return { startDate: start, endDate: end, periodLabel: `${monthName} ${selectedYear}` };
    } else if (periodType === 'quarterly') {
      const q = Math.ceil(selectedMonth / 3);
      const startMonth = (q - 1) * 3 + 1;
      const endMonth = q * 3;
      const start = `${selectedYear}-${String(startMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, endMonth, 0).getDate();
      const end = `${selectedYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return { startDate: start, endDate: end, periodLabel: `Kuartal ${q} ${selectedYear}` };
    } else if (periodType === 'yearly') {
      return {
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        periodLabel: `Tahun ${selectedYear}`,
      };
    } else {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
        periodLabel: `${customStartDate} s/d ${customEndDate}`,
      };
    }
  }, [periodType, selectedYear, selectedMonth, customStartDate, customEndDate]);

  // Comparative Period (Previous Period)
  const previousPeriod = useMemo(() => {
    return getComparativePeriods(startDate, endDate);
  }, [startDate, endDate]);

  // Calculations
  const pnlCurrent = useMemo(() => {
    return calculateProfitAndLoss(transactions, startDate, endDate);
  }, [transactions, startDate, endDate]);

  const pnlPrevious = useMemo(() => {
    return calculateProfitAndLoss(transactions, previousPeriod.startDate, previousPeriod.endDate);
  }, [transactions, previousPeriod]);

  const balanceSheet = useMemo(() => {
    return calculateBalanceSheet(accounts, receivables, payables, transactions, endDate);
  }, [accounts, receivables, payables, transactions, endDate]);

  const cashFlow = useMemo(() => {
    return calculateCashFlow(transactions, accounts, startDate, endDate);
  }, [transactions, accounts, startDate, endDate]);

  const taxReport = useMemo(() => {
    return calculateTaxReport(transactions, startDate, endDate);
  }, [transactions, startDate, endDate]);

  // Export handlers
  const handleExportPdf = () => {
    exportFinancialReportToPdf({
      type: activeSubTab,
      periodLabel,
      companyName: userProfile?.name ? `${userProfile.name}'s Enterprise` : 'FinTrack Pro Accounting',
      pnl: pnlCurrent,
      balanceSheet,
      cashFlow,
      tax: taxReport,
    });
  };

  const handleExportExcel = () => {
    exportFinancialReportToExcel({
      type: activeSubTab,
      periodLabel,
      companyName: userProfile?.name ? `${userProfile.name}'s Enterprise` : 'FinTrack Pro Accounting',
      pnl: pnlCurrent,
      balanceSheet,
      cashFlow,
      tax: taxReport,
    });
  };

  const handleExportCsv = () => {
    exportFinancialReportToCsv({
      type: activeSubTab,
      periodLabel,
      companyName: userProfile?.name ? `${userProfile.name}'s Enterprise` : 'FinTrack Pro Accounting',
      pnl: pnlCurrent,
      balanceSheet,
      cashFlow,
      tax: taxReport,
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50/50 dark:bg-slate-950">
      {/* Financial Module Header with period switcher and exports */}
      <FinancialHeader
        currentPeriod={periodType === 'monthly' ? 'month' : periodType === 'quarterly' ? 'quarter' : periodType === 'yearly' ? 'year' : 'custom'}
        periodLabel={periodLabel}
        dateRange={{ startDate, endDate, label: periodLabel }}
        periodType={periodType}
        setPeriodType={setPeriodType}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        onCustomStartChange={setCustomStartDate}
        onCustomEndChange={setCustomEndDate}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        exportData={{
          companyName: userProfile?.businessName || userProfile?.name || 'FinTrack Enterprise',
          reportTitle: `Laporan Keuangan`,
          periodLabel,
          generatedDate: new Date().toLocaleDateString('id-ID'),
          pnl: pnlCurrent,
          balanceSheet,
          cashFlow,
          taxReport,
          receivables,
          payables,
        }}
      />

      {/* Sub Navigation Bar for all 13 financial features */}
      <FinancialSubNav
        activeSubTab={activeSubTab}
        activeTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
        onTabChange={setActiveSubTab}
        outstandingReceivablesCount={receivables.filter(r => r.status !== 'paid').length}
        outstandingPayablesCount={payables.filter(p => p.status !== 'paid').length}
      />

      {/* Dynamic Sub-View Render */}
      <div className="flex-1 max-w-7xl w-full mx-auto">
        {activeSubTab === 'dashboard' && (
          <FinancialDashboardView
            pnl={pnlCurrent}
            balanceSheet={balanceSheet}
            cashFlow={cashFlow}
            periodLabel={periodLabel}
            onNavigateTab={setActiveSubTab}
          />
        )}

        {activeSubTab === 'pnl' && (
          <ProfitAndLossView
            current={pnlCurrent}
            previous={pnlPrevious}
            periodLabel={periodLabel}
            previousPeriodLabel={previousPeriod?.label || ''}
          />
        )}

        {activeSubTab === 'balance' && (
          <BalanceSheetView
            balanceSheet={balanceSheet}
            periodLabel={periodLabel}
          />
        )}

        {activeSubTab === 'cashflow' && (
          <CashFlowView
            cashFlow={cashFlow}
            periodLabel={periodLabel}
          />
        )}

        {activeSubTab === 'ledger' && (
          <GeneralLedgerView
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {activeSubTab === 'journal' && (
          <GeneralJournalView
            startDate={startDate}
            endDate={endDate}
            onOpenAddModal={() => setIsAddJournalOpen(true)}
          />
        )}

        {activeSubTab === 'receivables' && (
          <ReceivablesView
            onOpenAddModal={() => setIsAddReceivableOpen(true)}
            onOpenPayModal={(rec) => {
              setSelectedReceivable(rec);
              setIsPayReceivableOpen(true);
            }}
          />
        )}

        {activeSubTab === 'payables' && (
          <PayablesView
            onOpenAddModal={() => setIsAddPayableOpen(true)}
            onOpenPayModal={(pay) => {
              setSelectedPayable(pay);
              setIsPayPayableOpen(true);
            }}
          />
        )}

        {activeSubTab === 'bank' && (
          <BankingReconView />
        )}

        {activeSubTab === 'tax' && (
          <TaxReportView
            taxReport={taxReport}
            periodLabel={periodLabel}
          />
        )}

        {activeSubTab === 'analysis' && (
          <RevenueExpenseAnalysisView
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {activeSubTab === 'budget' && (
          <BudgetingReportView />
        )}

        {activeSubTab === 'closing' && (
          <ClosingAuditView
            onOpenClosingModal={() => setIsClosePeriodOpen(true)}
          />
        )}
      </div>

      {/* Interactive Modals */}
      <AddReceivableModal
        isOpen={isAddReceivableOpen}
        onClose={() => setIsAddReceivableOpen(false)}
      />

      <PayReceivableModal
        isOpen={isPayReceivableOpen}
        onClose={() => {
          setIsPayReceivableOpen(false);
          setSelectedReceivable(null);
        }}
        receivable={selectedReceivable}
      />

      <AddPayableModal
        isOpen={isAddPayableOpen}
        onClose={() => setIsAddPayableOpen(false)}
      />

      <PayPayableModal
        isOpen={isPayPayableOpen}
        onClose={() => {
          setIsPayPayableOpen(false);
          setSelectedPayable(null);
        }}
        payable={selectedPayable}
      />

      <AddJournalEntryModal
        isOpen={isAddJournalOpen}
        onClose={() => setIsAddJournalOpen(false)}
      />

      <ClosePeriodModal
        isOpen={isClosePeriodOpen}
        onClose={() => setIsClosePeriodOpen(false)}
        currentNetIncome={pnlCurrent?.netProfit ?? 0}
      />
    </div>
  );
};
