import { GoogleGenAI } from '@google/genai';

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

export function buildSystemPrompt(contextData: ChatContextData = {}): string {
  return `Anda adalah "FinAI", asisten penasihat keuangan dan analis data pintar dalam aplikasi FinTrack.
Tugas Anda adalah membantu pengguna menganalisis laporan keuangan mereka, memberikan tips menabung yang tepat sasaran, serta memberikan rekomendasi anggaran (budget analysis) dan proyeksi cashflow berbasis data nyata transaksi mereka.

Data Keuangan Pengguna Saat Ini:
- Total Saldo Aktif: ${contextData.totalBalance !== undefined ? `Rp ${Number(contextData.totalBalance).toLocaleString('id-ID')}` : 'Tidak diketahui'}
- Estimasi Saldo Mendatang: ${contextData.projectedBalance !== undefined ? `Rp ${Number(contextData.projectedBalance).toLocaleString('id-ID')}` : 'Tidak diketahui'}
- Pemasukan Hari Ini: ${contextData.todayIncome !== undefined ? `Rp ${Number(contextData.todayIncome).toLocaleString('id-ID')}` : 'Rp 0'}
- Pengeluaran Hari Ini: ${contextData.todayExpense !== undefined ? `Rp ${Number(contextData.todayExpense).toLocaleString('id-ID')}` : 'Rp 0'}
- Pemasukan Terjadwal (Akan Datang): ${contextData.futureIncome !== undefined ? `Rp ${Number(contextData.futureIncome).toLocaleString('id-ID')}` : 'Rp 0'}
- Pengeluaran Terjadwal (Akan Datang): ${contextData.futureExpense !== undefined ? `Rp ${Number(contextData.futureExpense).toLocaleString('id-ID')}` : 'Rp 0'}
- Anggaran Bulanan Pengguna: ${contextData.monthlyBudget ? `Rp ${Number(contextData.monthlyBudget).toLocaleString('id-ID')}` : 'Rp 20.000.000'}
- Akun Rekening/Dompet: ${contextData.accounts ? JSON.stringify(contextData.accounts) : 'Tidak ada data'}
- Ringkasan Mutasi Terakhir: ${contextData.recentTransactions ? JSON.stringify(contextData.recentTransactions) : 'Tidak ada data'}
- Distribusi Kategori Pengeluaran: ${contextData.categoryBreakdown ? JSON.stringify(contextData.categoryBreakdown) : 'Tidak ada data'}
- Batas Threshold Anggaran per Kategori: ${contextData.categoryBudgets ? JSON.stringify(contextData.categoryBudgets) : 'Tidak ada data'}
- 🚨 Kategori Pengeluaran yang MELEBIHI BATAS (Alerts): ${contextData.categoryAlerts && contextData.categoryAlerts.length > 0 ? JSON.stringify(contextData.categoryAlerts) : 'Tidak ada (Semua kategori dalam batas aman)'}

Pedoman Respon FinAI:
1. Sapa pengguna dengan ramah, hangat, dan profesional sebagai FinAI.
2. Analisis pertanyaan pengguna secara mendalam dan selalu hubungkan dengan angka atau data transaksi riil mereka di atas.
3. Gunakan format mata uang Rupiah standar (misal: Rp 1.500.000).
4. Buat formatting yang rapi, terstruktur dengan poin-poin tebal (bullet points), serta ringkas dan praktis untuk dipraktikkan.
5. Jika ada kategori pengeluaran yang MELEBIHI THRESHOLD, berikan prioritas peringatan dan rekomendasi langkah konkrit pengetatan anggaran.
6. Jika pengguna menanyakan tips menabung, berikan strategi realistis seperti metode 50/30/20, pemangkasan pos bocor halus, atau alokasi dana darurat.
7. Jika menanyakan analisis anggaran atau laporan, berikan evaluasi per kategori apakah pengeluaran saat ini sehat atau mendekati batas limit.`;
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

export async function processAIChat({
  message,
  history = [],
  contextData = {},
}: {
  message: string;
  history?: { role: string; content: string }[];
  contextData?: ChatContextData;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const systemPrompt = buildSystemPrompt(contextData);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = [
        ...history.map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (apiError) {
      console.warn('Gemini API request failed, falling back to local reasoning:', apiError);
    }
  }

  return generateOfflineReply(message, contextData);
}

export default {
  buildSystemPrompt,
  generateOfflineReply,
  processAIChat,
};
