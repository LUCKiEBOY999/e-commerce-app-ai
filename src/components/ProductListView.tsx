import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  Sparkles
} from 'lucide-react';
import { SAMPLE_PRODUCTS, CLUSTERS } from '../data/mockData';
import { Product, Language } from '../types';
import { t } from '../locales/translations';

interface ProductListViewProps {
  onSelectCluster: (clusterId: number) => void;
  language?: Language;
}

export const ProductListView: React.FC<ProductListViewProps> = ({ 
  onSelectCluster,
  language = 'th'
}) => {
  const strings = t[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCluster, setSelectedCluster] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 60 });
  const [sortField, setSortField] = useState<'quantitySold' | 'salesValue' | 'price' | 'discount'>('salesValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(SAMPLE_PRODUCTS.map(p => language === 'th' ? p.categoryTh : p.category));
    return ['All', ...Array.from(cats)];
  }, [language]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((product) => {
      // Search query
      const nameToSearch = language === 'th' ? `${product.nameTh} ${product.name}` : product.name;
      const matchesSearch = 
        nameToSearch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryTh.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory !== 'All') {
        const cat = language === 'th' ? product.categoryTh : product.category;
        if (cat !== selectedCategory) return false;
      }

      // Cluster filter
      if (selectedCluster !== 'All' && product.cluster !== Number(selectedCluster)) {
        return false;
      }

      // Price range
      if (product.price < priceRange.min || product.price > priceRange.max) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [searchQuery, selectedCategory, selectedCluster, priceRange, sortField, sortOrder, language]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleSort = (field: 'quantitySold' | 'salesValue' | 'price' | 'discount') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      language === 'th' ? 'รหัส SKU' : 'SKU',
      language === 'th' ? 'ชื่อสินค้า' : 'Product Name',
      language === 'th' ? 'หมวดหมู่' : 'Category',
      language === 'th' ? 'ราคา ($)' : 'Price ($)',
      language === 'th' ? 'ส่วนลด (%)' : 'Discount (%)',
      language === 'th' ? 'ยอดขาย (ชิ้น)' : 'Quantity Sold',
      language === 'th' ? 'มูลค่ายอดขาย ($)' : 'Sales Value ($)',
      language === 'th' ? 'กลุ่ม K-Means' : 'Cluster',
    ];
    const rows = filteredProducts.map(p => [
      p.sku,
      `"${language === 'th' ? p.nameTh : p.name}"`,
      `"${language === 'th' ? p.categoryTh : p.category}"`,
      p.price.toFixed(2),
      p.discount,
      p.quantitySold,
      p.salesValue.toFixed(2),
      `Cluster ${p.cluster}`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecommerce_products_cluster_export_${language}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredUnits = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + p.quantitySold, 0);
  }, [filteredProducts]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + p.salesValue, 0);
  }, [filteredProducts]);

  return (
    <div className="space-y-8 pb-16 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Title Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {language === 'th' ? 'การจัดกลุ่มและวิเคราะห์ระดับ SKU' : 'SKU Level Classification'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {filteredProducts.length} {language === 'th' ? 'รายการที่แสดง' : 'products found'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {strings.prodTitle}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {strings.prodSubtitle}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8E1825] hover:bg-[#6E121C] text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#FFEDAD]" />
          <span>{strings.exportCsvBtn}</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={strings.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-slate-700 font-medium"
            >
              <option value="All">{strings.allCategories}</option>
              {categories.filter(c => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Cluster Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCluster}
              onChange={(e) => {
                setSelectedCluster(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-slate-700 font-medium"
            >
              <option value="All">{strings.allClusters}</option>
              {CLUSTERS.map(c => (
                <option key={c.id} value={c.id.toString()}>
                  {language === 'th' ? `กลุ่มที่ ${c.id}` : `Cluster ${c.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-3 flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
              {strings.maxPriceSlider} <strong className="text-slate-900">${priceRange.max}</strong>
            </span>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={priceRange.max}
              onChange={(e) => {
                setPriceRange({ min: 0, max: Number(e.target.value) });
                setCurrentPage(1);
              }}
              className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Filter stats & Reset button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>{strings.showingItems.replace('{count}', filteredProducts.length.toString())}</span>
            <span>•</span>
            <span>{strings.totalUnits}: <strong className="text-slate-800">{totalFilteredUnits.toLocaleString()}</strong></span>
            <span>•</span>
            <span>{strings.totalSalesVal}: <strong className="text-emerald-700">${totalFilteredRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedCluster !== 'All' || priceRange.max !== 60) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedCluster('All');
                setPriceRange({ min: 0, max: 60 });
                setCurrentPage(1);
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{strings.resetFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs select-none">
                <th className="py-3.5 px-4 sm:px-6">{strings.tblColName}</th>
                <th className="py-3.5 px-4">{strings.tblColCategory}</th>
                <th 
                  onClick={() => handleSort('price')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>{strings.tblColPrice}</span>
                    {sortField === 'price' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('discount')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>{strings.tblColDiscount}</span>
                    {sortField === 'discount' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('quantitySold')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>{strings.tblColQty}</span>
                    {sortField === 'quantitySold' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('salesValue')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>{strings.tblColSalesVal}</span>
                    {sortField === 'salesValue' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 sm:px-6">{strings.tblColCluster}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {language === 'th' ? 'ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา' : 'No products found matching the criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const cluster = CLUSTERS.find(c => c.id === product.cluster);
                  return (
                    <tr 
                      key={product.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">
                          {language === 'th' ? product.nameTh : product.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {product.sku}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200">
                          {language === 'th' ? product.categoryTh : product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-amber-700 font-medium">
                          {product.discount}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {product.quantitySold.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                        ${product.salesValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <button
                          onClick={() => onSelectCluster(product.cluster)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition hover:opacity-80"
                          style={{
                            backgroundColor: `${cluster?.color}15`,
                            borderColor: `${cluster?.color}40`,
                            color: cluster?.color,
                          }}
                          title={language === 'th' ? 'คลิกเพื่อดูการวิเคราะห์กลุ่มนี้' : 'Click to view cluster analysis'}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster?.color }} />
                          <span>{language === 'th' ? `กลุ่มที่ ${product.cluster}` : `Cluster ${product.cluster}`}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            {language === 'th' 
              ? `หน้า ${currentPage} จากทั้งหมด ${totalPages} หน้า`
              : `Page ${currentPage} of ${totalPages}`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 px-1">{currentPage}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
