import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Scale, 
  Wallet, 
  BookOpen, 
  FileSpreadsheet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building, 
  Receipt, 
  PieChart, 
  Target, 
  Lock,
  Landmark
} from 'lucide-react';
import { FinancialSubTab } from '../../types';

export type { FinancialSubTab };

interface FinancialSubNavProps {
  activeSubTab?: FinancialSubTab;
  activeTab?: FinancialSubTab;
  onSelectSubTab?: (tab: FinancialSubTab) => void;
  onTabChange?: (tab: FinancialSubTab) => void;
  outstandingReceivablesCount?: number;
  outstandingPayablesCount?: number;
}

export const FinancialSubNav: React.FC<FinancialSubNavProps> = ({
  activeSubTab,
  activeTab,
  onSelectSubTab,
  onTabChange,
  outstandingReceivablesCount = 0,
  outstandingPayablesCount = 0,
}) => {
  const currentTab = activeSubTab || activeTab || 'dashboard';
  const handleSelect = (tab: FinancialSubTab) => {
    if (onSelectSubTab) onSelectSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const tabs = [
    { id: 'dashboard' as FinancialSubTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pnl' as FinancialSubTab, label: 'Laba Rugi', icon: TrendingUp },
    { id: 'balance' as FinancialSubTab, label: 'Neraca', icon: Scale },
    { id: 'assets' as FinancialSubTab, label: 'Aset Tetap', icon: Landmark },
    { id: 'cashflow' as FinancialSubTab, label: 'Arus Kas', icon: Wallet },
    { id: 'ledger' as FinancialSubTab, label: 'Buku Besar', icon: BookOpen },
    { id: 'journal' as FinancialSubTab, label: 'Jurnal Umum', icon: FileSpreadsheet },
    { 
      id: 'receivables' as FinancialSubTab, 
      label: 'Piutang', 
      icon: ArrowDownLeft,
      badge: outstandingReceivablesCount > 0 ? outstandingReceivablesCount : undefined
    },
    { 
      id: 'payables' as FinancialSubTab, 
      label: 'Hutang', 
      icon: ArrowUpRight,
      badge: outstandingPayablesCount > 0 ? outstandingPayablesCount : undefined
    },
    { id: 'banking' as FinancialSubTab, label: 'Kas & Bank', icon: Building },
    { id: 'tax' as FinancialSubTab, label: 'Pajak', icon: Receipt },
    { id: 'analysis' as FinancialSubTab, label: 'Analisis', icon: PieChart },
    { id: 'budgeting' as FinancialSubTab, label: 'Budgeting', icon: Target },
    { id: 'closing' as FinancialSubTab, label: 'Closing & Audit', icon: Lock },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-financial-${tab.id}`}
              onClick={() => handleSelect(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 relative cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-emerald-700' : 'bg-rose-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
