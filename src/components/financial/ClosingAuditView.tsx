import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  History, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  Plus 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface ClosingAuditViewProps {
  onOpenClosingModal: () => void;
}

export const ClosingAuditView: React.FC<ClosingAuditViewProps> = ({
  onOpenClosingModal,
}) => {
  const { closingPeriods, togglePeriodLock, auditTrails } = useApp();
  const [activeTab, setActiveTab] = useState<'closing' | 'audit'>('closing');

  return (
    <div className="p-4 space-y-4">
      {/* Switch Tab: Tutup Buku vs Audit Trail */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('closing')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'closing'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Tutup Buku (Closing Period)</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Trail ({auditTrails.length})</span>
        </button>
      </div>

      {activeTab === 'closing' ? (
        <div className="space-y-4">
          {/* Action Header */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Manajemen Tutup Buku (Closing Periode)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kunci pembukuan bulanan/tahunan untuk memastikan integritas saldo laba ditahan
              </p>
            </div>

            <button
              onClick={onOpenClosingModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tutup Buku Periode Baru</span>
            </button>
          </div>

          {/* List of Closing Periods */}
          <div className="space-y-3">
            {closingPeriods.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Belum ada riwayat tutup buku. Klik "Tutup Buku Periode Baru" untuk menutup periode akuntansi.
              </div>
            ) : (
              closingPeriods.map((period) => (
                <div
                  key={period.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {period.periodName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {period.periodType === 'monthly' ? 'Bulanan' : 'Tahunan'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        period.isLocked 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {period.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {period.isLocked ? 'TERKUNCI' : 'TERBUKA'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>Ditutup: {formatDateIndonesian(period.closedDate)}</span>
                      <span>Oleh: <strong>{period.closedBy}</strong></span>
                      {period.notes && <span className="italic">• {period.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-400">Laba Bersih Ditutup</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(period.netIncome)}
                      </div>
                    </div>

                    <button
                      onClick={() => togglePeriodLock(period.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        period.isLocked
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {period.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{period.isLocked ? 'Buka Kunci' : 'Kunci Transaksi'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Audit Trail Timeline */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white">
            <span className="uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-500" />
              Log Jejak Audit Sistem (Audit Trail)
            </span>
            <span className="text-slate-400 font-normal">Real-time recording</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditTrails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">Belum ada catatan aktivitas audit.</div>
            ) : (
              auditTrails.map((log) => (
                <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-850/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        {log.module}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">{log.details}</div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <div className="font-mono">{log.timestamp}</div>
                    <div className="text-slate-500 font-medium">{log.user}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
