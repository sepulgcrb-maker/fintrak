import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles,
  Car,
  Plane,
  Shield,
  Smartphone,
  GraduationCap,
  Home,
  PiggyBank,
  AlertCircle,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SavingsGoal, Account } from '../types';
import { formatRupiah } from '../utils/formatters';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

export const GOAL_CATEGORIES = [
  { id: 'Dana Darurat', name: 'Dana Darurat', icon: Shield },
  { id: 'Kendaraan', name: 'Kendaraan', icon: Car },
  { id: 'Liburan', name: 'Liburan & Travel', icon: Plane },
  { id: 'Gadget', name: 'Gadget & Elektronik', icon: Smartphone },
  { id: 'Pendidikan', name: 'Pendidikan & Kursus', icon: GraduationCap },
  { id: 'Properti', name: 'Rumah & Properti', icon: Home },
  { id: 'Lainnya', name: 'Impian Lainnya', icon: PiggyBank },
];

export const GOAL_COLORS = [
  { name: 'Emerald', gradient: 'from-emerald-500 to-teal-700', bg: 'bg-emerald-500', bar: 'bg-emerald-500' },
  { name: 'Blue', gradient: 'from-blue-600 to-indigo-700', bg: 'bg-blue-600', bar: 'bg-blue-600' },
  { name: 'Purple', gradient: 'from-purple-600 to-indigo-800', bg: 'bg-purple-600', bar: 'bg-purple-600' },
  { name: 'Amber', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500', bar: 'bg-amber-500' },
  { name: 'Rose', gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500', bar: 'bg-rose-500' },
  { name: 'Cyan', gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500', bar: 'bg-cyan-500' },
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useApp();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Dana Darurat');
  const [color, setColor] = useState('from-emerald-500 to-teal-700');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setDeadline(goalToEdit.deadline);
      setCategory(goalToEdit.category || 'Dana Darurat');
      setColor(goalToEdit.color || 'from-emerald-500 to-teal-700');
      setNotes(goalToEdit.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Default deadline: 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setDeadline(d.toISOString().split('T')[0]);
      setCategory('Dana Darurat');
      setColor('from-emerald-500 to-teal-700');
      setNotes('');
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseInt(targetAmount.replace(/[^0-9]/g, ''), 10);
    const parsedCurrent = parseInt(currentAmount.replace(/[^0-9]/g, ''), 10) || 0;

    if (!title.trim() || isNaN(parsedTarget) || parsedTarget <= 0 || !deadline) {
      return;
    }

    if (goalToEdit) {
      updateSavingsGoal(goalToEdit.id, {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline,
        category,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      addSavingsGoal({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline,
        category,
        color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goalToEdit && confirm(`Hapus target tabungan "${goalToEdit.title}"?`)) {
      deleteSavingsGoal(goalToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {goalToEdit ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tentukan target dana impian dan batas waktu pencapaian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Impian / Target Tabungan
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: DP Rumah Minimalis, Liburan Jepang, Dana Darurat 6 Bulan"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Dana (Rp)
              </label>
              <input
                type="number"
                required
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="10000000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Dana Terkumpul Saat Ini (Rp)
              </label>
              <input
                type="number"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Tabungan
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {GOAL_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Batas Waktu (Deadline)
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Warna Tema
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GOAL_COLORS.map(c => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColor(c.gradient)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                    color === c.gradient
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan / Motivasi (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Sisihkan Rp 1.500.000 setiap awal gajian"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Calculation preview */}
          {targetAmount && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Simulasi Rencana Tabungan:</span>
              </div>
              {(() => {
                const target = parseInt(targetAmount.replace(/[^0-9]/g, ''), 10) || 0;
                const current = parseInt(currentAmount.replace(/[^0-9]/g, ''), 10) || 0;
                const remaining = Math.max(0, target - current);
                const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                
                const deadlineDate = new Date(deadline);
                const today = new Date();
                const diffTime = deadlineDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const diffMonths = Math.max(1, Math.ceil(diffDays / 30));
                const perMonth = diffMonths > 0 ? Math.ceil(remaining / diffMonths) : remaining;

                return (
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p>• Progres saat ini: <strong>{percent}%</strong> ({formatRupiah(current)} dari {formatRupiah(target)})</p>
                    <p>• Sisa kekurangan: <strong>{formatRupiah(remaining)}</strong> ({diffDays > 0 ? `${diffDays} hari lagi / ~${diffMonths} bulan` : 'Jatuh tempo lewat'})</p>
                    {remaining > 0 && diffDays > 0 && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        💡 Rekomendasi: Tabung ~<strong>{formatRupiah(perMonth)} / bulan</strong> untuk mencapai target tepat waktu.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {goalToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {goalToEdit ? 'Simpan Perubahan' : 'Buat Target'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SavingsGoalModal;
