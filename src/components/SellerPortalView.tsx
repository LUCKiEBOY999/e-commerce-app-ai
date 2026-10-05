import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, 
  Package, 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  BarChart2, 
  Layers, 
  Edit3, 
  RefreshCw,
  Percent,
  Boxes,
  HelpCircle,
  Eye,
  Check,
  LayoutDashboard,
  BarChart3,
  FlaskConical,
  GitFork
} from 'lucide-react';
import { CLUSTERS, SAMPLE_PRODUCTS } from '../data/mockData';
import { Product, Language, TabType } from '../types';
import { DashboardView } from './DashboardView';
import { SegmentationView } from './SegmentationView';
import { ClusterDetailView } from './ClusterDetailView';
import { DataProcessingView } from './DataProcessingView';
import { ProductListView } from './ProductListView';

interface SellerPortalViewProps {
  onSelectCluster?: (clusterId: number) => void;
  language?: Language;
  initialSubTab?: 'dashboard' | 'segmentation' | 'products' | 'analytics' | 'pipeline' | 'inventory';
  selectedClusterId?: number;
  onSelectClusterId?: (id: number) => void;
  userName?: string;
  storeId?: string;
  storeName?: string;
}

interface StoreProductItem {
  id: string;
  sku: string;
  name: string;
  nameTh: string;
  categoryTh: string;
  price: number;
  discount: number;
  stock: number;
  quantitySold: number;
  cluster: number;
  status: 'in-stock' | 'low-stock' | 'reorder-needed';
}

