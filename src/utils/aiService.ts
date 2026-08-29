export interface ChatContextData {
  totalBalance?: number;
  projectedBalance?: number;
  todayIncome?: number;
  todayExpense?: number;
  futureIncome?: number;
  futureExpense?: number;
  monthlyBudget?: number;
  recentTransactions?: any[];
  categoryBreakdown?: Record<string, number>;
  categoryBudgets?: any[];
  categoryAlerts?: any[];
  accounts?: any[];
}

export function generateOfflineReply(message: string, contextData: ChatContextData = {}): string {
  let reply = 'Halo! Saya FinAI, asisten keuangan cerdas Anda. ';
  const lower = message.toLowerCase();

  if (contextData.categoryAlerts && contextData.categoryAlerts.length > 0 && (lower.includes('limit') || lower.includes('peringatan') || lower.includes('melebihi') || lower.includes('anggaran') || lower.includes('alert') || lower.includes('solusi'))) {
    const alertsList = contextData.categoryAlerts.map((a: any) => `• **${a.category}**: Terpakai Rp ${Number(a.currentSpent).toLocaleString('id-ID')} (${a.percentage}% dari batas Rp ${Number(a.threshold).toLocaleString('id-ID')}) — Melebihi Rp ${Number(a.exceededAmount).toLocaleString('id-ID')}`).join('\n');
    reply += `🚨 **Peringatan Batas Anggaran Kategori Aktif!**\n\n${alertsList}\n\n💡 **Rekomendasi Tindakan FinAI**:\n1. **Tunda Pengeluaran Non-Esensial**: Bekukan sementara pembelian belanja atau hiburan tambahan hingga awal bulan depan.\n2. **Realokasi Pos Anggaran**: Pindahkan surplus anggaran dari kategori yang masih longgar.\n3. **Aktifkan Pembatasan Ketat**: Tinjau ulang mutasi terakhir untuk mengidentifikasi pos bocor halus.`;
  } else if (lower.includes('laporan') || lower.includes('report') || lower.includes('analisis') || lower.includes('mutasi')) {
    reply += `Berdasarkan data keuangan Anda saat ini:\n• **Total Saldo Aktif**: Rp ${(contextData.totalBalance || 25750000).toLocaleString('id-ID')}\n• **Total Pemasukan Tercatat**: Rp ${(contextData.todayIncome || 0).toLocaleString('id-ID')}\n• **Pengeluaran Hari Ini**: Rp ${(contextData.todayExpense || 0).toLocaleString('id-ID')}\n\n💡 *Evaluasi FinAI*: Arus kas Anda dalam posisi positif. Pantau pengeluaran operasional dan belanja agar tidak melebihi anggaran bulanan.`;
  } else if (lower.includes('tips') || lower.includes('hemat') || lower.includes('menabung') || lower.includes('tabung')) {
    reply += `Berikut 3 tips menabung teruji untuk Anda:\n1. **Aturan 50/30/20**: Alokasikan 50% untuk kebutuhan, 30% keinginan terencana, dan 20% langsung ke rekening tabungan/investasi di awal bulan.\n2. **Otomasi Dana Darurat**: Simpan minimal 3-6 bulan pengeluaran rutin di akun terpisah.\n3. **Cek Tagihan Rutin**: Tinjau pengeluaran berkala di menu 'Akan Datang' untuk menghindari denda keterlambatan.`;
  } else if (lower.includes('anggaran') || lower.includes('budget') || lower.includes('forecast') || lower.includes('cashflow')) {
    reply += `Analisis Anggaran & Cashflow:\n• **Batas Anggaran Bulanan**: Rp ${(contextData.monthlyBudget || 20000000).toLocaleString('id-ID')}\n• **Prediksi Saldo Mendatang**: Rp ${(contextData.projectedBalance || 28500000).toLocaleString('id-ID')}\n\nKondisi likuiditas kas Anda sangat aman untuk menutupi komitmen pembayaran beberapa minggu ke depan.`;
  } else {
    reply += `Saya siap membantu Anda meninjau laporan keuangan, menghitung alokasi anggaran, atau merancang strategi menabung terbaik berdasarkan mutasi akun FinTrack Anda. Apa yang ingin Anda diskusikan?`;
  }

  return reply;
}

export default {
  generateOfflineReply,
};
