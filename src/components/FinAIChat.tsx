import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Copy, 
  Check, 
  TrendingUp, 
  PieChart, 
  Lightbulb, 
  ShieldCheck,
  PiggyBank,
  Wallet,
  ArrowRight,
  BellRing,
  Sliders,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { formatRupiah } from '../utils/formatters';
import { generateOfflineReply } from '../utils/aiService';
import { CategoryBudgetModal } from './CategoryBudgetModal';

export const FinAIChat: React.FC = () => {
  const { 
    totalBalance, 
    projectedBalance, 
    todayIncome, 
    todayExpense, 
    futureIncome, 
    futureExpense, 
    transactions, 
    accounts,
    user,
    categoryBudgets,
    categoryAlerts,
    openAddModal,
    setActiveTab
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCategoryBudgetModalOpen, setIsCategoryBudgetModalOpen] = useState(false);

  // Calculate high-level breakdown for prompt context
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Halo ${user?.name ? user.name.split(' ')[0] : 'Sobat FinTrack'}! 👋 Saya **FinAI**, asisten penasihat keuangan pribadi & analis data finansial Anda yang didukung oleh Gemini API.

Saya telah menganalisis ringkasan akun Anda:
• **Total Saldo Aktif**: ${formatRupiah(totalBalance)}
• **Proyeksi Saldo**: ${formatRupiah(projectedBalance)}
• **Batas Anggaran Bulanan**: ${formatRupiah(user?.monthlyBudget || 20000000)}
• **Sistem Peringatan Kategori**: ${categoryAlerts.length > 0 ? `🚨 ${categoryAlerts.length} Kategori Melebihi Threshold!` : '🟢 Semua kategori dalam batas aman'}
• **Total Transaksi Tercatat**: ${transactions.length} mutasi

Bagaimana saya dapat membantu Anda hari ini? Anda bisa meminta **analisis laporan keuangan**, **rekomendasi tips menabung**, atau **evaluasi batas anggaran kategori**!`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '📊 Analisis Laporan Keuangan', action: 'view_reports' },
        { label: '🔮 Cek Proyeksi Cashflow', action: 'view_planning' },
      ]
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('finai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialMessages;
      }
    }
    return initialMessages;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('finai_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    ...(categoryAlerts.length > 0 
      ? [{ label: `🚨 Solusi ${categoryAlerts[0].category} Over Limit`, prompt: `Pengeluaran kategori ${categoryAlerts[0].category} saya sudah mencapai ${categoryAlerts[0].percentage}% dan melebihi batas bulanan sebesar ${formatRupiah(categoryAlerts[0].exceededAmount)}. Tolong berikan evaluasi mendalam dan rekomendasi langkah konkrit untuk menekan pengeluaran ini.` }]
      : []
    ),
    { label: '📊 Analisis Laporan', prompt: 'Tolong berikan analisis lengkap mengenai laporan pemasukan dan pengeluaran saya berdasarkan data transaksi yang ada.' },
    { label: '💡 Tips Menabung', prompt: 'Berikan tips menabung yang paling efektif dan realistis untuk meningkatkan porsi tabungan saya bulan ini.' },
    { label: '🎯 Evaluasi Anggaran Kategori', prompt: 'Tolong evaluasi penggunaan anggaran per kategori pengeluaran saya bulan ini. Apakah ada pos pengeluaran yang perlu dipangkas?' },
    { label: '🔮 Prediksi Cashflow', prompt: 'Bagaimana peramalan saldo dan arus kas masa depan saya berdasarkan transaksi yang terjadwal?' },
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputMessage.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build transactions context
      const recentTransactions = transactions.slice(0, 12).map(t => ({
        keterangan: t.description,
        nominal: t.amount,
        tipe: t.type,
        kategori: t.category,
        tanggal: t.transactionDate,
        status: t.status,
      }));

      const contextData = {
        totalBalance,
        projectedBalance,
        todayIncome,
        todayExpense,
        futureIncome,
        futureExpense,
        monthlyBudget: user?.monthlyBudget || 20000000,
        recentTransactions,
        categoryBreakdown: expenseByCategory,
        categoryBudgets,
        categoryAlerts,
        accounts: accounts.map(a => ({ nama: a.name, saldo: a.balance, tipe: a.type })),
      };

      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      let aiReply = '';
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
            contextData,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          aiReply = data.reply || generateOfflineReply(text, contextData);
        } else {
          // If serverless route reports error or status 500/404, smoothly use client financial engine
          aiReply = generateOfflineReply(text, contextData);
        }
      } catch (netErr) {
        // Network/CORS/offline fallback
        aiReply = generateOfflineReply(text, contextData);
      }

      // Determine smart interactive actions
      const lower = text.toLowerCase();
      const suggestedActions: ChatMessage['suggestedActions'] = [];
      if (lower.includes('tambah') || lower.includes('catat') || lower.includes('pemasukan')) {
        suggestedActions.push({ label: '+ Catat Pemasukan', action: 'add_income' });
      }
      if (lower.includes('pengeluaran') || lower.includes('bayar') || lower.includes('belanja')) {
        suggestedActions.push({ label: '- Catat Pengeluaran', action: 'add_expense' });
      }
      if (lower.includes('laporan') || lower.includes('analisis') || lower.includes('kategori')) {
        suggestedActions.push({ label: '📊 Buka Laporan Lengkap', action: 'view_reports' });
      }
      if (lower.includes('forecast') || lower.includes('prediksi') || lower.includes('jadwal') || lower.includes('cashflow')) {
        suggestedActions.push({ label: '🔮 Buka Perencanaan', action: 'view_planning' });
      }

      const aiMsg: ChatMessage = {
        id: `finai-${Date.now() + 1}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Terjadi gangguan jaringan saat menghubungi FinAI. Pastikan koneksi internet stabil dan coba kembali.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm('Bersihkan riwayat obrolan FinAI?')) {
      setMessages(initialMessages);
      localStorage.removeItem('finai_chat_history');
    }
  };

  const executeAction = (action: 'add_income' | 'add_expense' | 'view_planning' | 'view_reports') => {
    if (action === 'add_income') openAddModal('income', 'completed');
    else if (action === 'add_expense') openAddModal('expense', 'completed');
    else if (action === 'view_planning') setActiveTab('planning');
    else if (action === 'view_reports') setActiveTab('reports');
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-2" />;
      
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={idx} className="leading-relaxed mb-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="italic text-slate-600 dark:text-slate-300">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] px-4 sm:px-6 py-2">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 dark:shadow-none">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">FinAI Advisor</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/40">
                <ShieldCheck className="w-2.5 h-2.5" /> Gemini 2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Analisis Laporan • Tips Menabung • Real-time Budget Alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCategoryBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Kelola Batas Anggaran Kategori"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Batas Kategori</span>
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Category Spending Alert Banner */}
      {categoryAlerts.length > 0 && (
        <div className="mb-2.5 p-3 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-xs animate-in slide-in-from-top-2 duration-200 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  🚨 Real-time FinAI Alert: {categoryAlerts.length} Kategori Melebihi Batas Bulanan!
                </h4>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                  {categoryAlerts.map(a => (
                    <span 
                      key={a.category} 
                      className="inline-flex items-center gap-1 bg-white/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-lg font-medium border border-rose-200/60 dark:border-rose-700/50"
                    >
                      <strong>{a.category}</strong>: {formatRupiah(a.currentSpent)} ({a.percentage}% dari limit {formatRupiah(a.threshold)})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCategoryBudgetModalOpen(true)}
              className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0 flex items-center gap-0.5 pt-0.5"
            >
              Atur Limit <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[86%] sm:max-w-[80%] rounded-3xl p-4 shadow-xs relative ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="text-xs">
                  {renderFormattedText(msg.content)}
                </div>

                {/* Suggested Action Buttons */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    {msg.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => executeAction(act.action)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold transition-all active:scale-95 cursor-pointer border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1"
                      >
                        {act.label}
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}

                <div className={`flex items-center justify-between mt-2 pt-1 text-[9px] ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-60 hover:opacity-100 transition-opacity p-0.5 cursor-pointer ml-2"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl rounded-tl-xs p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] text-slate-400">FinAI sedang menganalisis data keuangan Anda...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompt Carousel */}
      <div className="py-2 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
        {quickPrompts.map((item, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(item.prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 whitespace-nowrap shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 pt-1 pb-2"
      >
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
          <input
            type="text"
            placeholder="Tanyakan analisis laporan, tips menabung, atau review anggaran..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              inputMessage.trim() && !isLoading
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Category Budget Threshold Modal */}
      <CategoryBudgetModal 
        isOpen={isCategoryBudgetModalOpen} 
        onClose={() => setIsCategoryBudgetModalOpen(false)} 
      />
    </div>
  );
};

export default FinAIChat;
