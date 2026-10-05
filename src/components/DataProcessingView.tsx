import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowDown, 
  CheckCircle2, 
  Code2, 
  Calculator, 
  Layers, 
  Sparkles, 
  Terminal, 
  Database,
  FileSpreadsheet,
  Cpu,
  Info,
  ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { t } from '../locales/translations';

interface DataProcessingViewProps {
  language?: Language;
}

export const DataProcessingView: React.FC<DataProcessingViewProps> = ({ 
  language = 'th'
}) => {
  const strings = t[language];
  const [activeStepIndex, setActiveStepIndex] = useState(3);

  const pipelineStages = [
    {
      id: 1,
      title: language === 'th' ? "นำเข้าข้อมูลดิบ (Raw Data)" : "Raw Data Ingestion",
      summary: language === 'th' ? "นำเข้าแคตตาล็อกสินค้า 82,105 รายการจากไฟล์ CSV" : "CSV ingestion of 82,105 product records.",
      details: language === 'th' 
        ? "นำเข้าชุดข้อมูลสินค้าอีคอมเมิร์ซที่มี 82,105 แถวข้อมูลและ 11 แอตทริบิวต์ ประกอบด้วยรหัสสินค้า (SKU), ราคาตั้งต้น, หมวดหมู่, สต็อก, จำนวนออเดอร์ และวันที่ลงจำหน่าย"
        : "Raw transactional and catalog dataset imported from e-commerce databases. Contains raw prices, category strings, stock levels, orders, and timestamps.",
      pythonCode: `# 1. Ingest raw CSV data\nimport pandas as pd\ndf_raw = pd.read_csv("CLEAN-Ecommerce-products-all_categories_csv.csv")\nprint(f"Loaded shape: {df_raw.shape}")  # (82105, 11)`,
      inputSchema: "82,105 rows × 11 raw columns",
      outputSchema: "82,105 rows × 11 raw columns",
      metrics: language === 'th' ? "โหลดข้อมูล 82,105 รายการ" : "82,105 records loaded",
    },
    {
      id: 2,
      title: language === 'th' ? "ทำความสะอาดข้อมูล (Cleaning)" : "Data Cleaning",
      summary: language === 'th' ? "แปลงราคาเป็นตัวเลขและตัดแถวที่ไม่มีราคา" : "Numeric conversion of price and removal of rows without a price.",
      details: language === 'th'
        ? "ลบคอมมาในราคา (เช่น 1,430.99) แล้วแปลงเป็นทศนิยม จากนั้นตัดแถวที่ราคาว่าง ซึ่งพบ 2 แถวที่ว่างทั้งแถว (ไม่มีชื่อ ราคา และยอดขาย) เหลือ 82,103 แถว"
        : "Strips thousands separators from price (e.g. 1,430.99), casts to float, and drops rows with no price: 2 fully empty rows, leaving 82,103.",
      pythonCode: `# 2. Data Cleaning\ndf = df_raw.copy()\ndf['price_usd'] = pd.to_numeric(df['price_usd'].astype(str).str.replace(',', ''), errors='coerce')\ndf = df.dropna(subset=['price_usd'])\nprint(f"Cleaned dataset: {len(df)} rows")`,
      inputSchema: "82,105 rows × 11 columns",
      outputSchema: "82,103 rows × 11 columns (2 empty rows dropped)",
      metrics: language === 'th' ? "ตัดแถวว่าง 2 รายการ" : "2 empty rows dropped",
    },
    {
      id: 3,
      title: language === 'th' ? "จัดการค่าสูญหาย (Imputation)" : "Missing Value Handling",
      summary: language === 'th' ? "เติมค่าว่างของยอดขายด้วยมัธยฐาน" : "Median imputation of missing quantity sold.",
      details: language === 'th'
        ? "คอลัมน์ qty_sold ว่าง 27,739 แถว (33.8%) จึงเติมด้วยค่ามัธยฐาน (300) แทนการลบแถวทิ้ง เพื่อใช้ข้อมูลครบ 82,103 แถว ส่วน pct_discount ที่ว่างเติมเป็น 0 (หมวดชุดว่ายน้ำไม่มียอดขายเลยจึงถูกเติมทั้งหมด)"
        : "qty_sold was missing in 27,739 rows (33.8%) and was imputed with the median (300) instead of dropping rows; missing pct_discount is set to 0. The swimwear category has no sales data at all, so all of it is imputed.",
      pythonCode: `# 3. Impute missing values\ndf['qty_sold'] = df['qty_sold'].fillna(df['qty_sold'].median())  # median = 300\ndf['pct_discount'] = df['pct_discount'].fillna(0)`,
      inputSchema: "27,739 missing qty_sold values",
      outputSchema: "100% complete dataset (0 NaNs)",
      metrics: language === 'th' ? "เติมค่าด้วยมัธยฐานสมบูรณ์" : "Median imputation applied",
    },
    {
      id: 4,
      title: language === 'th' ? "วิศวกรรมฟีเจอร์ (Feature Eng.)" : "Feature Engineering",
      summary: language === 'th' ? "คำนวณตัวแปรทางธุรกิจใหม่จากตัวแปรตั้งต้น" : "Derivation of domain-specific business metrics from base variables.",
      details: language === 'th'
        ? "สร้างตัวแปรชี้วัดทางการเงินและพฤติกรรมลูกค้า: มูลค่ายอดขายรวม (Sales Value), ราคาจ่ายจริงสุทธิ (Final Price), จำนวนเงินส่วนลด (Discount Amount) และคะแนนอันดับความนิยม"
        : "Constructing composite features: Sales Value, Final Effective Price, Discount Dollar Amount, and Normalized Rank Score.",
      pythonCode: `# 4. Compute Engineered Features\ndf['sales_value'] = df['price'] * df['quantity_sold']\ndf['final_price'] = df['price'] * (1 - (df['discount'] / 100))\ndf['discount_amount'] = df['price'] - df['final_price']`,
      inputSchema: "3 raw inputs (price, discount, qty)",
      outputSchema: "3 engineered financial dimensions",
      metrics: language === 'th' ? "คำนวณสูตรครบทุกแถว" : "Formulas computed vectorized",
    },
    {
      id: 5,
      title: language === 'th' ? "คัดเลือกฟีเจอร์ (Selection)" : "Feature Selection",
      summary: language === 'th' ? "คัดเลือก 5 มิติข้อมูลหลักเข้าสู่กระบวนการจัดกลุ่ม" : "Dimensionality reduction: selecting 5 relevant clustering variables.",
      details: language === 'th'
        ? "คัดกรองตัวแปรเหลือ 5 มิติที่มีความสำคัญต่อการแยกแยะพฤติกรรมยอดขายของสินค้า ได้แก่ ราคา, ส่วนลด %, จำนวนที่ขายได้, มูลค่ายอดขายรวม และคะแนนความนิยม"
        : "Filtering down to the 5 core variables with maximum descriptive power over e-commerce sales characteristics.",
      pythonCode: `# 5. Select 5 Core Clustering Dimensions\nfeatures = [\n    'price',\n    'discount',\n    'quantity_sold',\n    'sales_value',\n    'rank_score'\n]\nX = df[features].copy()`,
      inputSchema: "15 candidate columns",
      outputSchema: "5 selected features matrix (82,103 × 5)",
      metrics: language === 'th' ? "5 มิติตัวแปรทางสถิติ" : "5 numerical dimensions",
    },
    {
      id: 6,
      title: language === 'th' ? "ปรับมาตรฐานข้อมูล (StandardScaler)" : "StandardScaler Normalization",
      summary: language === 'th' ? "แปลง Z-Score (μ=0, σ=1) เพื่อลบความเอนเอียงของขนาดหน่วย" : "Z-score transformation (μ=0, σ=1) to eliminate dimensional scale bias.",
      details: language === 'th'
        ? "เนื่องจากระยะห่าง Euclidean ไวต่อขนาดตัวเลขมาก หากจำนวนขายมีค่าหลักพันขณะที่ราคามีค่าหลักสิบ ตัวแปรยอดขายจะครอบงำระยะห่าง จึงต้องปรับมาตรฐานให้มีค่าเฉลี่ยเป็น 0 และส่วนเบี่ยงเบนมาตรฐานเป็น 1"
        : "Euclidean distance is sensitive to differences in scale. Since Quantity Sold ranges into thousands while Price is under $50, standardization is strictly required.",
      pythonCode: `# 6. StandardScaler: z = (x - mean) / std\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nprint("Scaled means:", X_scaled.mean(axis=0).round(2)) # [0, 0, 0, 0, 0]`,
      inputSchema: "Original scale units ($ and counts)",
      outputSchema: "Standard normal distribution (Z ~ N(0, 1))",
      metrics: "Mean = 0.00, Std = 1.00",
    },
    {
      id: 7,
      title: language === 'th' ? "จัดกลุ่ม K-Means (Clustering)" : "K-Means Clustering",
      summary: language === 'th' ? "ใช้อัลกอริทึม Lloyd พร้อมกำหนดจุดเริ่มต้นแบบ k-means++" : "Lloyd's clustering algorithm with k-means++ centroid initialization.",
      details: language === 'th'
        ? "ประมวลผลการคำนวณวนซ้ำเพื่อลดค่าผลรวมกำลังสองของระยะห่างภายในกลุ่ม (WCSS/Inertia) ให้ต่ำที่สุด โมเดลลู่เข้าในรอบที่ 14 ที่จำนวนกลุ่ม k = 4"
        : "Executes iterative optimization to minimize Within-Cluster Sum of Squares (Inertia). Converged in 14 iterations.",
      pythonCode: `# 7. Fit KMeans (k=4)\nfrom sklearn.cluster import KMeans\nkmeans = KMeans(n_clusters=4, init='k-means++', random_state=42, n_init=10)\ndf['cluster'] = kmeans.fit_predict(X_scaled) + 1  # 1-indexed (1 to 4)`,
      inputSchema: "Scaled matrix (82,103 × 5)",
      outputSchema: "Cluster labels 1, 2, 3, 4",
      metrics: "WCSS: 143,308 (Converged)",
    },
    {
      id: 8,
      title: language === 'th' ? "วิเคราะห์กลุ่ม (Cluster Analysis)" : "Cluster Analysis & Interpretation",
      summary: language === 'th' ? "สร้างโปรไฟล์ทางสถิติ ตั้งชื่อกลุ่มสินค้า และกำหนดยุทธศาสตร์ธุรกิจ" : "Post-hoc statistical profiling, business labeling, and strategy formulation.",
      details: language === 'th'
        ? "คำนวณค่าเฉลี่ยของจุดกึ่งกลาง (Centroid Means) วิเคราะห์ความยืดหยุ่นของราคา นำไปสู่การวางนโยบายสนับสนุนการตัดสินใจสำหรับเจ้าของร้านและนักการตลาด"
        : "Calculates centroid means, statistical summaries, price-elasticity profiles, and actionable merchant strategies.",
      pythonCode: `# 8. Post-Hoc Group Profiling\ncluster_summary = df.groupby('cluster').agg({\n    'price': 'mean',\n    'discount': 'mean',\n    'quantity_sold': 'mean',\n    'sales_value': 'mean',\n    'sku': 'count'\n}).rename(columns={'sku': 'product_count'})\nprint(cluster_summary)`,
      inputSchema: "Labeled dataset",
      outputSchema: "4 Segment Profiles with Domain Insights",
      metrics: "Silhouette Score: 0.315",
    },
  ];

  const currentStep = pipelineStages[activeStepIndex];

  return (
    <div className="space-y-8 pb-16 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {language === 'th' ? 'สถาปัตยกรรม Machine Learning Pipeline' : 'Machine Learning Pipeline Architecture'}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">
            {language === 'th' ? 'กระบวนการแปลงข้อมูลและโมเดลทางคณิตศาสตร์' : 'End-to-End ETL & Mathematical Modeling'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {strings.pipeTitle}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {strings.pipeSubtitle}
        </p>
      </div>

      {/* Pipeline Flowchart (Vertical / Responsive Step Ladder) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-base">{strings.flowTitle}</h2>
          </div>
          <span className="text-xs text-slate-400">{strings.flowHint}</span>
        </div>

        {/* Step Flow Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {pipelineStages.map((stage, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex flex-col items-center text-center p-3 rounded-xl border transition relative ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className={`text-[10px] font-mono uppercase font-bold mb-1 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  0{stage.id}
                </span>
                <span className="text-xs font-bold leading-snug line-clamp-2">{stage.title}</span>
                {idx < pipelineStages.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Step Deep Dive Card */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                {currentStep.id}
              </span>
              <h3 className="font-bold text-slate-900 text-base">{currentStep.title}</h3>
            </div>
            <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-600">
              {currentStep.metrics}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {currentStep.details}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium uppercase">
                {language === 'th' ? 'เวกเตอร์ข้อมูลขาเข้า (Input Vector):' : 'Input Vector:'}
              </span>
              <div className="font-mono text-slate-800 font-semibold mt-0.5">{currentStep.inputSchema}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium uppercase">
                {language === 'th' ? 'เวกเตอร์ข้อมูลขาออก (Output Vector):' : 'Output Vector:'}
              </span>
              <div className="font-mono text-slate-800 font-semibold mt-0.5">{currentStep.outputSchema}</div>
            </div>
          </div>

          {/* Python Scikit-learn code snippet for this step */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'th' ? 'โค้ดคำสั่งภาษา Python (Scikit-learn):' : 'Python Scikit-learn Pipeline Code:'}</span>
            </div>
            <pre className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
              <code>{currentStep.pythonCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Selected Features Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-7 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base">{strings.featTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'th' ? 'มิติข้อมูล 5 ตัวแปรที่ถูกส่งเข้าสู่ StandardScaler และ K-Means:' : 'The 5 dimensional features fed into the StandardScaler and K-Means algorithm:'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              num: 1,
              title: language === 'th' ? "ราคา (Price)" : "Price",
              unit: "USD ($)",
              desc: language === 'th' ? "ราคาขายปลีกของสินค้าก่อนหักส่วนลด" : "Product retail selling price before markdown",
              domain: "$2.50 – $48.90",
              tag: language === 'th' ? "การเงิน" : "Financial",
            },
            {
              num: 2,
              title: language === 'th' ? "เปอร์เซ็นต์ส่วนลด" : "Discount Percentage",
              unit: "% (0-100)",
              desc: language === 'th' ? "สัดส่วนการลดราคาจากราคาตั้งต้น" : "Proportionate markdown applied to MSRP",
              domain: "0% – 45%",
              tag: language === 'th' ? "โปรโมชั่น" : "Promotional",
            },
            {
              num: 3,
              title: language === 'th' ? "จำนวนที่ขายได้" : "Quantity Sold",
              unit: "Units",
              desc: language === 'th' ? "ยอดรวมจำนวนหน่วยสินค้าที่ขายได้ในอดีต" : "Aggregated historical volume of purchases",
              domain: "50 – 2,890 units",
              tag: language === 'th' ? "อุปสงค์" : "Demand",
            },
            {
              num: 4,
              title: language === 'th' ? "มูลค่ายอดขาย" : "Sales Value",
              unit: "USD ($)",
              desc: language === 'th' ? "รายได้รวมจากการขาย: ราคา × จำนวนที่ขายได้" : "Gross revenue generated: Price × Quantity",
              domain: "$1,501 – $36,981",
              tag: language === 'th' ? "รายได้รวม" : "Revenue",
            },
            {
              num: 5,
              title: language === 'th' ? "คะแนนความนิยม" : "Rank Score",
              unit: "Index (1-100)",
              desc: language === 'th' ? "ดัชนีการค้นหาและคะแนนรีวิวของลูกค้า" : "Relative search popularity & customer review score",
              domain: "42 – 98 index",
              tag: language === 'th' ? "ความนิยม" : "Popularity",
            },
          ].map((feat) => (
            <div key={feat.num} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {feat.num}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  {feat.tag}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-snug">{feat.desc}</p>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                <span>{language === 'th' ? 'ช่วงค่า:' : 'Domain:'}</span>
                <span className="font-semibold text-slate-800">{feat.domain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Engineering & Mathematical Formulas (Prominently required by user prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{strings.mathTitle}</h2>
            <p className="text-xs text-slate-500">
              {language === 'th' ? 'สูตรที่ใช้สร้างตัวแปรทางธุรกิจ, การปรับมาตรฐานข้อมูล และการคำนวณระยะห่างใน K-Means' : 'Formulas used for feature derivation, standardization, and K-Means distance computation'}
            </p>
          </div>
        </div>

        {/* 3 Explicit Formulas from prompt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Formula 1: Sales Value */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'th' ? 'สูตรที่ 01' : 'Formula 01'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'th' ? 'มูลค่ายอดขายรวม (Sales Value)' : 'Sales Value'}
            </h3>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-blue-700 font-semibold shadow-2xs">
              {strings.formulaSalesVal}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'th' 
                ? 'คำนวณมูลค่ายอดขายรวม (Gross Merchandise Value) ที่สร้างขึ้นจากสินค้าแต่ละรายการ'
                : 'Calculates total gross transaction volume generated by an individual product listing.'}
            </p>
          </div>

          {/* Formula 2: Final Price */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'th' ? 'สูตรที่ 02' : 'Formula 02'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'th' ? 'ราคาจ่ายจริงสุทธิ (Final Price)' : 'Final Price (Effective Paid)'}
            </h3>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-emerald-700 font-semibold shadow-2xs">
              {strings.formulaFinalPrice}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'th'
                ? 'คำนวณราคาที่ผู้ซื้อจ่ายจริงตอนชำระเงินหลังจากหักเปอร์เซ็นต์ส่วนลดโปรโมชั่นแล้ว'
                : 'Calculates the actual consumer checkout price after deducting the promotional markdown.'}
            </p>
          </div>

          {/* Formula 3: Discount Amount */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'th' ? 'สูตรที่ 03' : 'Formula 03'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'th' ? 'จำนวนเงินส่วนลด (Discount Amount)' : 'Discount Amount'}
            </h3>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-amber-700 font-semibold shadow-2xs">
              {strings.formulaDiscountAmt}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'th'
                ? 'จำนวนเงินดอลลาร์ที่ลดลงต่อหน่วยในระหว่างแคมเปญส่งเสริมการขาย'
                : 'The dollar amount deducted per unit during promotional campaign pricing.'}
            </p>
          </div>
        </div>

        {/* Machine Learning Core Math (StandardScaler & Euclidean Distance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* StandardScaler */}
          <div className="p-5 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-2">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              {language === 'th' ? 'สูตรการปรับมาตรฐานข้อมูล (Normalization)' : 'Normalization Formula'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{strings.standardScalerTitle}</h3>
            <div className="p-3 bg-white rounded-lg border border-indigo-200 font-mono text-xs text-indigo-800 font-semibold shadow-2xs">
              z = (x - μ) / σ
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {strings.standardScalerDesc}
            </p>
          </div>

          {/* Euclidean Distance */}
          <div className="p-5 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {language === 'th' ? 'ระยะห่างทางเรขาคณิต (Distance Metric)' : 'Distance Metric'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{strings.euclideanTitle}</h3>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono text-xs text-emerald-800 font-semibold shadow-2xs">
              d(p, q) = √[ ∑ᵢ₌₁ⁿ (pᵢ - qᵢ)² ]
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {strings.euclideanDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
