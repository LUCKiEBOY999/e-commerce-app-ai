export type Language = 'th' | 'en';

export interface Product {
  id: string;
  name: string;
  nameTh: string;
  category: string;
  categoryTh: string;
  price: number;
  discount: number; // percentage, e.g. 25
  quantitySold: number;
  salesValue: number;
  cluster: number; // 1, 2, 3, 4
  rankScore: number; // 1 - 100
  sku: string;
  rating: number;
}

export interface ClusterInfo {
  id: number;
  name: string;
  nameTh: string;
  shortName: string;
  shortNameTh: string;
  productCount: number;
  percentage: number;
  avgPrice: number;
  avgDiscount: number;
  avgQuantitySold: number;
  avgSalesValue: number;
  description: string;
  descriptionTh: string;
  businessInsight: string;
  businessInsightTh: string;
  marketingStrategy: string[];
  marketingStrategyTh: string[];
  inventoryStrategy: string[];
  inventoryStrategyTh: string[];
  pricingStrategy: string[];
  pricingStrategyTh: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeClass: string;
}

export interface ElbowPoint {
  k: number;
  inertia: number; // WCSS
  silhouetteScore: number;
}

export interface PipelineStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'pending' | 'processing' | 'completed';
  details: string;
  inputShape: string;
  outputShape: string;
  methodApplied: string;
}

export type TabType = 'login' | 'seller' | 'dashboard' | 'segmentation' | 'products' | 'analytics' | 'pipeline' | 'inventory';
export type UserRole = 'seller';
