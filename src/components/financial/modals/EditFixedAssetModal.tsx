import React, { useState, useEffect, useMemo } from 'react';
import { X, Landmark, Trash2, MapPin, User, FileText, Calculator } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { FixedAsset, FixedAssetCategory } from '../../../types';
import { parseRupiahInput, formatRupiah } from '../../../utils/formatters';

interface EditFixedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: FixedAsset | null;
}

export const EditFixedAssetModal: React.FC<EditFixedAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { updateFixedAsset, deleteFixedAsset } = useApp();

  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FixedAssetCategory>('equipment');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [costStr, setCostStr] = useState('');
  const [salvageStr, setSalvageStr] = useState('0');
  const [usefulLifeYears, setUsefulLifeYears] = useState<number>(4);
  const [depreciationMethod, setDepreciationMethod] = useState<'straight_line' | 'manual'>('straight_line');
  const [manualDepreciationStr, setManualDepreciationStr] = useState('0');
  const [location, setLocation] = useState('');
  const [pic, setPic] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'disposed' | 'maintenance'>('active');

  useEffect(() => {
    if (asset) {
      setAssetCode(asset.assetCode || '');
      setName(asset.name || '');
      setCategory(asset.category || 'equipment');
      setPurchaseDate(asset.purchaseDate || '');
      setCostStr(asset.acquisitionCost ? String(asset.acquisitionCost) : '0');
      setSalvageStr(asset.salvageValue ? String(asset.salvageValue) : '0');
      setUsefulLifeYears(asset.usefulLifeYears || 4);
      setDepreciationMethod(asset.depreciationMethod || 'straight_line');
      setManualDepreciationStr(asset.accumulatedDepreciation ? String(asset.accumulatedDepreciation) : '0');
      setLocation(asset.location || '');
      setPic(asset.pic || '');
      setNotes(asset.notes || '');
      setStatus(asset.status || 'active');
    }
  }, [asset]);

  const cost = parseRupiahInput(costStr);
  const salvage = parseRupiahInput(salvageStr);
  const manualDep = parseRupiahInput(manualDepreciationStr);

  const simulation = useMemo(() => {
    const depreciable = Math.max(0, cost - salvage);
    const months = Math.max(1, usefulLifeYears * 12);
    const monthlyDep = Math.round(depreciable / months);

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
      elapsedMonths,
      calculatedAccum,
      bookValue,
    };
  }, [cost, salvage, usefulLifeYears, purchaseDate, depreciationMethod, manualDep]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cost <= 0) return;

    updateFixedAsset(asset.id, {
      assetCode: assetCode.trim() || asset.assetCode,
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
      status,
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus aset "${asset.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteFixedAsset(asset.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Aset Tetap: {asset.assetCode}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah informasi perolehan, masa manfaat, atau status aset
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
        <form id="edit-fixed-asset-form" onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Kode Aset
              </label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Nama Aset Tetap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FixedAssetCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
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
                Tanggal Perolehan
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Status Aset
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="active">Aktif Digunakan</option>
                <option value="maintenance">Dalam Pemeliharaan / Servis</option>
                <option value="disposed">Dihapusbukukan / Dijual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Nilai Perolehan (Harga Beli)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  value={costStr}
                  onChange={(e) => setCostStr(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              {cost > 0 && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {formatRupiah(cost)}
                </span>
              )}
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                Nilai Residu / Sisa
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  value={salvageStr}
                  onChange={(e) => setSalvageStr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

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
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Metode Penyusutan</span>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="editDepMethod"
                    checked={depreciationMethod === 'straight_line'}
                    onChange={() => setDepreciationMethod('straight_line')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Otomatis (Garis Lurus)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="editDepMethod"
                    checked={depreciationMethod === 'manual'}
                    onChange={() => setDepreciationMethod('manual')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Input Manual Akumulasi</span>
                </label>
              </div>
            </div>

            {depreciationMethod === 'manual' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block">
                  Nilai Akumulasi Penyusutan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    value={manualDepreciationStr}
                    onChange={(e) => setManualDepreciationStr(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Lokasi Aset
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-300 font-semibold mb-1 block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan / Serial Number / Spesifikasi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Kartu Ringkasan Perhitungan */}
          {cost > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                <Calculator className="w-4 h-4" />
                <span>Nilai Buku Saat Ini:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                  <div className="text-[10px] text-slate-500">Harga Perolehan</div>
                  <div className="font-bold text-slate-900 dark:text-white">{formatRupiah(cost)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                  <div className="text-[10px] text-slate-500">Penyusutan / Bln</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(simulation.monthlyDep)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                  <div className="text-[10px] text-slate-500">Akumulasi Penyusutan</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400">({formatRupiah(simulation.calculatedAccum)})</div>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                  <div className="text-[10px] text-slate-500">Nilai Buku Bersih</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(simulation.bookValue)}</div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Aset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-fixed-asset-form"
              disabled={!name.trim() || cost <= 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
