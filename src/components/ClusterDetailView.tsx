import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  Package, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  Target
} from 'lucide-react';
import { CLUSTERS, DISTRIBUTION_DATA, SAMPLE_PRODUCTS } from '../data/mockData';
import { Language } from '../types';
import { t } from '../locales/translations';

interface ClusterDetailViewProps {
  selectedClusterId: number;
  onSelectClusterId: (id: number) => void;
  onNavigateToProducts: (clusterId: number) => void;
  language?: Language;
}

export const ClusterDetailView: React.FC<ClusterDetailViewProps> = ({ 
  selectedClusterId, 
  onSelectClusterId,
  onNavigateToProducts,
  language = 'th'
}) => {
  const strings = t[language];
  const currentCluster = CLUSTERS.find(c => c.id === selectedClusterId) || CLUSTERS[0];
  const clusterKey = `C${currentCluster.id}` as 'C1' | 'C2' | 'C3' | 'C4';

  // Specific distribution datasets mapped for the active cluster
  const priceDist = DISTRIBUTION_DATA.priceBins.map(bin => ({
    range: bin.range,
    count: bin[clusterKey],
  }));

  const quantityDist = DISTRIBUTION_DATA.quantityBins.map(bin => ({
    range: bin.range,
    count: bin[clusterKey],
  }));

  const discountDist = DISTRIBUTION_DATA.discountBins.map(bin => ({
    range: bin.range,
    count: bin[clusterKey],
  }));

  const categoryDist = DISTRIBUTION_DATA.categoryBreakdown.map(cat => ({
    name: language === 'th' ? cat.nameTh : cat.name,
    value: cat[clusterKey],
  }));

  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  const sampleClusterProducts = SAMPLE_PRODUCTS.filter(p => p.cluster === currentCluster.id);

  return (
    <div className="space-y-8 pb-16 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Title & Cluster Switcher Tabs */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {strings.detailHeaderBadge}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                {language === 'th' ? `กลุ่มที่ ${currentCluster.id} จากทั้งหมด 4 กลุ่ม` : `Cluster ${currentCluster.id} of 4`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: currentCluster.color }} />
              <span>{language === 'th' ? currentCluster.nameTh : currentCluster.name}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'th' ? currentCluster.descriptionTh : currentCluster.description}
            </p>
          </div>

          <button
            onClick={() => onNavigateToProducts(currentCluster.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs self-start md:self-auto"
          >
            <span>{strings.viewAllSkusBtn.replace('{count}', currentCluster.productCount.toLocaleString())}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cluster Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
          {CLUSTERS.map(c => {
            const isSelected = c.id === currentCluster.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectClusterId(c.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{language === 'th' ? c.shortNameTh : c.shortName}</span>
                <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  ({c.percentage}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Crucial Requirement Notice: Interpretability Banner */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{strings.mlNoticeTitle}</span>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          {strings.mlNoticeBody}
        </p>
      </div>

      {/* Cluster Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products in Cluster */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{strings.stats.count}</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {currentCluster.productCount.toLocaleString()}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-700">{currentCluster.percentage}%</strong> {strings.stats.percentCatalog}
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{strings.stats.avgPrice}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              ${currentCluster.avgPrice.toFixed(2)}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {strings.stats.globalAvg}
            </div>
          </div>
        </div>

        {/* Average Discount */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{strings.stats.avgDiscount}</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-700">
              {currentCluster.avgDiscount}%
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {language === 'th' ? 'ส่วนลดเฉลี่ยจากราคาปกติ' : 'Promotional markdown'}
            </div>
          </div>
        </div>

        {/* Average Quantity Sold */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{strings.stats.avgQty}</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {currentCluster.avgQuantitySold.toLocaleString()} {language === 'th' ? 'ชิ้น' : ''}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {language === 'th' ? 'ยอดขายเฉลี่ยต่อ SKU' : 'Units per product SKU'}
            </div>
          </div>
        </div>

        {/* Average Sales Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{strings.stats.avgSalesVal}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-700">
              ${currentCluster.avgSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {language === 'th' ? 'ยอดขายรวมโดยเฉลี่ย' : 'Gross revenue generated'}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Charts Grid: Price, Quantity Sold, Discount, Category Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Price Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-sm">{strings.distCharts.priceTitle}</h3>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">{strings.distCharts.priceSub}</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <ChartTooltip formatter={(val: any) => [val != null ? Number(val).toLocaleString() : '', language === 'th' ? 'จำนวนสินค้า' : 'Products']} />
                <Bar dataKey="count" fill={currentCluster.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Quantity Sold Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-sm">{strings.distCharts.qtyTitle}</h3>
            <span className="text-xs text-slate-400">{language === 'th' ? 'หน่วยชิ้น' : 'Units'}</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">{strings.distCharts.qtySub}</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quantityDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <ChartTooltip formatter={(val: any) => [val != null ? Number(val).toLocaleString() : '', language === 'th' ? 'จำนวนสินค้า' : 'Products']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Discount Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-sm">{strings.distCharts.discountTitle}</h3>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">{strings.distCharts.discountSub}</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discountDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <ChartTooltip formatter={(val: any) => [val != null ? Number(val).toLocaleString() : '', language === 'th' ? 'จำนวนสินค้า' : 'Products']} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Business Recommendations & Actionable Insights Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-7 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {strings.insightTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {strings.insightSubtitle}
            </p>
          </div>
        </div>

        {/* Executive Business Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-bold block mb-1">
            {language === 'th' ? 'การสังเคราะห์และประเมินภาพรวมทางธุรกิจ:' : 'Executive Synthesis:'}
          </strong>
          {language === 'th' ? currentCluster.businessInsightTh : currentCluster.businessInsight}
        </div>

        {/* 3 Department Strategy Pillars: Marketing, Inventory, Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Strategy 1: Marketing */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4 text-blue-600" />
              <span>{strings.stratMarketing}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 leading-snug">
              {(language === 'th' ? currentCluster.marketingStrategyTh : currentCluster.marketingStrategy).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategy 2: Inventory */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>{strings.stratInventory}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 leading-snug">
              {(language === 'th' ? currentCluster.inventoryStrategyTh : currentCluster.inventoryStrategy).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategy 3: Pricing */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>{strings.stratPricing}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 leading-snug">
              {(language === 'th' ? currentCluster.pricingStrategyTh : currentCluster.pricingStrategy).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Representative SKUs in this cluster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {strings.exemplarTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {strings.exemplarSub}
            </p>
          </div>
          <button 
            onClick={() => onNavigateToProducts(currentCluster.id)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            {language === 'th' ? 'ดูสินค้าทั้งหมด →' : 'View all items →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sampleClusterProducts.slice(0, 4).map(p => (
            <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400">{p.sku}</div>
              <div className="font-bold text-xs text-slate-900 line-clamp-1">
                {language === 'th' ? p.nameTh : p.name}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <span className="font-semibold">${p.price.toFixed(2)}</span>
                <span className="text-emerald-700 font-semibold">{p.quantitySold.toLocaleString()} {language === 'th' ? 'ชิ้น' : 'units'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
