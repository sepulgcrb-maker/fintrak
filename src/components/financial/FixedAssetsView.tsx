import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Plus, 
  Search, 
  Filter, 
  Laptop, 
  Truck, 
  Cog, 
  Armchair, 
  Building2, 
  Box, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FixedAsset, FixedAssetCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { calculateAssetDepreciation } from '../../utils/financialCalculations';

interface FixedAssetsViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (asset: FixedAsset) => void;
}

const CATEGORY_LABELS: Record<FixedAssetCategory, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  equipment: { label: 'Peralatan & IT', icon: Laptop, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800' },
  vehicles: { label: 'Kendaraan', icon: Truck, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
  machinery: { label: 'Mesin Produksi', icon: Cog, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
  furniture: { label: 'Furnitur & Mebel', icon: Armchair, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
  building: { label: 'Gedung & Bangunan', icon: Building2, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' },
  other: { label: 'Aset Lainnya', icon: Box, color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
};

export const FixedAssetsView: React.FC<FixedAssetsViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { fixedAssets, deleteFixedAsset } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return fixedAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (asset.pic && asset.pic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [fixedAssets, searchQuery, selectedCategory, selectedStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalCost = 0;
    let totalDepreciation = 0;
    let totalBookValue = 0;
    let activeCount = 0;

    fixedAssets.forEach((asset) => {
      if (asset.status === 'active') {
        activeCount++;
      }
      const depInfo = calculateAssetDepreciation(asset);
      totalCost += asset.acquisitionCost || 0;
      totalDepreciation += depInfo.accumulatedDepreciation;
      totalBookValue += depInfo.bookValue;
    });

    return {
      totalCost,
      totalDepreciation,
      totalBookValue,
      activeCount,
      totalCount: fixedAssets.length,
    };
  }, [fixedAssets]);

  const handleDelete = (asset: FixedAsset) => {
    if (window.confirm(`Hapus data aset tetap "${asset.name}" (${asset.assetCode})?`)) {
      deleteFixedAsset(asset.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Pengelolaan Aset Tetap
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Daftar aktiva tetap berwujud, nilai perolehan, simulasi penyusutan garis lurus, dan nilai buku bersih.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Aset Tetap</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Nilai Perolehan</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(metrics.totalCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Harga beli seluruh aset terdaftar
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Akumulasi Penyusutan</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
            ({formatRupiah(metrics.totalDepreciation)})
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total amortisasi / beban depresiasi
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Nilai Buku Bersih (NBV)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatRupiah(metrics.totalBookValue)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Masuk ke Neraca (Aset Tetap)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Jumlah Inventaris</span>
            <Landmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {metrics.activeCount} <span className="text-xs font-normal text-slate-500">/ {metrics.totalCount} Aset</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.activeCount} status aktif digunakan
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode, nama aset, lokasi, PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="maintenance">Pemeliharaan</option>
              <option value="disposed">Dihapusbukukan</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Semua ({fixedAssets.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, cat]) => {
            const count = fixedAssets.filter((a) => a.category === key).length;
            const Icon = cat.icon;
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assets Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum ada aset tetap ditemukan
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Klik tombol di bawah untuk menambahkan data perolehan inventaris atau aktiva tetap perusahaan Anda secara manual.
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Aset Tetap Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 pl-4">Aset & Kode</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Tgl Beli & Manfaat</th>
                  <th className="p-3.5 text-right">Nilai Perolehan</th>
                  <th className="p-3.5 text-right">Akum. Penyusutan</th>
                  <th className="p-3.5 text-right">Nilai Buku (NBV)</th>
                  <th className="p-3.5">Lokasi / PIC</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 pr-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.map((asset) => {
                  const catInfo = CATEGORY_LABELS[asset.category] || CATEGORY_LABELS.other;
                  const Icon = catInfo.icon;
                  const dep = calculateAssetDepreciation(asset);
                  const progressPct = asset.acquisitionCost > 0
                    ? Math.min(100, Math.round((dep.accumulatedDepreciation / asset.acquisitionCost) * 100))
                    : 0;

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Nama & Kode */}
                      <td className="p-3.5 pl-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {asset.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {asset.assetCode}
                        </div>
                        {asset.notes && (
                          <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                            {asset.notes}
                          </div>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${catInfo.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{catInfo.label}</span>
                        </span>
                      </td>

                      {/* Tgl & Manfaat */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{asset.purchaseDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {asset.usefulLifeYears} Tahun ({asset.usefulLifeYears * 12} bln)
                        </div>
                      </td>

                      {/* Nilai Perolehan */}
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatRupiah(asset.acquisitionCost)}
                      </td>

                      {/* Akumulasi Penyusutan */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="font-semibold text-rose-600 dark:text-rose-400">
                          ({formatRupiah(dep.accumulatedDepreciation)})
                        </div>
                        <div className="w-24 ml-auto mt-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressPct > 75 ? 'bg-rose-500' : 'bg-amber-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Terpakai {progressPct}%
                        </div>
                      </td>

                      {/* Nilai Buku */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(dep.bookValue)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Beban: {formatRupiah(dep.monthlyDepreciation)}/bln
                        </div>
                      </td>

                      {/* Lokasi / PIC */}
                      <td className="p-3.5">
                        {asset.location && (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{asset.location}</span>
                          </div>
                        )}
                        {asset.pic && (
                          <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{asset.pic}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          asset.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : asset.status === 'maintenance'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {asset.status === 'active' ? 'Aktif' : asset.status === 'maintenance' ? 'Servis' : 'Dihapus'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="p-3.5 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditModal(asset)}
                            title="Edit Aset"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset)}
                            title="Hapus Aset"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PSAK / Pajak Guidance Banner */}
      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Standar Akuntansi & Pajak Penyusutan Aset Tetap:</strong> Menggunakan metode garis lurus (<em>Straight Line Method</em>). Golongan 1 (Komputer, printer, HP) disusutkan 4 tahun (25%/thn); Golongan 2 (Mobil, motor, truk ringan) 8 tahun (12.5%/thn); Golongan 3 (Mesin pabrik) 16 tahun (6.25%/thn); Bangunan permanen 20 tahun (5%/thn).
        </div>
      </div>
    </div>
  );
};
