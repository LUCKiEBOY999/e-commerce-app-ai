import React, { useState, useMemo } from 'react';
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  TrendingUp, 
  ArrowUpRight, 
  Info,
  Maximize2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Filter,
  Apple,
  Carrot,
  Citrus
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceDot
} from 'recharts';
import { CLUSTERS, SYSTEM_STATS, generateScatterData, ScatterPoint } from '../data/mockData';
import { TabType, Language } from '../types';
import { t } from '../locales/translations';

interface DashboardViewProps {
  onSelectCluster: (clusterId: number) => void;
  onNavigate: (tab: TabType) => void;
  language?: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onSelectCluster, 
  onNavigate,
  language = 'th'
}) => {
  const [scatterPoints, setScatterPoints] = useState<ScatterPoint[]>(() => generateScatterData());
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<number | null>(null);
  const [metricMode, setMetricMode] = useState<'price-qty' | 'price-discount' | 'qty-sales'>('price-qty');

  const strings = t[language];

  const filteredPoints = useMemo(() => {
    if (selectedClusterFilter === null) return scatterPoints;
    return scatterPoints.filter(p => p.cluster === selectedClusterFilter);
  }, [scatterPoints, selectedClusterFilter]);

  // Centroids for each cluster based on real cluster averages
  const centroids = useMemo(() => {
    return CLUSTERS.map(c => ({
      cluster: c.id,
      name: language === 'th' ? `จุดกึ่งกลางกลุ่ม ${c.id}` : `Centroid ${c.id}`,
      price: c.avgPrice,
      quantitySold: c.avgQuantitySold,
      discount: c.avgDiscount,
      salesValue: c.avgSalesValue,
      color: c.color,
    }));
  }, [language]);

  const handleRegeneratePoints = () => {
    setScatterPoints(generateScatterData());
  };

  const getAxisLabels = () => {
    switch (metricMode) {
      case 'price-discount':
        return { 
          x: language === 'th' ? 'ราคา (USD)' : 'Price (USD)', 
          y: language === 'th' ? 'ส่วนลด (%)' : 'Discount (%)', 
          xKey: 'price', 
          yKey: 'discount', 
          xDomain: [0, 50], 
          yDomain: [0, 45] 
        };
      case 'qty-sales':
        return { 
          x: language === 'th' ? 'ยอดขาย (จำนวนชิ้น)' : 'Quantity Sold (Units)', 
          y: language === 'th' ? 'มูลค่ายอดขาย ($)' : 'Sales Value ($)', 
          xKey: 'quantitySold', 
          yKey: 'salesValue', 
          xDomain: [0, 3200], 
          yDomain: [0, 40000] 
        };
      case 'price-qty':
      default:
        return { 
          x: language === 'th' ? 'ราคา (USD)' : 'Price (USD)', 
          y: language === 'th' ? 'ยอดขาย (จำนวนชิ้น)' : 'Quantity Sold (Units)', 
          xKey: 'price', 
          yKey: 'quantitySold', 
          xDomain: [0, 50], 
          yDomain: [0, 3000] 
        };
    }
  };

  const axisConfig = getAxisLabels();

  return (
    <div className="space-y-8 pb-16 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Decorative Fresh Produce Theme Banner */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#FFEDAD]/60 via-[#FFFDF8]/90 to-[#C8D9EC]/50 border border-[#8E1825]/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8E1825] text-[#FFEDAD] flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            🍒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#3D2722]">
                {language === 'th' ? 'สินค้ากลุ่มผัก ผลไม้ และของสด (Fresh Produce & Retail Analytics)' : 'Fresh Produce & Organic Groceries Analytics'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8E1825] text-white">
                THEME
              </span>
            </div>
            <p className="text-xs text-[#3D2722]/80">
              {language === 'th' ? 'ผสานสี Cherry Red, Columbia Blue, Butter Yellow & Dark Chocolate พร้อมภาพพื้นหลังผักผลไม้สด' : 'Cherry Red, Columbia Blue, Butter Yellow & Dark Chocolate palette with organic produce background'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#3D2722] bg-white/80 px-3 py-1.5 rounded-xl border border-[#3D2722]/10 shrink-0">
          <span>🥕 ผักสด</span>
          <span>•</span>
          <span>🍋 เลมอน</span>
          <span>•</span>
          <span>🥑 อะโวคาโด</span>
          <span>•</span>
          <span>🍎 แอปเปิล</span>
        </div>
      </div>

      {/* Title & Subtitle Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#3D2722]/10 pb-6 bg-white/80 p-6 rounded-2xl backdrop-blur-xs border border-[#3D2722]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8E1825] text-white shadow-2xs">
              {strings.modelStatusBadge}
            </span>
            <span className="text-xs text-[#3D2722]/40">•</span>
            <span className="text-xs text-[#3D2722]/70 font-medium">{strings.catalogScope}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3D2722]">
            {strings.dashTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#3D2722]/80 mt-1">
            {strings.dashSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => onNavigate('segmentation')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8E1825] hover:bg-[#6E121C] text-white text-sm font-semibold transition shadow-sm"
          >
            <Layers className="w-4 h-4 text-[#FFEDAD]" />
            <span>{strings.btnRerun}</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C8D9EC] hover:bg-[#C8D9EC]/20 text-[#3D2722] text-sm font-semibold transition shadow-2xs"
          >
            <Package className="w-4 h-4 text-[#8E1825]" />
            <span>{strings.btnExploreProducts}</span>
          </button>
        </div>
      </div>

      {/* Merchant Quick Navigation Shortcuts */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-[#8E1825]/20 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-[#3D2722]">
              {language === 'th' ? '⚡ ทางลัดโมดูลศูนย์ควบคุมร้านค้า (Merchant Operations)' : '⚡ Merchant Operations Shortcuts'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEDAD] text-[#7A5806] border border-[#E8CE6D]">
              SELLER HUB
            </span>
          </div>
          <span className="text-xs text-[#3D2722]/60 hidden sm:inline">
            {language === 'th' ? 'เข้าถึงเครื่องมือวิเคราะห์และจัดการสต็อกร้านค้า' : 'Direct access to store analytics and stock controls'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Shortcut 1: Segmentation */}
          <div 
            onClick={() => onNavigate('segmentation')}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#FFFDF8] hover:bg-white border border-[#3D2722]/10 hover:border-[#8E1825]/40 hover:shadow-xs transition space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FFEDAD] text-[#7A5806] flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                🏷️
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#3D2722]/40 group-hover:text-[#8E1825] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#3D2722] group-hover:text-[#8E1825] transition-colors">
                {language === 'th' ? 'การจัดกลุ่มสินค้า K-Means' : 'K-Means Segmentation'}
              </h4>
              <p className="text-[11px] text-[#3D2722]/70 mt-0.5">
                {language === 'th' ? '4 คลัสเตอร์และจุด Centroids' : '4 clusters & centroids'}
              </p>
            </div>
          </div>

          {/* Shortcut 2: Products Catalog */}
          <div 
            onClick={() => onNavigate('products')}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#FFFDF8] hover:bg-white border border-[#3D2722]/10 hover:border-[#8E1825]/40 hover:shadow-xs transition space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#C8D9EC] text-[#2C4A6F] flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                📦
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#3D2722]/40 group-hover:text-[#8E1825] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#3D2722] group-hover:text-[#8E1825] transition-colors">
                {language === 'th' ? 'แคตตาล็อกสินค้า 82,103 SKUs' : '82,103 SKUs Catalog'}
              </h4>
              <p className="text-[11px] text-[#3D2722]/70 mt-0.5">
                {language === 'th' ? 'ค้นหา กรอง และจัดเรียง' : 'Search, filter & sort'}
              </p>
            </div>
          </div>

          {/* Shortcut 3: Data Pipeline */}
          <div 
            onClick={() => onNavigate('pipeline')}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#FFFDF8] hover:bg-white border border-[#3D2722]/10 hover:border-[#8E1825]/40 hover:shadow-xs transition space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#8E1825]/10 text-[#8E1825] flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                ⚙️
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#3D2722]/40 group-hover:text-[#8E1825] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#3D2722] group-hover:text-[#8E1825] transition-colors">
                {language === 'th' ? 'ขั้นตอนการประมวลผล AI' : 'AI Data Pipeline'}
              </h4>
              <p className="text-[11px] text-[#3D2722]/70 mt-0.5">
                {language === 'th' ? 'ไปป์ไลน์ 6 ขั้นตอน & Python' : '6 stages & Python code'}
              </p>
            </div>
          </div>

          {/* Shortcut 4: Inventory & Simulator */}
          <div 
            onClick={() => onNavigate('inventory')}
            className="group cursor-pointer p-3.5 rounded-xl bg-[#FFFDF8] hover:bg-white border border-[#3D2722]/10 hover:border-[#8E1825]/40 hover:shadow-xs transition space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                🧪
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#3D2722]/40 group-hover:text-[#8E1825] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#3D2722] group-hover:text-[#8E1825] transition-colors">
                {language === 'th' ? 'จำลองราคา & สต็อก' : 'Pricing & Inventory'}
              </h4>
              <p className="text-[11px] text-[#3D2722]/70 mt-0.5">
                {language === 'th' ? 'What-If Simulator คลัสเตอร์' : 'What-If cluster prediction'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Products */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#3D2722]/10 shadow-xs hover:shadow-md transition-shadow hover:border-[#8E1825]/40">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D2722]/80">
              {strings.kpi.totalProducts}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#8E1825]/10 text-[#8E1825] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#3D2722] tracking-tight">
              {SYSTEM_STATS.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-[#3D2722]/70">
              <span>{strings.kpi.totalProductsSub}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Average Product Price */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#3D2722]/10 shadow-xs hover:shadow-md transition-shadow hover:border-[#B8860B]/40">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D2722]/80">
              {strings.kpi.avgPrice}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFEDAD] text-[#7A5806] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#3D2722] tracking-tight">
              ${SYSTEM_STATS.avgPrice.toFixed(2)}
            </div>
            <p className="text-xs text-[#3D2722]/70">
              {strings.kpi.avgPriceSub}
            </p>
          </div>
        </div>

        {/* Card 3: Average Quantity Sold */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#3D2722]/10 shadow-xs hover:shadow-md transition-shadow hover:border-[#416788]/40">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D2722]/80">
              {strings.kpi.avgQuantity}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#C8D9EC] text-[#2C4A6F] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#3D2722] tracking-tight">
              {SYSTEM_STATS.avgQuantitySold.toLocaleString()}
            </div>
            <p className="text-xs text-[#3D2722]/70">
              {strings.kpi.avgQuantitySub}
            </p>
          </div>
        </div>

        {/* Card 4: Number of Clusters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#3D2722]/10 shadow-xs hover:shadow-md transition-shadow hover:border-[#3D2722]/40">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D2722]/80">
              {strings.kpi.clustersCount}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#3D2722]/10 text-[#3D2722] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#3D2722] tracking-tight flex items-baseline gap-2">
              <span>{SYSTEM_STATS.clusterCount}</span>
              <span className="text-xs font-bold text-[#8E1825] bg-[#8E1825]/10 px-2 py-0.5 rounded border border-[#8E1825]/20">
                k=4 Optimal
              </span>
            </div>
            <p className="text-xs text-[#3D2722]/70">
              {strings.kpi.clustersCountSub}
            </p>
          </div>
        </div>
      </div>

      {/* Large Visualization Section: Product Cluster Visualization */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#3D2722]/10 shadow-xs overflow-hidden">
        {/* Visualization Header & Controls */}
        <div className="p-6 border-b border-[#3D2722]/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-white via-white to-[#FFEDAD]/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#3D2722]">
                {strings.vizTitle}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#C8D9EC] text-[#2C4A6F]">
                {filteredPoints.length} {language === 'th' ? 'จุดแสดงผล' : 'sample points'}
              </span>
            </div>
            <p className="text-xs text-[#3D2722]/70 mt-1">
              {strings.vizSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Mode Switcher */}
            <div className="flex items-center bg-[#C8D9EC]/30 p-1 rounded-xl border border-[#C8D9EC] text-xs font-medium">
              <button
                onClick={() => setMetricMode('price-qty')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  metricMode === 'price-qty'
                    ? 'bg-[#8E1825] text-white shadow-2xs font-semibold'
                    : 'text-[#3D2722] hover:text-[#8E1825]'
                }`}
              >
                {strings.modes.priceQty}
              </button>
              <button
                onClick={() => setMetricMode('price-discount')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  metricMode === 'price-discount'
                    ? 'bg-[#8E1825] text-white shadow-2xs font-semibold'
                    : 'text-[#3D2722] hover:text-[#8E1825]'
                }`}
              >
                {strings.modes.priceDiscount}
              </button>
              <button
                onClick={() => setMetricMode('qty-sales')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  metricMode === 'qty-sales'
                    ? 'bg-[#8E1825] text-white shadow-2xs font-semibold'
                    : 'text-[#3D2722] hover:text-[#8E1825]'
                }`}
              >
                {strings.modes.qtySales}
              </button>
            </div>

            {/* Filter by Cluster Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                aria-label={strings.filterCluster}
                value={selectedClusterFilter === null ? 'all' : selectedClusterFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedClusterFilter(val === 'all' ? null : Number(val));
                }}
                className="text-xs bg-white border border-[#C8D9EC] rounded-xl px-3 py-1.5 font-medium text-[#3D2722] focus:outline-hidden focus:ring-2 focus:ring-[#8E1825]"
              >
                <option value="all">{strings.allClusters}</option>
                {CLUSTERS.map(c => (
                  <option key={c.id} value={c.id}>
                    {language === 'th' ? c.nameTh : c.name}
                  </option>
                ))}
              </select>

              {/* Resample Button */}
              <button
                onClick={handleRegeneratePoints}
                className="p-1.5 rounded-xl border border-[#C8D9EC] text-[#3D2722] hover:bg-[#C8D9EC]/30 transition"
                title={strings.resampleTooltip}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scatter Plot Chart Area */}
        <div className="p-6">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C8D9EC" opacity={0.6} />
                <XAxis 
                  type="number" 
                  dataKey={axisConfig.xKey} 
                  name={axisConfig.x} 
                  unit={axisConfig.xKey === 'price' ? '$' : ''}
                  domain={axisConfig.xDomain}
                  tick={{ fill: '#3D2722', fontSize: 11 }}
                  label={{ value: axisConfig.x, position: 'insideBottom', offset: -10, fill: '#3D2722', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  type="number" 
                  dataKey={axisConfig.yKey} 
                  name={axisConfig.y} 
                  unit={axisConfig.yKey === 'discount' ? '%' : (axisConfig.yKey === 'salesValue' ? '$' : '')}
                  domain={axisConfig.yDomain}
                  tick={{ fill: '#3D2722', fontSize: 11 }}
                  label={{ value: axisConfig.y, angle: -90, position: 'insideLeft', offset: 0, fill: '#3D2722', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ScatterPoint;
                      const cluster = CLUSTERS.find(c => c.id === data.cluster);
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-[#3D2722]/15 text-xs space-y-1.5 z-50">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cluster?.color || '#666' }} />
                            <span className="font-bold text-[#3D2722]">
                              {language === 'th' ? cluster?.nameTh : cluster?.name}
                            </span>
                          </div>
                          <div className="text-[#3D2722]/80 font-medium">
                            {language === 'th' ? (data.nameTh || data.name) : data.name}
                          </div>
                          <div className="border-t border-[#3D2722]/10 pt-1.5 space-y-0.5 text-[#3D2722]/80 font-mono">
                            <div>{language === 'th' ? 'ราคา' : 'Price'}: ${data.price.toFixed(2)}</div>
                            <div>{language === 'th' ? 'ยอดขาย' : 'Quantity'}: {data.quantitySold.toLocaleString()} {language === 'th' ? 'ชิ้น' : 'units'}</div>
                            <div>{language === 'th' ? 'ส่วนลด' : 'Discount'}: {data.discount}%</div>
                            <div>{language === 'th' ? 'มูลค่ายอดขาย' : 'Sales Value'}: ${data.salesValue.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* Scatter points with custom colors */}
                <Scatter name="Products" data={filteredPoints} fill="#8884d8">
                  {filteredPoints.map((entry, index) => {
                    const cluster = CLUSTERS.find(c => c.id === entry.cluster);
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={cluster ? cluster.color : '#8E1825'}
                        fillOpacity={0.75}
                        stroke={cluster ? cluster.color : '#8E1825'}
                        strokeWidth={1}
                      />
                    );
                  })}
                </Scatter>

                {/* Centroids highlighted with large markers */}
                {centroids.map((cent) => {
                  const xVal = axisConfig.xKey === 'price' ? cent.price : cent.quantitySold;
                  const yVal = axisConfig.yKey === 'quantitySold' ? cent.quantitySold : (axisConfig.yKey === 'discount' ? cent.discount : cent.salesValue);
                  return (
                    <ReferenceDot
                      key={`centroid-${cent.cluster}`}
                      x={xVal}
                      y={yVal}
                      r={9}
                      fill={cent.color}
                      stroke="#ffffff"
                      strokeWidth={3}
                      className="cursor-pointer"
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Centroid Indicator info */}
          <div className="mt-4 pt-4 border-t border-[#3D2722]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#3D2722]/70">
            <div className="flex flex-wrap items-center gap-4">
              {CLUSTERS.map(c => (
                <div 
                  key={c.id} 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                  onClick={() => onSelectCluster(c.id)}
                >
                  <span className="w-3 h-3 rounded-full shadow-2xs" style={{ backgroundColor: c.color }} />
                  <span className="font-bold text-[#3D2722]">
                    {language === 'th' ? c.nameTh : c.name}
                  </span>
                  <span className="text-[#3D2722]/60 font-mono">({c.percentage}%)</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[#3D2722] bg-[#FFEDAD]/40 px-3 py-1.5 rounded-lg border border-[#FFEDAD]">
              <span className="w-3 h-3 rounded-full bg-[#8E1825] border-2 border-white ring-1 ring-[#8E1825] flex items-center justify-center text-[8px] text-white"></span>
              <span className="font-semibold">
                {language === 'th' ? 'จุดวงกลมใหญ่ = พิกัดจุดกึ่งกลาง (Centroid Center ⌖)' : 'Large Dots = Cluster Centroids (Mean Coordinates ⌖)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Summary Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#3D2722]/10 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#3D2722]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gradient-to-r from-white via-white to-[#C8D9EC]/20">
          <div>
            <h2 className="text-lg font-bold text-[#3D2722]">
              {strings.tableTitle}
            </h2>
            <p className="text-xs text-[#3D2722]/70 mt-0.5">
              {strings.tableSubtitle}
            </p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="self-start sm:self-auto text-xs font-bold text-[#8E1825] hover:text-[#6E121C] flex items-center gap-1 transition"
          >
            <span>{strings.deepDiveBtn}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FFFDF8] text-[#3D2722] font-bold border-b border-[#3D2722]/10 text-xs">
                <th className="py-3.5 px-4 sm:px-6">{strings.cols.cluster}</th>
                <th className="py-3.5 px-4">{strings.cols.productCount}</th>
                <th className="py-3.5 px-4">{strings.cols.avgPrice}</th>
                <th className="py-3.5 px-4">{strings.cols.avgDiscount}</th>
                <th className="py-3.5 px-4">{strings.cols.avgQuantity}</th>
                <th className="py-3.5 px-4">{strings.cols.avgSalesValue}</th>
                <th className="py-3.5 px-4 sm:px-6">{strings.cols.description}</th>
                <th className="py-3.5 px-4 text-right">{strings.cols.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3D2722]/5 text-[#3D2722]">
              {CLUSTERS.map((cluster) => (
                <tr 
                  key={cluster.id}
                  onClick={() => onSelectCluster(cluster.id)}
                  className="hover:bg-[#FFEDAD]/20 cursor-pointer transition"
                >
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: cluster.color }} />
                      <span className="font-bold text-[#3D2722] whitespace-nowrap">
                        {language === 'th' ? `กลุ่มที่ ${cluster.id}` : `Cluster ${cluster.id}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-medium">
                    {cluster.productCount.toLocaleString()}
                    <span className="text-[#3D2722]/60 text-xs ml-1">({cluster.percentage}%)</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-[#3D2722]">
                    ${cluster.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#FFEDAD] text-[#634600] font-bold border border-[#E8CE6D]">
                      {cluster.avgDiscount}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    {cluster.avgQuantitySold.toLocaleString()} {language === 'th' ? 'ชิ้น' : ''}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-[#8E1825]">
                    ${cluster.avgSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-[#3D2722]/80 max-w-xs font-normal">
                    {language === 'th' ? cluster.descriptionTh : cluster.description}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCluster(cluster.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C8D9EC]/40 hover:bg-[#C8D9EC] text-[#2C4A6F] text-xs font-bold transition"
                    >
                      <span>{strings.actionInsight}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#FFFDF8] border-t border-[#3D2722]/10 text-xs text-[#3D2722]/70 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8E1825] shrink-0" />
          <span>{strings.footerSummaryNote}</span>
        </div>
      </div>
    </div>
  );
};
