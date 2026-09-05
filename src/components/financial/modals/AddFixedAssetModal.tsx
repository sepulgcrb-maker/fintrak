import React, { useState, useMemo } from 'react';
import { X, Landmark, Calendar, DollarSign, Clock, MapPin, User, FileText, Calculator } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { FixedAssetCategory, FixedAsset } from '../../../types';
import { parseRupiahInput, formatRupiah } from '../../../utils/formatters';

interface AddFixedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFixedAssetModal: React.FC<AddFixedAssetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addFixedAsset, fixedAssets } = useApp();

  const currentYear = new Date().getFullYear();
  const defaultCode = `AST-${currentYear}-${String(fixedAssets.length + 1).padStart(3, '0')}`;

  const [assetCode, setAssetCode] = useState(defaultCode);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FixedAssetCategory>('equipment');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [costStr, setCostStr] = useState('');
  const [salvageStr, setSalvageStr] = useState('0');
  const [usefulLifeYears, setUsefulLifeYears] = useState<number>(4);
  const [depreciationMethod, setDepreciationMethod] = useState<'straight_line' | 'manual'>('straight_line');
  const [manualDepreciationStr, setManualDepreciationStr] = useState('0');
  const [location, setLocation] = useState('Kantor Pusat');
  const [pic, setPic] = useState('');
  const [notes, setNotes] = useState('');

  // Live simulation calculations
  const cost = parseRupiahInput(costStr);
  const salvage = parseRupiahInput(salvageStr);
  const manualDep = parseRupiahInput(manualDepreciationStr);

  const simulation = useMemo(() => {
    const depreciable = Math.max(0, cost - salvage);
    const months = Math.max(1, usefulLifeYears * 12);
    const monthlyDep = Math.round(depreciable / months);
    const annualDep = monthlyDep * 12;

    const pDate = new Date(purchaseDate);
    const today = new Date();
    let elapsedMonths = 0;
    if (!isNaN(pDate.getTime())) {
      elapsedMonths = Math.max(
        0,
        (today.getFullYear() - pDate.getFullYear()) * 12 + (today.getMonth() - pDate.getMonth())
      );
    }

    const calculatedAccum = depreciationMethod === 'manual'
      ? Math.min(cost, manualDep)
      : Math.min(depreciable, elapsedMonths * monthlyDep);

    const bookValue = Math.max(salvage, cost - calculatedAccum);

    return {
      monthlyDep,
      annualDep,
      elapsedMonths,
      calculatedAccum,
      bookValue,
    };
  }, [cost, salvage, usefulLifeYears, purchaseDate, depreciationMethod, manualDep]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cost <= 0) return;

    addFixedAsset({
      assetCode: assetCode.trim() || defaultCode,
      name: name.trim(),
      category,
      purchaseDate,
      acquisitionCost: cost,
      salvageValue: salvage,
      usefulLifeYears,
      depreciationMethod,
      accumulatedDepreciation: simulation.calculatedAccum,
      location: location.trim() || undefined,
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'active',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Input Manual Aset Tetap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan aktiva tetap, masa manfaat, dan amortisasi/penyusutan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with scroll */}
        <form id="fixed-asset-form" onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Baris 1: Kode & Nama Aset */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Kode Aset <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Nama Aset Tetap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Laptop Apple MacBook Pro M2, Mobil Avanza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Baris 2: Kategori & Tanggal Perolehan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Kategori Aset
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FixedAssetCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="equipment">Peralatan Kantor & Komputer (IT)</option>
                <option value="vehicles">Kendaraan Operasional</option>
                <option value="machinery">Mesin & Alat Produksi</option>
                <option value="furniture">Furnitur & Mebel Kantor</option>
                <option value="building">Gedung & Bangunan</option>
                <option value="other">Aset Tetap Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Tanggal Perolehan (Beli)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Baris 3: Nilai Perolehan & Nilai Residu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Nilai Perolehan (Harga Beli) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  placeholder="0"
                  value={costStr}
                  onChange={(e) => setCostStr(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              {cost > 0 && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  Terbaca: {formatRupiah(cost)}
                </span>
              )}
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Estimasi Nilai Residu / Sisa (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  placeholder="0"
                  value={salvageStr}
                  onChange={(e) => setSalvageStr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              {salvage > 0 && (
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Nilai Sisa: {formatRupiah(salvage)}
                </span>
              )}
            </div>
          </div>

          {/* Baris 4: Masa Manfaat & Golongan Pajak */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-600 dark:text-slate-300 font-semibold block">
                Masa Manfaat (Tahun)
              </label>
              <span className="text-[11px] text-slate-400">
                Penyusutan: {usefulLifeYears > 0 ? (100 / usefulLifeYears).toFixed(1) : 0}% / tahun
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { years: 4, label: '4 Thn (Gol. 1)' },
                { years: 8, label: '8 Thn (Gol. 2)' },
                { years: 16, label: '16 Thn (Gol. 3)' },
                { years: 20, label: '20 Thn (Gedung)' },
              ].map((g) => (
                <button
                  key={g.years}
                  type="button"
                  onClick={() => setUsefulLifeYears(g.years)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                    usefulLifeYears === g.years
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Atau tentukan custom:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={usefulLifeYears}
                onChange={(e) => setUsefulLifeYears(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-center"
              />
              <span className="text-slate-500 font-medium">Tahun ({usefulLifeYears * 12} Bulan)</span>
            </div>
          </div>

          {/* Baris 5: Metode Penyusutan */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Metode Penyusutan</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="depMethod"
                    checked={depreciationMethod === 'straight_line'}
                    onChange={() => setDepreciationMethod('straight_line')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Otomatis (Garis Lurus)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="depMethod"
                    checked={depreciationMethod === 'manual'}
                    onChange={() => setDepreciationMethod('manual')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Input Manual Akumulasi</span>
                </label>
              </div>
            </div>

            {depreciationMethod === 'manual' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                  Nilai Akumulasi Penyusutan Berjalan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={manualDepreciationStr}
                    onChange={(e) => setManualDepreciationStr(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Gunakan input manual jika aset sudah berjalan beberapa tahun sebelumnya.
                </span>
              </div>
            )}
          </div>

          {/* Baris 6: Lokasi & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Lokasi Aset
              </label>
              <input
                type="text"
                placeholder="Kantor Pusat, Gudang, Studio"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                placeholder="Nama staf / pemakai aset"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Baris 7: Catatan Tambahan */}
          <div>
            <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan / Spesifikasi / Nomor Seri
            </label>
            <textarea
              rows={2}
              placeholder="Catatan nomor rangka/mesin, serial number, garansi, kondisi fisik..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Kartu Kalkulasi Simulasi Otomatis */}
          {cost > 0 && (
            <div className="p-3.5 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <Calculator className="w-4 h-4" />
                <span>Simulasi Perhitungan Nilai Buku & Beban Penyusutan:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Harga Perolehan</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatRupiah(cost)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Beban per Bulan</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(simulation.monthlyDep)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Akumulasi Penyusutan</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400">({formatRupiah(simulation.calculatedAccum)})</div>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Nilai Buku Bersih</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(simulation.bookValue)}</div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="fixed-asset-form"
            disabled={!name.trim() || cost <= 0}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Simpan Aset Tetap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
