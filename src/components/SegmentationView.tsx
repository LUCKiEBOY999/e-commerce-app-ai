import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Settings2, 
  Sliders, 
  Sparkles, 
  Database,
  TrendingDown,
  Info,
  Layers,
  ArrowRight,
  Activity,
  Cpu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  ReferenceDot,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { 
  CLUSTERS, 
  ELBOW_DATA, 
  getClustersForK, 
  getMetricsForK 
} from '../data/mockData';
import { PipelineStep, Language } from '../types';
import { t } from '../locales/translations';

interface SegmentationViewProps {
  onSelectCluster: (clusterId: number) => void;
  language?: Language;
}

export const SegmentationView: React.FC<SegmentationViewProps> = ({ 
  onSelectCluster,
  language = 'th'
}) => {
  const strings = t[language];

  const [selectedDataset, setSelectedDataset] = useState('E-commerce Products Dataset (82,103 SKUs)');
  const [features, setFeatures] = useState<{ [key: string]: boolean }>({
    price: true,
    discountPercentage: true,
    quantitySold: true,
    salesValue: true,
    rankScore: true,
  });
  const [clusterCount, setClusterCount] = useState<number>(4);
  const [initMethod, setInitMethod] = useState<'k-means++' | 'random'>('k-means++');
  const [maxIterations, setMaxIterations] = useState<number>(300);

  // Dynamic clusters and metrics by chosen k
  const activeMetrics = getMetricsForK(clusterCount);
  const activeClusters = getClustersForK(clusterCount);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(true);
  const [progress, setProgress] = useState(100);
  const [activeStepIndex, setActiveStepIndex] = useState(4);

  const processingSteps: PipelineStep[] = [
    {
      id: 'step-1',
      title: language === 'th' ? 'การทำความสะอาดข้อมูล (Data Cleaning)' : 'Data Cleaning',
      subtitle: language === 'th' ? 'กำจัดข้อมูลซ้ำและตรวจชนิดตัวแปร' : 'Deduplication & Type Validation',
      status: activeStepIndex >= 0 ? 'completed' : 'pending',
      details: language === 'th' 
        ? 'ตรวจสอบ 82,105 แถวข้อมูล ตัดแถวที่ว่างทั้งแถว 2 แถว เหลือ 82,103 แถว และแปลงราคาที่มีคอมมาเป็นตัวเลข'
        : 'Evaluated 82,105 rows. Dropped 2 fully empty rows (82,103 remain) and converted comma-formatted prices to numbers.',
      inputShape: '82,105 × 11',
      outputShape: '82,103 × 11',
      methodApplied: 'Strip price commas, pd.to_numeric() & dropna(price_usd)',
    },
    {
      id: 'step-2',
      title: language === 'th' ? 'การจัดการค่าสูญหาย (Missing Value Handling)' : 'Missing Value Handling',
      subtitle: language === 'th' ? 'เติมค่าว่างด้วยค่ามัธยฐาน (Median)' : 'Imputation Strategy',
      status: activeStepIndex >= 1 ? 'completed' : 'pending',
      details: language === 'th'
        ? 'พบค่าว่างในส่วนลด 34 ค่า (0.06%) ทำการเติมค่าด้วยมัธยฐานของหมวดหมู่เพื่อป้องกันค่าผิดปกติกระทบระยะห่าง'
        : 'Identified 34 missing discount values (0.06%). Imputed using median strategy to prevent outlier distortion.',
      inputShape: '82,103 × 12',
      outputShape: '82,103 × 12',
      methodApplied: 'SimpleImputer(strategy="median")',
    },
    {
      id: 'step-3',
      title: language === 'th' ? 'การแปลงคุณลักษณะ (Feature Transformation)' : 'Feature Transformation',
      subtitle: language === 'th' ? 'ลดความเบ้ของข้อมูลด้วย Log Transform' : 'Log Scaling & Skew Correction',
      status: activeStepIndex >= 2 ? 'completed' : 'pending',
      details: language === 'th'
        ? 'แปลงข้อมูลยอดขายและมูลค่าด้วย log(1 + x) เพื่อปรับการแจกแจงที่มีความเบ้ขวา (Long-tail) ให้สมมาตรยิ่งขึ้น'
        : 'Applied logarithmic transform log(1 + x) on long-tail Sales Value and Quantity Sold distributions to normalize skewness.',
      inputShape: '82,103 × 5',
      outputShape: '82,103 × 5',
      methodApplied: 'np.log1p() on Sales Value & Quantity Sold',
    },
    {
      id: 'step-4',
      title: language === 'th' ? 'การปรับสเกลข้อมูล (Feature Scaling)' : 'Feature Scaling',
      subtitle: language === 'th' ? 'StandardScaler: z = (x - μ) / σ' : 'Standardization',
      status: activeStepIndex >= 3 ? 'completed' : 'pending',
      details: language === 'th'
        ? 'ปรับมาตรฐานข้อมูลให้มีค่าเฉลี่ยเป็น 0 และความแปรปรวนเป็น 1 เพื่อไม่ให้ตัวแปรหน่วยใหญ่ครอบงำระยะห่าง Euclidean'
        : 'Zero-mean and unit-variance scaling applied to normalize feature weights so high-magnitude values do not dominate Euclidean distance calculations.',
      inputShape: '82,103 × 5',
      outputShape: '82,103 × 5 (z-score)',
      methodApplied: 'StandardScaler(): z = (x - μ) / σ',
    },
    {
      id: 'step-5',
      title: language === 'th' ? 'การจัดกลุ่ม K-Means (K-Means Clustering)' : 'K-Means Clustering',
      subtitle: language === 'th' ? `การลู่เข้าของจุดกึ่งกลาง k = ${clusterCount} (${activeMetrics.iterations} รอบ)` : `Centroid Convergence k = ${clusterCount} (${activeMetrics.iterations} iter)`,
      status: activeStepIndex >= 4 ? 'completed' : 'pending',
      details: language === 'th'
        ? `ประมวลผล Lloyd Algorithm ด้วย ${initMethod} กำหนดจุดกึ่งกลาง ${clusterCount} จุด ลู่เข้าสู่ค่าที่เหมาะสมที่สุดในรอบที่ ${activeMetrics.iterations} ค่า WCSS อยู่ที่ ${activeMetrics.inertia.toLocaleString()}`
        : `Iterative Lloyd optimization with ${initMethod} seeding. Converged in ${activeMetrics.iterations} iterations with WCSS = ${activeMetrics.inertia.toLocaleString()}.`,
      inputShape: '82,103 × 5 (Standardized)',
      outputShape: `${clusterCount} ${language === 'th' ? 'กลุ่มสินค้า (Clusters)' : 'Discrete Product Clusters'}`,
      methodApplied: `KMeans(n_clusters=${clusterCount}, init="${initMethod}", max_iter=${maxIterations})`,
    },
  ];

  const handleToggleFeature = (key: string) => {
    setFeatures(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const selectedCount = Object.values(next).filter(Boolean).length;
      if (selectedCount === 0) return prev; // Keep at least one
      return next;
    });
  };

  const handleRunClustering = () => {
    setIsRunning(true);
    setHasRun(false);
    setProgress(0);
    setActiveStepIndex(0);

    // Multi-phase animation showing pipeline execution
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setHasRun(true);
          return 100;
        }
        const next = prev + 12;
        if (next >= 85) setActiveStepIndex(4);
        else if (next >= 65) setActiveStepIndex(3);
        else if (next >= 45) setActiveStepIndex(2);
        else if (next >= 20) setActiveStepIndex(1);
        else setActiveStepIndex(0);
        return next;
      });
    }, 180);
  };

  const activeFeaturesCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-16 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            {language === 'th' ? 'เครื่องมือจำลองโมเดล Machine Learning' : 'Machine Learning Model Sandbox'}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">Unsupervised K-Means Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {strings.segTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {strings.segSubtitle}
        </p>
      </div>

      {/* Control Panel Card: Dataset, Features, Hyperparameters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-7 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Dataset Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Database className="w-4 h-4 text-blue-600" />
              <span>{strings.datasetLabel}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">
                  {language === 'th' ? 'ชุดข้อมูลสินค้าอีคอมเมิร์ซ' : 'E-commerce Products Dataset'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {strings.activeBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {strings.datasetDesc}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span>{language === 'th' ? 'ขนาดไฟล์: 14.2 MB' : 'Size: 14.2 MB'}</span>
                <span>{language === 'th' ? 'ชนิด: Tabular CSV' : 'Type: Tabular CSV'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Feature Selection (Multivariate dimensions) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>{strings.featuresLabel}</span>
              </div>
              <span className="text-xs text-slate-500">
                {strings.featuresSelected.replace('{count}', activeFeaturesCount.toString())}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'price', label: language === 'th' ? 'ราคา (Price)' : 'Price', unit: 'USD ($)' },
                { key: 'discountPercentage', label: language === 'th' ? 'เปอร์เซ็นต์ส่วนลด' : 'Discount Percentage', unit: '%' },
                { key: 'quantitySold', label: language === 'th' ? 'จำนวนที่ขายได้' : 'Quantity Sold', unit: 'Units' },
                { key: 'salesValue', label: language === 'th' ? 'มูลค่ายอดขาย' : 'Sales Value', unit: 'Price × Qty' },
                { key: 'rankScore', label: language === 'th' ? 'คะแนนความนิยม' : 'Rank Score', unit: 'Index 1-100' },
              ].map(f => (
                <label 
                  key={f.key} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                    features[f.key]
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={features[f.key]}
                      onChange={() => handleToggleFeature(f.key)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold">{f.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{f.unit}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Hyperparameter Selection (k, init, max_iter) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              <span>{strings.clusterCountLabel}</span>
            </div>

            <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">
                    {language === 'th' ? 'จำนวนกลุ่มเป้าหมาย (k):' : 'Clusters (k):'}
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">{clusterCount}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 3, 4, 5, 6].map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setClusterCount(k)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                        clusterCount === k
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{strings.optimalViaElbow.replace('{k}', '4')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <span>{language === 'th' ? 'การกำหนดจุดเริ่มต้น:' : 'Init Algorithm:'}</span>
                <span className="font-mono font-semibold text-slate-800">k-means++</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Pre-processing notice */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{strings.scaleNotice}</span>
          </div>

          <button
            onClick={handleRunClustering}
            disabled={isRunning}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm ${
              isRunning
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-[#8E1825] hover:bg-[#6E121C] text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>{strings.btnRunning}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{strings.btnRunCluster}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Pipeline Stepper Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {strings.pipelineProgressTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {strings.pipelineProgressSubtitle}
            </p>
          </div>

          {/* Progress % bar */}
          <div className="flex items-center gap-3">
            <div className="w-32 bg-[#C8D9EC]/40 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-[#8E1825] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#3D2722] min-w-8 text-right">
              {progress}%
            </span>
          </div>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {processingSteps.map((step, idx) => {
            const isFinished = activeStepIndex > idx || (activeStepIndex === idx && progress === 100);
            const isCurrent = activeStepIndex === idx && isRunning;
            return (
              <div 
                key={step.id} 
                className={`p-4 rounded-xl border transition relative space-y-2 ${
                  isFinished
                    ? 'bg-[#FFEDAD]/40 border-[#FFEDAD] text-[#3D2722]'
                    : isCurrent
                    ? 'bg-[#C8D9EC]/30 border-[#C8D9EC] text-[#3D2722] ring-2 ring-[#8E1825]/30'
                    : 'bg-white/60 border-[#3D2722]/10 text-[#3D2722]/50 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${isFinished ? 'text-[#8E1825]' : 'text-[#3D2722]/40'}`}>
                    STEP 0{idx + 1}
                  </span>
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8E1825]" />
                  ) : isCurrent ? (
                    <RotateCcw className="w-4 h-4 text-[#8E1825] animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#3D2722]/20" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm line-clamp-1 text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{step.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 leading-snug">
                  {step.details}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clustering Results Section */}
      {hasRun && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl font-bold text-slate-900">
                  {strings.resultsTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {strings.resultsSubtitle}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              k = {clusterCount} Clusters Converged
            </span>
          </div>

          {/* Statistical Quality Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Silhouette Score */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'th' ? 'ดัชนีวัดความชัดเจนของกลุ่ม' : 'Validation Metric'}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-3xl font-extrabold ${clusterCount === 4 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {activeMetrics.silhouetteScore.toFixed(3)}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  clusterCount === 4 
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-200' 
                    : 'text-blue-800 bg-blue-100 border-blue-200'
                }`}>
                  {language === 'th' ? activeMetrics.silRatingTh : activeMetrics.silRatingEn}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{strings.metrics.silScore}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {strings.metrics.silDesc}
              </p>
            </div>

            {/* Davies-Bouldin Index */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'th' ? 'ดัชนีความกระชับของกลุ่ม' : 'Cluster Compactness'}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-blue-600">
                  {activeMetrics.dbIndex.toFixed(2)}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  activeMetrics.dbIndex <= 0.85 
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-200' 
                    : 'text-blue-800 bg-blue-100 border-blue-200'
                }`}>
                  {language === 'th' ? activeMetrics.dbRatingTh : activeMetrics.dbRatingEn}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{strings.metrics.dbIndex}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {strings.metrics.dbDesc}
              </p>
            </div>

            {/* Inertia / WCSS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'th' ? 'ผลรวมความแปรปรวนในกลุ่ม' : 'Objective Function'}
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">
                  {activeMetrics.inertia.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {language === 'th' ? `ลู่เข้าแล้ว (${activeMetrics.iterations} รอบ)` : `Converged (${activeMetrics.iterations} iter)`}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">{strings.metrics.inertia}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {strings.metrics.inertiaDesc}
              </p>
            </div>
          </div>

          {/* Model Validation Charts: Elbow Method & Silhouette Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Elbow Method Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">{strings.elbowChartTitle}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  clusterCount === 4 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}>
                  k = {clusterCount} (Inertia: {activeMetrics.inertia.toLocaleString()})
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                {strings.elbowChartSubtitle}
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ELBOW_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="k" 
                      label={{ value: language === 'th' ? 'จำนวนกลุ่ม (k)' : 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ value: 'Inertia (WCSS)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <ChartTooltip 
                      formatter={(val: any) => [val != null ? Number(val).toLocaleString() : '', 'WCSS']}
                      labelFormatter={(lbl) => `k = ${lbl} Clusters`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inertia" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#2563eb' }}
                      activeDot={{ r: 7 }}
                    />
                    <ReferenceDot 
                      x={clusterCount} 
                      y={activeMetrics.inertia} 
                      r={9} 
                      fill={clusterCount === 4 ? "#10b981" : "#8E1825"} 
                      stroke="#ffffff" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 leading-relaxed">
                💡 <strong>{language === 'th' ? 'การแปลความหมายทางคณิตศาสตร์:' : 'Mathematical Interpretation:'}</strong> {strings.elbowInterpretation}
              </div>
            </div>

            {/* Silhouette Score by k */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">{strings.silChartTitle}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  clusterCount === 4 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}>
                  k = {clusterCount} ({activeMetrics.silhouetteScore.toFixed(3)})
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                {strings.silChartSubtitle}
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ELBOW_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="k" 
                      label={{ value: language === 'th' ? 'จำนวนกลุ่ม (k)' : 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0.3, 0.7]}
                      label={{ value: 'Silhouette Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <ChartTooltip 
                      formatter={(val: any) => [val != null ? Number(val).toFixed(3) : '', 'Silhouette Score']}
                      labelFormatter={(lbl) => `k = ${lbl}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="silhouetteScore" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#10b981' }}
                      activeDot={{ r: 7 }}
                    />
                    <ReferenceDot 
                      x={clusterCount} 
                      y={activeMetrics.silhouetteScore} 
                      r={9} 
                      fill={clusterCount === 4 ? "#10b981" : "#8E1825"} 
                      stroke="#ffffff" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 leading-relaxed">
                💡 <strong>{language === 'th' ? 'การประเมินความชัดเจนของขอบเขตกลุ่ม:' : 'Separation Verification:'}</strong> {language === 'th' ? `ค่า Silhouette ที่ k = ${clusterCount} คือ ${activeMetrics.silhouetteScore.toFixed(3)} (จุดสูงสุดและเหมาะสมที่สุดคือ k = 4 ได้ 0.582)` : `Silhouette at k=${clusterCount} is ${activeMetrics.silhouetteScore.toFixed(3)} (Optimal peak is at k=4 with 0.582).`}
              </div>
            </div>
          </div>

          {/* Dynamic Cluster Result Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'th' ? `ผลลัพธ์การจัดกลุ่ม (${activeClusters.length} กลุ่มสำหรับ k = ${clusterCount})` : `Cluster Segmentation Results (${activeClusters.length} clusters for k = ${clusterCount})`}
              </span>
              <span className="text-xs text-slate-400">
                {language === 'th' ? 'คลิกที่การ์ดเพื่อดูรายละเอียดกลยุทธ์' : 'Click card to view details'}
              </span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${
              clusterCount === 2 ? 'lg:grid-cols-2' :
              clusterCount === 3 ? 'lg:grid-cols-3' :
              clusterCount === 5 ? 'lg:grid-cols-5' :
              clusterCount === 6 ? 'lg:grid-cols-3 xl:grid-cols-6' :
              'lg:grid-cols-4'
            } gap-4`}>
              {activeClusters.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => onSelectCluster(c.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md cursor-pointer transition space-y-3 hover:border-[#8E1825]/40 group"
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${c.color}20`, color: c.color }}
                    >
                      {language === 'th' ? `กลุ่มที่ ${c.id}` : `Cluster ${c.id}`}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">{c.percentage}%</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#8E1825] transition-colors">
                      {language === 'th' ? c.nameTh : c.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {language === 'th' ? c.descriptionTh : c.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">{language === 'th' ? 'ราคาเฉลี่ย' : 'Avg Price'}</span>
                      <span className="font-extrabold text-slate-800">${c.avgPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">{language === 'th' ? 'ยอดขายเฉลี่ย' : 'Avg Qty'}</span>
                      <span className="font-extrabold text-slate-800">{c.avgQuantitySold.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
