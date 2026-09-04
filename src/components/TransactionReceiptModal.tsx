import React, { useState, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  Download, 
  Landmark, 
  Smartphone, 
  Briefcase, 
  Wallet, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight,
  ExternalLink,
  QrCode,
  Tag,
  Building2,
  FileText
} from 'lucide-react';
import { Transaction, Account } from '../types';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { getReceiptNumber, formatReceiptShareText } from '../utils/receipt';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { accounts, user } = useApp();
  const [copiedResi, setCopiedResi] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const account = accounts.find(a => a.id === transaction.accountId);
  const receiptNumber = getReceiptNumber(transaction);
  const isIncome = transaction.type === 'income';

  const handleCopyResi = async () => {
    try {
      await navigator.clipboard.writeText(receiptNumber);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const text = formatReceiptShareText(transaction, account, user.name);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resi Transaksi ${receiptNumber}`,
          text: text,
        });
        return;
      } catch (err) {
        // User cancelled or not supported, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getAccountIcon = (type?: Account['type']) => {
    switch (type) {
      case 'bank': return Landmark;
      case 'wallet': return Smartphone;
      case 'business': return Briefcase;
      default: return Wallet;
    }
  };

  const AccountIcon = getAccountIcon(account?.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Outer Card */}
      <div 
        id="transaction-receipt-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none print:w-full"
      >
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 print:hidden bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Resi Transaksi Resmi
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Cetak Resi"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div 
          ref={receiptRef}
          className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 print:p-6 print:overflow-visible print:bg-white print:text-black"
        >
          
          {/* Header Receipt Card with decorative tear effect */}
          <div className="text-center space-y-2 pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-1 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {transaction.status === 'completed' 
                ? 'Transaksi Berhasil' 
                : transaction.status === 'scheduled' 
                ? 'Transaksi Terjadwal' 
                : 'Transaksi Dicatat'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bukti sah pencatatan finansial elektronik FinTrack
            </p>
          </div>

          {/* Amount Display */}
          <div className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {isIncome ? 'Total Pemasukan' : 'Total Pengeluaran'}
            </span>
            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
            }`}>
              {isIncome ? '+' : '-'} {formatRupiah(transaction.amount)}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-3 h-3" />
              <span>Status: Selesai & Terverifikasi</span>
            </div>
          </div>

          {/* Receipt Number Badge with Copy */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">NOMOR RESI / REFERENSI</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                {receiptNumber}
              </span>
            </div>
            <button
              onClick={handleCopyResi}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-[11px] font-semibold shadow-2xs border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              {copiedResi ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Transaction Metadata Details */}
          <div className="space-y-2.5 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
              <span className="text-slate-400 font-medium">Tanggal Transaksi</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDateIndonesian(transaction.transactionDate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
              <span className="text-slate-400 font-medium">Waktu Transaksi</span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                {transaction.transactionTime} WIB
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
              <span className="text-slate-400 font-medium">Kategori</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {transaction.category}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
              <span className="text-slate-400 font-medium">Deskripsi Transaksi</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[220px] truncate">
                {transaction.description}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
              <span className="text-slate-400 font-medium">Sumber Rekening / Dompet</span>
              <div className="flex items-center gap-1.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                <AccountIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>{account ? account.name : 'Rekening Kas'}</span>
              </div>
            </div>

            {account?.accountNumber && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
                <span className="text-slate-400 font-medium">Nomor Akun</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {account.accountNumber}
                </span>
              </div>
            )}

            {transaction.recipient && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100/70 dark:border-slate-800/70">
                <span className="text-slate-400 font-medium">Pihak Penerima / Tujuan</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {transaction.recipient}
                </span>
              </div>
            )}

            {transaction.notes && (
              <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 italic">
                <span className="not-italic font-semibold text-slate-400 mr-1">Catatan:</span>
                "{transaction.notes}"
              </div>
            )}
          </div>

          {/* Visual QR Simulator / Security Barcode */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[10px]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>QR Verifikasi Transaksi</span>
              </div>
              <p className="text-slate-400 text-[9px]">
                Dipindai untuk memvalidasi keaslian resi
              </p>
              <p className="font-mono text-[9px] text-slate-400">
                ID: {transaction.id}
              </p>
            </div>

            {/* Generated clean SVG QR placeholder */}
            <div className="p-1.5 bg-white dark:bg-white rounded-lg shadow-2xs border border-slate-200">
              <svg className="w-11 h-11 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm0 4h2v2h-2v-2zm-4-4h2v4h-2v-4zm0 4h2v2h-2v-2zm4-6h2v2h-2v-2zm-6-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2z"/>
              </svg>
            </div>
          </div>

          {/* Official Footer Note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-500 dark:text-slate-400">
              FinTrack Digital Management System
            </p>
            <p>
              Resi ini disimpan secara otomatis dan dapat diakses kembali sewaktu-waktu.
            </p>
          </div>

        </div>

        {/* Bottom Actions (Hidden on Print) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center gap-2 print:hidden">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Format Teks Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan / Salin Resi</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Cetak Bukti Transaksi"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>

    </div>
  );
};

export default TransactionReceiptModal;
