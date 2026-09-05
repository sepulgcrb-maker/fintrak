import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Filter, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../../utils/formatters';

interface GeneralLedgerViewProps {
  startDate: string;
  endDate: string;
}

interface LedgerAccountOption {
  code: string;
  name: string;
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normalBalance: 'debit' | 'credit';
}

const LEDGER_ACCOUNTS: LedgerAccountOption[] = [
  { code: '1-1001', name: 'Kas di Tangan (Cash on Hand)', category: 'asset', normalBalance: 'debit' },
  { code: '1-1002', name: 'Bank BCA Operasional', category: 'asset', normalBalance: 'debit' },
  { code: '1-1003', name: 'Bank Mandiri Bisnis', category: 'asset', normalBalance: 'debit' },
  { code: '1-1100', name: 'Piutang Usaha (AR)', category: 'asset', normalBalance: 'debit' },
  { code: '2-1001', name: 'Hutang Usaha (AP)', category: 'liability', normalBalance: 'credit' },
  { code: '2-1002', name: 'Hutang Pajak (PPN/PPh)', category: 'liability', normalBalance: 'credit' },
  { code: '3-1001', name: 'Modal Disetor Pemilik', category: 'equity', normalBalance: 'credit' },
  { code: '4-1001', name: 'Pendapatan Penjualan & Invoice', category: 'revenue', normalBalance: 'credit' },
  { code: '5-1001', name: 'Harga Pokok Penjualan (HPP)', category: 'expense', normalBalance: 'debit' },
  { code: '6-1001', name: 'Beban Operasional & Kantor', category: 'expense', normalBalance: 'debit' },
  { code: '6-1002', name: 'Beban Gaji Karyawan', category: 'expense', normalBalance: 'debit' },
  { code: '6-1003', name: 'Beban Pemasaran & Iklan', category: 'expense', normalBalance: 'debit' },
];

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  startDate,
  endDate,
}) => {
  const { journalEntries, transactions } = useApp();
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Extract all ledger postings from journal entries & transactions
  const ledgerEntries = useMemo(() => {
    const list: {
      id: string;
      date: string;
      entryNumber: string;
      accountCode: string;
      accountName: string;
      description: string;
      debit: number;
      credit: number;
    }[] = [];

    // From explicit Journal Entries
    journalEntries.forEach(je => {
      if (je.date >= startDate && je.date <= endDate) {
        je.lines.forEach(line => {
          list.push({
            id: `${je.id}-${line.accountCode}-${line.id}`,
            date: je.date,
            entryNumber: je.entryNumber,
            accountCode: line.accountCode,
            accountName: line.accountName,
            description: je.description,
            debit: line.debit,
            credit: line.credit,
          });
        });
      }
    });

    // Also synthesize journal postings from standard completed transactions
    transactions
      .filter(t => t.status === 'completed' && t.transactionDate >= startDate && t.transactionDate <= endDate)
      .forEach(t => {
        if (t.type === 'income') {
          // Debit: Kas/Bank (1-1001 / 1-1002), Credit: Pendapatan (4-1001)
          list.push({
            id: `tx-deb-${t.id}`,
            date: t.transactionDate,
            entryNumber: `TX-${t.id.slice(-4)}`,
            accountCode: '1-1001',
            accountName: 'Kas & Bank Operasional',
            description: t.description,
            debit: t.amount,
            credit: 0,
          });
          list.push({
            id: `tx-crd-${t.id}`,
            date: t.transactionDate,
            entryNumber: `TX-${t.id.slice(-4)}`,
            accountCode: '4-1001',
            accountName: `Pendapatan: ${t.category}`,
            description: t.description,
            debit: 0,
            credit: t.amount,
          });
        } else {
          // Debit: Beban (6-1001), Credit: Kas/Bank (1-1001)
          list.push({
            id: `tx-deb-${t.id}`,
            date: t.transactionDate,
            entryNumber: `TX-${t.id.slice(-4)}`,
            accountCode: '6-1001',
            accountName: `Beban: ${t.category}`,
            description: t.description,
            debit: t.amount,
            credit: 0,
          });
          list.push({
            id: `tx-crd-${t.id}`,
            date: t.transactionDate,
            entryNumber: `TX-${t.id.slice(-4)}`,
            accountCode: '1-1001',
            accountName: 'Kas & Bank Operasional',
            description: t.description,
            debit: 0,
            credit: t.amount,
          });
        }
      });

    // Sort by date ascending
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [journalEntries, transactions, startDate, endDate]);

  // Filtered by selected account & search
  const filteredEntries = useMemo(() => {
    let result = ledgerEntries;
    if (selectedAccountCode !== 'ALL') {
      result = result.filter(e => e.accountCode.startsWith(selectedAccountCode.slice(0, 4)));
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        e =>
          e.description.toLowerCase().includes(q) ||
          e.accountName.toLowerCase().includes(q) ||
          e.entryNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }, [ledgerEntries, selectedAccountCode, searchKeyword]);

  // Totals
  const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="p-4 space-y-4">
      {/* Control Bar: Account Selector & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedAccountCode}
            onChange={(e) => setSelectedAccountCode(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium flex-1 sm:max-w-xs focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Akun (Chart of Accounts)</option>
            {LEDGER_ACCOUNTS.map(acc => (
              <option key={acc.code} value={acc.code}>
                {acc.code} - {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi / akun..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Kartu Buku Besar ({filteredEntries.length} Posting)
          </span>
          <span className="text-xs text-slate-500">{startDate} s/d {endDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">No. Jurnal</th>
                <th className="py-2.5 px-3">Akun</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3 text-right">Debit (Rp)</th>
                <th className="py-2.5 px-3 text-right">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada mutasi buku besar pada periode atau filter akun ini.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap text-slate-500">{e.date}</td>
                    <td className="py-2 px-3 whitespace-nowrap font-mono font-medium text-slate-800 dark:text-slate-200">{e.entryNumber}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{e.accountCode}</span> - {e.accountName}
                    </td>
                    <td className="py-2 px-3 max-w-[200px] truncate">{e.description}</td>
                    <td className="py-2 px-3 text-right font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                      {e.debit > 0 ? formatRupiah(e.debit) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium whitespace-nowrap text-rose-600 dark:text-rose-400">
                      {e.credit > 0 ? formatRupiah(e.credit) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredEntries.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-850 font-bold border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-right">TOTAL MUTASI:</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">{formatRupiah(totalDebit)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">{formatRupiah(totalCredit)}</td>
                </tr>
                <tr className="bg-slate-200/60 dark:bg-slate-800 text-[11px]">
                  <td colSpan={4} className="py-2 px-3 text-right">SALDO AKHIR BUKU BESAR:</td>
                  <td colSpan={2} className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                    {formatRupiah(balance)} ({balance >= 0 ? 'Posisi Debit' : 'Posisi Kredit'})
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