export const SellerPortalView: React.FC<SellerPortalViewProps> = ({ 
  onSelectCluster,
  language = 'th',
  initialSubTab = 'dashboard',
  selectedClusterId = 1,
  onSelectClusterId,
  userName = 'คุณกานต์พล',
  storeId = 'STORE-88219',
  storeName = 'ร้านสวนทองสุข ออร์แกนิกฟาร์ม'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'segmentation' | 'products' | 'analytics' | 'pipeline' | 'inventory'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Store products state
  const [storeProducts, setStoreProducts] = useState<StoreProductItem[]>([
    {
      id: 'SP-01',
      sku: 'FRESH-STRW-27',
      name: 'Fresh Organic Strawberries (500g)',
      nameTh: 'สตรอว์เบอร์รีสดออร์แกนิก 500g',
      categoryTh: 'ผักและผลไม้สด',
      price: 6.90,
      discount: 15,
      stock: 45,
      quantitySold: 2350,
      cluster: 1,
      status: 'low-stock'
    },
    {
      id: 'SP-02',
      sku: 'FRESH-CHRY-28',
      name: 'Sweet Rainier Cherries Gift Box',
      nameTh: 'เชอร์รีเรเนียร์หวานสดเกรดพรีเมียม',
      categoryTh: 'ผักและผลไม้สด',
      price: 38.50,
      discount: 12,
      stock: 120,
      quantitySold: 640,
      cluster: 2,
      status: 'in-stock'
    },
    {
      id: 'SP-03',
      sku: 'FRESH-BLUB-30',
      name: 'Organic Blueberries Clearance Deal',
      nameTh: 'บลูเบอร์รีสดออร์แกนิก ล็อตระบายสต็อก',
      categoryTh: 'ผักและผลไม้สด',
      price: 6.20,
      discount: 35,
      stock: 18,
      quantitySold: 880,
      cluster: 3,
      status: 'low-stock'
    },
    {
      id: 'SP-04',
      sku: 'FRESH-AVOC-29',
      name: 'Hass Avocados Farm Box',
      nameTh: 'อะโวคาโดพันธุ์แฮสส์คัดเกรดพรีเมียม',
      categoryTh: 'ผักและผลไม้สด',
      price: 24.50,
      discount: 10,
      stock: 85,
      quantitySold: 580,
      cluster: 2,
      status: 'in-stock'
    },
    {
      id: 'SP-05',
      sku: 'FRESH-CRT-31',
      name: 'Crisp Baby Carrots Pack',
      nameTh: 'เบบี้แครอทสดกรอบหวาน ปลูกไร้สารเคมี',
      categoryTh: 'ผักและผลไม้สด',
      price: 3.50,
      discount: 20,
      stock: 12,
      quantitySold: 2800,
      cluster: 1,
      status: 'reorder-needed'
    },
    {
      id: 'SP-06',
      sku: 'FRESH-DRG-33',
      name: 'Exotic Red Pitaya Dragon Fruit',
      nameTh: 'แก้วมังกรเนื้อแดงคัดพิเศษ (Specialty)',
      categoryTh: 'ผักและผลไม้สด',
      price: 15.20,
      discount: 8,
      stock: 60,
      quantitySold: 145,
      cluster: 4,
      status: 'in-stock'
    },
  ]);

  // What-If Pricing Simulator States
  const [simPrice, setSimPrice] = useState<number>(8.50);
  const [simDiscount, setSimDiscount] = useState<number>(18);
  const [simEstimatedVolume, setSimEstimatedVolume] = useState<number>(1500);

  // Add New Product States
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('ผักและผลไม้สด');
  const [newProdPrice, setNewProdPrice] = useState(12.00);
  const [newProdDiscount, setNewProdDiscount] = useState(15);
  const [newProdStock, setNewProdStock] = useState(100);
  const [predictedCluster, setPredictedCluster] = useState<number | null>(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Store Summary Metrics
  const storeMetrics = useMemo(() => {
    const totalSkus = storeProducts.length;
    const totalUnitsSold = storeProducts.reduce((sum, p) => sum + p.quantitySold, 0);
    const totalRevenue = storeProducts.reduce((sum, p) => sum + (p.price * (1 - p.discount / 100) * p.quantitySold), 0);
    const lowStockCount = storeProducts.filter(p => p.status === 'low-stock' || p.status === 'reorder-needed').length;

    // Cluster distribution
    const clusterDist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };
    storeProducts.forEach(p => {
      clusterDist[p.cluster] = (clusterDist[p.cluster] || 0) + 1;
    });

    return { totalSkus, totalUnitsSold, totalRevenue, lowStockCount, clusterDist };
  }, [storeProducts]);

  // Real-time What-If Prediction based on Euclidean Distance to Centroids
  const simulationResult = useMemo(() => {
    // Normalization scales: price (max 50), discount (max 50), volume (max 3000)
    const normP = simPrice / 50;
    const normD = simDiscount / 50;
    const normV = simEstimatedVolume / 3000;

    const distances = CLUSTERS.map(c => {
      const centP = c.avgPrice / 50;
      const centD = c.avgDiscount / 50;
      const centV = c.avgQuantitySold / 3000;

      const dist = Math.sqrt(
        Math.pow(normP - centP, 2) * 1.5 +
        Math.pow(normD - centD, 2) * 1.0 +
        Math.pow(normV - centV, 2) * 1.8
      );

      return { cluster: c, distance: dist };
    });

    distances.sort((a, b) => a.distance - b.distance);
    const matched = distances[0].cluster;

    const projectedRevenue = (simPrice * (1 - simDiscount / 100)) * simEstimatedVolume;

    return {
      cluster: matched,
      confidence: Math.round((1 - distances[0].distance) * 100),
      projectedRevenue,
      distances
    };
  }, [simPrice, simDiscount, simEstimatedVolume]);

  // Predict cluster for the "Add New SKU" form
  const handlePredictNewSKU = () => {
    // Estimate volume based on price & discount
    let estVol = 1000;
    if (newProdPrice < 8) estVol = 2000;
    else if (newProdPrice > 25) estVol = 500;
    if (newProdDiscount > 25) estVol += 500;

    const normP = newProdPrice / 50;
    const normD = newProdDiscount / 50;
    const normV = estVol / 3000;

    const distances = CLUSTERS.map(c => {
      const centP = c.avgPrice / 50;
      const centD = c.avgDiscount / 50;
      const centV = c.avgQuantitySold / 3000;

      const dist = Math.sqrt(
        Math.pow(normP - centP, 2) * 1.5 +
        Math.pow(normD - centD, 2) * 1.0 +
        Math.pow(normV - centV, 2) * 1.8
      );
      return { clusterId: c.id, distance: dist };
    });

    distances.sort((a, b) => a.distance - b.distance);
    setPredictedCluster(distances[0].clusterId);
  };

  // Save new SKU to store
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const clusterId = predictedCluster || 1;
    const newSkuItem: StoreProductItem = {
      id: `SP-${Date.now().toString().slice(-4)}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProdName,
      nameTh: newProdName,
      categoryTh: newProdCategory,
      price: newProdPrice,
      discount: newProdDiscount,
      stock: newProdStock,
      quantitySold: 0,
      cluster: clusterId,
      status: newProdStock < 20 ? 'low-stock' : 'in-stock'
    };

    setStoreProducts(prev => [newSkuItem, ...prev]);
    setNewProdName('');
    setPredictedCluster(null);
    setShowAddSuccess(true);
    setTimeout(() => {
      setShowAddSuccess(false);
      setIsAddingOpen(false);
    }, 1500);
  };

  const getClusterBadge = (clusterId: number) => {
    const cluster = CLUSTERS.find(c => c.id === clusterId);
    if (!cluster) return null;
    return (
      <span 
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border"
        style={{ 
          backgroundColor: `${cluster.color}15`, 
          color: cluster.color,
          borderColor: `${cluster.color}40`
        }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }} />
        <span>{language === 'th' ? `กลุ่ม ${cluster.id}: ${cluster.shortNameTh}` : `Cluster ${cluster.id}: ${cluster.shortName}`}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-20 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Store Header Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-[#FFEDAD]/70 via-white/95 to-[#C8D9EC]/50 border border-[#8E1825]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#8E1825] text-[#FFEDAD] flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-lg sm:text-xl text-[#3D2722]">
                {language === 'th' ? 'ระบบจัดการและวิเคราะห์ข้อมูลสินค้า AI' : 'AI Product Analytics & Segmentation Hub'}
              </h1>
              {userName && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8E1825] text-white shadow-2xs">
                  👤 {userName}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#3D2722]/80 mt-0.5">
              {language === 'th' 
                ? `ยินดีต้อนรับ ${userName || 'ผู้ใช้งาน'} • แดชบอร์ดภาพรวม, การจัดกลุ่มสินค้า K-Means, รายการสินค้า 82,103 SKUs, การวิเคราะห์ และจำลองราคา`
                : `Welcome ${userName || 'User'} • Dashboard, K-Means Clustering, 82,103 SKU Catalog, Deep Analytics & Pricing Simulator.`}
            </p>
          </div>
        </div>

        {/* Quick Add SKU Button */}
        <button
          onClick={() => {
            setActiveSubTab('inventory');
            setIsAddingOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8E1825] hover:bg-[#6E121C] text-white font-bold text-sm shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#FFEDAD]" />
          <span>{language === 'th' ? '+ เพิ่มสินค้าใหม่' : '+ Add New SKU'}</span>
        </button>
      </div>

      {/* Seller Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/95 border border-[#3D2722]/10 shadow-xs">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'dashboard'
              ? 'bg-[#8E1825] text-white shadow-xs'
              : 'text-[#3D2722]/80 hover:text-[#8E1825] hover:bg-[#FFEDAD]/40'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeSubTab === 'dashboard' ? 'text-[#FFEDAD]' : 'text-[#8E1825]'}`} />
          <span>{language === 'th' ? '📊 แดชบอร์ดภาพรวม' : '📊 Dashboard Overview'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('segmentation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'segmentation'
              ? 'bg-[#8E1825] text-white shadow-xs'
              : 'text-[#3D2722]/80 hover:text-[#8E1825] hover:bg-[#FFEDAD]/40'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeSubTab === 'segmentation' ? 'text-[#FFEDAD]' : 'text-[#8E1825]'}`} />
          <span>{language === 'th' ? '🏷️ การจัดกลุ่มสินค้า (K-Means)' : '🏷️ Segmentation'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'products'
              ? 'bg-[#8E1825] text-white shadow-xs'
              : 'text-[#3D2722]/80 hover:text-[#8E1825] hover:bg-[#FFEDAD]/40'
          }`}
        >
          <Package className={`w-4 h-4 ${activeSubTab === 'products' ? 'text-[#FFEDAD]' : 'text-[#8E1825]'}`} />
          <span>{language === 'th' ? '📦 รายการสินค้า (82,103 SKUs)' : '📦 Products (82,103 SKUs)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-[#8E1825] text-white shadow-xs'
              : 'text-[#3D2722]/80 hover:text-[#8E1825] hover:bg-[#FFEDAD]/40'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${activeSubTab === 'analytics' ? 'text-[#FFEDAD]' : 'text-[#8E1825]'}`} />
          <span>{language === 'th' ? '📈 การวิเคราะห์เชิงลึก' : '📈 Deep Analytics'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'pipeline'
              ? 'bg-[#8E1825] text-white shadow-xs'
              : 'text-[#3D2722]/80 hover:text-[#8E1825] hover:bg-[#FFEDAD]/40'
          }`}
        >
          <GitFork className={`w-4 h-4 ${activeSubTab === 'pipeline' ? 'text-[#FFEDAD]' : 'text-[#8E1825]'}`} />
          <span>{language === 'th' ? '⚙️ ขั้นตอนการประมวลผล AI' : '⚙️ AI Data Pipeline'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeSubTab === 'inventory'
              ? 'bg-[#8E1825] text-white shadow-xs'
              : 'text-[#3D2722]/80 hover:text-[#8E1825] hover:bg-[#FFEDAD]/40'
          }`}
        >
          <FlaskConical className={`w-4 h-4 ${activeSubTab === 'inventory' ? 'text-[#FFEDAD]' : 'text-[#8E1825]'}`} />
          <span>{language === 'th' ? '🧪 จำลองราคา & จัดการสต็อก' : '🧪 Pricing & Inventory'}</span>
        </button>
      </div>

      {/* Sub-Tab 1: Dashboard View */}
      {activeSubTab === 'dashboard' && (
        <DashboardView 
          onSelectCluster={(cId) => {
            onSelectClusterId?.(cId);
            onSelectCluster?.(cId);
            setActiveSubTab('analytics');
          }}
          onNavigate={(tab) => {
            if (tab === 'segmentation') setActiveSubTab('segmentation');
            else if (tab === 'products') setActiveSubTab('products');
            else if (tab === 'analytics') setActiveSubTab('analytics');
            else if (tab === 'pipeline') setActiveSubTab('pipeline');
            else if (tab === 'inventory') setActiveSubTab('inventory');
          }}
          language={language}
        />
      )}

      {/* Sub-Tab 2: Segmentation View */}
      {activeSubTab === 'segmentation' && (
        <SegmentationView 
          onSelectCluster={(cId) => {
            onSelectClusterId?.(cId);
            onSelectCluster?.(cId);
            setActiveSubTab('analytics');
          }}
          language={language}
        />
      )}

      {/* Sub-Tab 3: Products Catalog View */}
      {activeSubTab === 'products' && (
        <ProductListView 
          onSelectCluster={(cId) => {
            onSelectClusterId?.(cId);
            onSelectCluster?.(cId);
            setActiveSubTab('analytics');
          }}
          language={language}
        />
      )}

      {/* Sub-Tab 4: Deep Analytics View */}
      {activeSubTab === 'analytics' && (
        <ClusterDetailView 
          selectedClusterId={selectedClusterId || 1}
          onSelectClusterId={(cId) => onSelectClusterId?.(cId)}
          onNavigateToProducts={() => setActiveSubTab('products')}
          language={language}
        />
      )}

      {/* Sub-Tab 5: Data Processing Pipeline */}
      {activeSubTab === 'pipeline' && (
        <DataProcessingView 
          language={language}
        />
      )}

      {/* Sub-Tab 4: Inventory & What-If Pricing Simulator */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-8">
      {/* Store Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Active Store SKUs */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-[#3D2722]/10 shadow-xs">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'สินค้าในร้าน' : 'Active Store SKUs'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#8E1825]/10 text-[#8E1825] flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#3D2722]">
            {storeMetrics.totalSkus} <span className="text-xs font-normal text-[#3D2722]/60">{language === 'th' ? 'รายการ' : 'SKUs'}</span>
          </div>
          <p className="text-xs text-[#3D2722]/70 mt-1">
            {language === 'th' ? 'กระจายตัวอยู่ใน 4 กลุ่มพฤติกรรม' : 'Distributed in 4 behavioral clusters'}
          </p>
        </div>

        {/* KPI 2: Total Store Revenue */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-[#3D2722]/10 shadow-xs">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'ยอดขายรวมสะสม' : 'Gross Revenue'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFEDAD] text-[#7A5806] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#3D2722]">
            ${storeMetrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-[#3D2722]/70 mt-1">
            {language === 'th' ? 'จากยอดจำหน่ายจริงสะสมในระบบ' : 'Cumulated verified sales'}
          </p>
        </div>

        {/* KPI 3: Units Sold */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-[#3D2722]/10 shadow-xs">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'จำนวนชิ้นที่ขายได้' : 'Total Units Sold'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#C8D9EC] text-[#2C4A6F] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#3D2722]">
            {storeMetrics.totalUnitsSold.toLocaleString()} <span className="text-xs font-normal text-[#3D2722]/60">{language === 'th' ? 'ชิ้น' : 'units'}</span>
          </div>
          <p className="text-xs text-[#3D2722]/70 mt-1">
            {language === 'th' ? 'สินค้ากลุ่ม 1 เป็นตัวขับเคลื่อนหลัก' : 'Driven primarily by Cluster 1 items'}
          </p>
        </div>

        {/* KPI 4: Inventory Health Alerts */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-[#3D2722]/10 shadow-xs">
          <div className="flex items-center justify-between text-[#3D2722]/70 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{language === 'th' ? 'แจ้งเตือนสต็อก' : 'Inventory Alerts'}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#8E1825] flex items-baseline gap-2">
            <span>{storeMetrics.lowStockCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {language === 'th' ? 'ต้องสั่งเติม/จัดการ' : 'Action needed'}
            </span>
          </div>
          <p className="text-xs text-[#3D2722]/70 mt-1">
            {language === 'th' ? 'ของใกล้หมด หรือต้องระบายสต็อก' : 'Low stock or clearance candidates'}
          </p>
        </div>
      </div>

      {/* Add New SKU Form Drawer / Accordion */}
      {isAddingOpen && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#8E1825]/30 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#3D2722]/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8E1825]" />
              <h3 className="font-bold text-base text-[#3D2722]">
                {language === 'th' ? 'เพิ่มสินค้าใหม่ & ประเมินกลุ่มคลัสเตอร์ด้วย AI' : 'Add New SKU & Predict AI Cluster'}
              </h3>
            </div>
            <span className="text-xs text-[#3D2722]/60">
              {language === 'th' ? 'AI จะคำนวณตำแหน่ง Centroid ให้แบบอัตโนมัติ' : 'AI calculates closest centroid'}
            </span>
          </div>

          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D2722] mb-1">
                {language === 'th' ? 'ชื่อสินค้า' : 'Product Name'} *
              </label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={e => setNewProdName(e.target.value)}
                placeholder={language === 'th' ? 'เช่น เมลอนญี่ปุ่นหวานฉ่ำ' : 'e.g., Sweet Japanese Melon'}
                className="w-full px-3 py-2 bg-white border border-[#C8D9EC] rounded-xl text-xs text-[#3D2722] focus:outline-hidden focus:ring-2 focus:ring-[#8E1825]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D2722] mb-1">
                {language === 'th' ? 'หมวดหมู่' : 'Category'}
              </label>
              <select
                value={newProdCategory}
                onChange={e => setNewProdCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#C8D9EC] rounded-xl text-xs text-[#3D2722] focus:outline-hidden focus:ring-2 focus:ring-[#8E1825]"
              >
                <option value="ผักและผลไม้สด">ผักและผลไม้สด (Fresh Produce)</option>
                <option value="ของใช้ในบ้านและครัว">ของใช้ในบ้านและครัว (Home & Kitchen)</option>
                <option value="ความงามและสุขภาพ">ความงามและสุขภาพ (Beauty & Health)</option>
                <option value="อิเล็กทรอนิกส์">อิเล็กทรอนิกส์ (Electronics)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D2722] mb-1">
                {language === 'th' ? 'ราคาขาย ($)' : 'Price ($)'} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="100"
                value={newProdPrice}
                onChange={e => setNewProdPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#C8D9EC] rounded-xl text-xs text-[#3D2722] focus:outline-hidden focus:ring-2 focus:ring-[#8E1825]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D2722] mb-1">
                {language === 'th' ? 'ส่วนลดที่ต้องการให้ (%)' : 'Discount (%)'}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={newProdDiscount}
                onChange={e => setNewProdDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#C8D9EC] rounded-xl text-xs text-[#3D2722] focus:outline-hidden focus:ring-2 focus:ring-[#8E1825]"
              />
            </div>

            {/* AI Prediction Result Box */}
            <div className="sm:col-span-2 lg:col-span-4 p-4 rounded-xl bg-[#FFFDF8] border border-[#FFEDAD] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePredictNewSKU}
                  className="px-4 py-2 rounded-xl bg-[#8E1825] hover:bg-[#6E121C] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFEDAD]" />
                  <span>{language === 'th' ? 'ทำนายกลุ่มคลัสเตอร์ด้วย AI' : 'Run AI Prediction'}</span>
                </button>
                {predictedCluster && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#3D2722]">
                      {language === 'th' ? 'ผลลัพธ์ที่คาดการณ์:' : 'Predicted Cluster:'}
                    </span>
                    {getClusterBadge(predictedCluster)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={showAddSuccess}
                  className="px-5 py-2 rounded-xl bg-[#3D2722] hover:bg-[#2A1B17] text-[#FFEDAD] text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
                >
                  {showAddSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <CheckCircle2 className="w-4 h-4 text-[#FFEDAD]" />}
                  <span>{showAddSuccess ? (language === 'th' ? 'บันทึกสำเร็จ!' : 'Saved!') : (language === 'th' ? 'บันทึกเข้าแคตตาล็อกร้าน' : 'Save to Catalog')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* What-If Pricing & Cluster Assignment Simulator (เครื่องมือจำลองราคา) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-[#3D2722]/10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3D2722]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8E1825]" />
              <h2 className="text-lg font-bold text-[#3D2722]">
                {language === 'th' ? 'เครื่องมือจำลองการตั้งราคา & ทำนายคลัสเตอร์ (What-If Pricing Simulator)' : 'What-If Pricing & Cluster Simulator'}
              </h2>
            </div>
            <p className="text-xs text-[#3D2722]/70 mt-1">
              {language === 'th' 
                ? 'ทดลองปรับราคาและส่วนลด เพื่อดูว่าโมเดล Machine Learning จะจัดสินค้าชิ้นนี้เข้าสู่กลุ่มใด และกระทบต่อยอดขายอย่างไร' 
                : 'Adjust price & discounts to simulate how the K-Means model classifies the product and projects revenue.'}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDAD] text-[#7A5806] border border-[#E8CE6D] self-start sm:self-auto">
            {language === 'th' ? 'อัลกอริทึม: Euclidean Distance ⌖' : 'Euclidean Distance Classifier'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Sliders Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Slider 1: Price */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-[#3D2722] mb-1.5">
                <span>{language === 'th' ? 'ราคาตั้งขาย (Unit Price):' : 'Selling Price ($):'}</span>
                <span className="font-mono text-base text-[#8E1825]">${simPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="2.00"
                max="48.00"
                step="0.50"
                value={simPrice}
                onChange={e => setSimPrice(Number(e.target.value))}
                className="w-full accent-[#8E1825] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3D2722]/50 font-mono mt-1">
                <span>$2.00 (ราคาประหยัด)</span>
                <span>$25.00</span>
                <span>$48.00 (เกรดพรีเมียม)</span>
              </div>
            </div>

            {/* Slider 2: Discount */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-[#3D2722] mb-1.5">
                <span>{language === 'th' ? 'ส่วนลดโปรโมชั่น (Promotion Discount %):' : 'Promotional Discount (%):'}</span>
                <span className="font-mono text-base text-amber-700">{simDiscount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={simDiscount}
                onChange={e => setSimDiscount(Number(e.target.value))}
                className="w-full accent-[#8E1825] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3D2722]/50 font-mono mt-1">
                <span>0% (ราคาเต็ม)</span>
                <span>20% (มาตรฐาน)</span>
                <span>45% (ลดล้างสต็อก)</span>
              </div>
            </div>

            {/* Slider 3: Estimated Volume */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-[#3D2722] mb-1.5">
                <span>{language === 'th' ? 'ยอดสั่งซื้อต่อเดือนคาดการณ์ (Monthly Units):' : 'Projected Monthly Velocity (Units):'}</span>
                <span className="font-mono text-base text-[#2C4A6F]">{simEstimatedVolume.toLocaleString()} {language === 'th' ? 'ชิ้น' : 'units'}</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={simEstimatedVolume}
                onChange={e => setSimEstimatedVolume(Number(e.target.value))}
                className="w-full accent-[#8E1825] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3D2722]/50 font-mono mt-1">
                <span>100 ชิ้น</span>
                <span>1,500 ชิ้น</span>
                <span>3,000 ชิ้น (ขายดีมาก)</span>
              </div>
            </div>
          </div>

          {/* Right: Predicted Cluster Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFFDF8] rounded-2xl p-5 border-2 border-[#8E1825]/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3D2722]/70">
                {language === 'th' ? 'ผลลัพธ์การจัดกลุ่มโดย AI' : 'AI Classification Result'}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {simulationResult.confidence}% {language === 'th' ? 'ความมั่นใจ' : 'Match'}
              </span>
            </div>

            {/* Cluster Tag */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: `${simulationResult.cluster.color}10`, borderColor: `${simulationResult.cluster.color}40` }}>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: simulationResult.cluster.color }} />
                <h3 className="font-extrabold text-base text-[#3D2722]">
                  {language === 'th' ? `กลุ่มที่ ${simulationResult.cluster.id}: ${simulationResult.cluster.nameTh}` : simulationResult.cluster.name}
                </h3>
              </div>
              <p className="text-xs text-[#3D2722]/80 mt-1">
                {language === 'th' ? simulationResult.cluster.descriptionTh : simulationResult.cluster.description}
              </p>
            </div>

            {/* Revenue Projection */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#3D2722]/10 text-xs">
              <span className="text-[#3D2722]/70 font-medium">
                {language === 'th' ? 'มูลค่ายอดขายคาดการณ์ต่อเดือน:' : 'Projected Monthly Sales:'}
              </span>
              <span className="font-mono font-extrabold text-base text-[#8E1825]">
                ${simulationResult.projectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* AI Action Prompt */}
            <div className="p-3 bg-[#FFEDAD]/40 rounded-xl border border-[#FFEDAD] text-xs text-[#7A5806] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#8E1825]" />
                <span>{language === 'th' ? 'คำแนะนำสำหรับผู้ขาย:' : 'Merchant Strategic Prompt:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {simulationResult.cluster.id === 1 && (language === 'th' ? 'รักษาระดับสต็อกให้สูงอย่างต่อเนื่อง เพราะเป็นสินค้าทำยอดขายเร็ว ควรจัดวางหน้าแรกเพื่อดึงลูกค้าเข้าร้าน' : 'Maintain high stock reserves as this acts as your prime traffic driver.')}
                {simulationResult.cluster.id === 2 && (language === 'th' ? 'มาร์จิ้นกำไรสูงมาก ควรเน้นเรื่องราวความสดใหม่ ใบรับรองออร์แกนิก เพื่อเพิ่มมูลค่าให้ผู้ซื้อประทับใจ' : 'High profit margin. Focus on storytelling, organic certifications, and luxury gift packaging.')}
                {simulationResult.cluster.id === 3 && (language === 'th' ? 'สินค้ามีความอ่อนไหวต่อส่วนลด เหมาะสำหรับทำ Flash Sale 1-2 วันเพื่อระบายสินค้าใกล้หมดอายุ' : 'Clearance candidate. Run 2-day flash sales to turn inventory into quick cashflow.')}
                {simulationResult.cluster.id === 4 && (language === 'th' ? 'สินค้ามียอดขายชะลอตัว ควรทดสอบปรับลดราคาหรือจัดแพ็กคู่กับสินค้ากลุ่ม 1' : 'Slow turnover. Bundle with Cluster 1 items to stimulate trial.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Inventory Management Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#3D2722]/10 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#3D2722]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white via-white to-[#FFEDAD]/20">
          <div>
            <h2 className="text-lg font-bold text-[#3D2722]">
              {language === 'th' ? 'จัดการรายการสินค้าและสต็อกของร้าน (Store SKU Inventory)' : 'Store Inventory & Action Prompts'}
            </h2>
            <p className="text-xs text-[#3D2722]/70 mt-0.5">
              {language === 'th' ? 'ติดตามกลุ่มคลัสเตอร์ของแต่ละ SKU และข้อเสนอแนะในการจัดการสินค้า' : 'Real-time clustering tags and suggested inventory actions per SKU.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#C8D9EC]/40 text-[#2C4A6F] border border-[#C8D9EC]">
              {storeProducts.length} {language === 'th' ? 'รายการสินค้า' : 'Active Products'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FFFDF8] text-[#3D2722] font-bold border-b border-[#3D2722]/10 text-xs">
                <th className="py-3.5 px-4 sm:px-6">{language === 'th' ? 'สินค้า / รหัส SKU' : 'Product / SKU'}</th>
                <th className="py-3.5 px-4">{language === 'th' ? 'ราคาตั้ง' : 'Price'}</th>
                <th className="py-3.5 px-4">{language === 'th' ? 'ส่วนลด' : 'Discount'}</th>
                <th className="py-3.5 px-4">{language === 'th' ? 'คงเหลือ' : 'Stock'}</th>
                <th className="py-3.5 px-4">{language === 'th' ? 'ยอดขายสะสม' : 'Units Sold'}</th>
                <th className="py-3.5 px-4">{language === 'th' ? 'กลุ่ม AI Cluster' : 'AI Cluster'}</th>
                <th className="py-3.5 px-4 sm:px-6">{language === 'th' ? 'ข้อแนะนำเชิงรุกสำหรับผู้ขาย' : 'Action Recommendation'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3D2722]/5 text-[#3D2722]">
              {storeProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-[#FFEDAD]/15 transition">
                  <td className="py-4 px-4 sm:px-6">
                    <div>
                      <span className="font-bold text-[#3D2722] block">
                        {language === 'th' ? prod.nameTh : prod.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#3D2722]/60">
                        {prod.sku} • {prod.categoryTh}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold">
                    ${prod.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#FFEDAD] text-[#7A5806] font-bold border border-[#E8CE6D] text-xs">
                      {prod.discount}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                      prod.status === 'reorder-needed'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : prod.status === 'low-stock'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {prod.stock} {language === 'th' ? 'ชิ้น' : 'units'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-semibold">
                    {prod.quantitySold.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    {getClusterBadge(prod.cluster)}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs text-[#3D2722]/80">
                    {prod.cluster === 1 && (
                      <span className="text-emerald-700 font-medium">
                        🔥 {language === 'th' ? 'ขายดีต่อเนื่อง รักษาระดับสต็อกสำรองไม่ให้ขาดช่วง' : 'High velocity. Keep safety stock high.'}
                      </span>
                    )}
                    {prod.cluster === 2 && (
                      <span className="text-[#2C4A6F] font-medium">
                        💎 {language === 'th' ? 'เน้นสร้างภาพลักษณ์พรีเมียมและรับรองความสดใหม่' : 'High profit. Highlight organic origin.'}
                      </span>
                    )}
                    {prod.cluster === 3 && (
                      <span className="text-[#8E1825] font-medium">
                        🏷️ {language === 'th' ? 'ปรับโปรโมชั่นเพิ่ม 5% เพื่อเร่งระบายสต็อกล็อตนี้' : 'Clearance candidate. Consider bundling.'}
                      </span>
                    )}
                    {prod.cluster === 4 && (
                      <span className="text-amber-700 font-medium">
                        📦 {language === 'th' ? 'ทดสอบจับคู่ขายพ่วง (Cross-selling) กับสินค้ากลุ่ม 1' : 'Bundle with staple products.'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
