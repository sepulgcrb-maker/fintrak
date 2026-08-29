import React, { useState } from 'react';
import { Bell, Moon, Sun, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGreeting, formatDateIndonesian } from '../utils/formatters';

export const Header: React.FC = () => {
  const { user, notifications, toggleDarkMode, markNotificationAsRead, clearAllNotifications, setActiveTab } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const today = new Date().toISOString().split('T')[0];
  const { greeting } = getGreeting(user.name);

  return (
    <header className="relative z-30 pt-3 pb-2 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          id="profile-avatar-btn"
          onClick={() => setActiveTab('profile')}
          className="relative group focus:outline-none"
          title="Buka Profil"
        >
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 via-blue-500 to-indigo-600 shadow-sm">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full border border-white dark:border-slate-900"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              {greeting},
            </p>
            <span className="inline-flex items-center text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 mr-0.5" /> Terverifikasi
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {user.name}
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {formatDateIndonesian(today)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="theme-toggle-btn"
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"
        >
          {user.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <div className="relative">
          <button
            id="notif-dropdown-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifikasi"
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pemberitahuan</h3>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                      <Sparkles className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                      Belum ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 rounded-xl transition-all cursor-pointer text-xs ${
                          n.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-slate-900 dark:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
