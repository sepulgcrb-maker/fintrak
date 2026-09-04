import { Transaction, Account } from '../types';
import { formatRupiah, formatDateIndonesian } from './formatters';

/**
 * Returns a stable and standardized Receipt Number for any transaction.
 * E.g., "RESI-20260904-7821"
 */
export const getReceiptNumber = (tx: Partial<Transaction> & { id: string; transactionDate: string }): string => {
  if (tx.receiptNumber && tx.receiptNumber.trim()) {
    return tx.receiptNumber;
  }
  
  const dateClean = (tx.transactionDate || '').replace(/[^0-9]/g, '') || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  // Extract digits or hash from ID
  const idDigits = tx.id.replace(/\D/g, '');
  const suffix = idDigits ? idDigits.slice(-4).padStart(4, '7') : Math.abs(hashCode(tx.id)).toString().slice(-4).padStart(4, '1');
  
  return `RESI-${dateClean}-${suffix}`;
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Generates formatted text of the receipt suitable for WhatsApp or clipboard sharing.
 */
export const formatReceiptShareText = (
  tx: Transaction, 
  account?: Account, 
  userName: string = 'Pengguna FinTrack'
): string => {
  const receiptNum = getReceiptNumber(tx);
  const isIncome = tx.type === 'income';
  const typeLabel = isIncome ? 'Pemasukan (+)' : 'Pengeluaran (-)';
  const statusLabel = tx.status === 'completed' 
    ? 'BERHASIL / SELESAI' 
    : tx.status === 'pending' 
    ? 'MENUNGGU KONFIRMASI' 
    : tx.status === 'scheduled' 
    ? 'TERJADWAL' 
    : 'CATATAN';

  const dateFormatted = formatDateIndonesian(tx.transactionDate);
  const accountInfo = account ? `${account.name}${account.accountNumber ? ` (${account.accountNumber})` : ''}` : 'Rekening FinTrack';

  return `🧾 *BUKTI TRANSAKSI ELEKTRONIK (E-RESI)*
*FinTrack - Catatan Keuangan Digital*
----------------------------------------
*No. Resi:* ${receiptNum}
*Status:* ${statusLabel}
*Waktu:* ${dateFormatted} pukul ${tx.transactionTime} WIB
----------------------------------------
*Jumlah:* ${isIncome ? '+' : '-'} ${formatRupiah(tx.amount)}
*Tipe:* ${typeLabel}
*Kategori:* ${tx.category}
*Deskripsi:* ${tx.description}
${tx.recipient ? `*Penerima/Tujuan:* ${tx.recipient}\n` : ''}*Sumber Kas:* ${accountInfo}
*Pencatat:* ${userName}
${tx.notes ? `*Catatan:* "${tx.notes}"\n` : ''}----------------------------------------
_Dokumen ini merupakan bukti catatan transaksi resmi yang diterbitkan secara elektronik oleh FinTrack App._`;
};
