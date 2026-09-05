import React from 'react';
import { 
  Home, 
  Receipt, 
  Plus, 
  FileSpreadsheet, 
  Sparkles,
  User 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, openAddModal } = useApp();

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'financial', label: 'Keuangan', icon: FileSpreadsheet },
    { id: 'add', label: 'Tambah', icon: Plus, isAction: true },
    { id: 'transactions', label: 'Mutasi', icon: Receipt },
    { id: 'finai', label: 'FinAI', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                id="floating-add-btn"
                onClick={() => openAddModal('income', 'completed')}
                className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer"
                title="Catat Transaksi"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center w-12 py-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNavigation;
