import React, { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2, Play, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Language } from '../types';
import { ExperimentResult, runExperiment } from '../utils/kmeans';

const CLUSTER_COLORS = ['#8E1825', '#375678', '#8C6A08', '#3D2722', '#6E8B3D', '#B5651D', '#5B4B8A', '#2A7F7F'];
const TRAIN_COLOR = '#375678';
const TEST_COLOR = '#8E1825';

const TEXT = {
  th: {
    title: 'แบ่งข้อมูล Train / Test สำหรับ K-Means',
    intro:
      'แบ่งข้อมูลออกเป็นชุดเรียนรู้ (Train) และชุดทดสอบ (Test) ฝึกโมเดลและ Scaler จาก Train เท่านั้น แล้วนำไปจัดกลุ่มสินค้าที่โมเดลไม่เคยเห็น เพื่อดูว่าผลการจัดกลุ่มนิ่งหรือไม่',
    simNote: 'ข้อมูลในหน้านี้เป็นข้อมูลจำลองที่สร้างจากโปรไฟล์ 4 กลุ่มของระบบ ไม่ใช่ข้อมูลจริง 82,103 รายการ',
    total: 'จำนวนสินค้าทั้งหมด',
    testRatio: 'สัดส่วน Test',
    k: 'จำนวนคลัสเตอร์ (k)',
    seed: 'Random seed',
    run: 'ฝึกและทดสอบโมเดล',
    running: 'กำลังคำนวณ…',
    trainSet: 'ชุด Train',
    testSet: 'ชุด Test',
    items: 'รายการ',
    inertia: 'Inertia ต่อสินค้า (ต่ำ = ดี)',
    silhouette: 'Silhouette (สูง = ดี)',
    db: 'Davies-Bouldin (ต่ำ = ดี)',
    ari: 'ARI เทียบกลุ่มจริง (1 = ตรงทั้งหมด)',
    verdictGood: 'โมเดลนิ่ง',
    verdictGoodDesc: (g: number) =>
      `Inertia ต่อสินค้าของ Test ต่างจาก Train เพียง ${g.toFixed(1)}% แสดงว่ากลุ่มที่เรียนรู้ใช้กับสินค้าใหม่ได้`,
    verdictBad: 'อาจ Overfit',
    verdictBadDesc: (g: number) =>
      `Inertia ต่อสินค้าของ Test สูงกว่า Train ${g.toFixed(1)}% ลองลดค่า k หรือเพิ่มจำนวนข้อมูล`,
    shareTitle: 'สัดส่วนสินค้าในแต่ละคลัสเตอร์ (%)',
    sweepTitle: 'เลือก k: Inertia ต่อสินค้า Train เทียบ Test',
    sweepSil: 'Silhouette ตามค่า k',
    profileTitle: 'โปรไฟล์คลัสเตอร์ (คำนวณจาก Train)',
    cluster: 'คลัสเตอร์',
    price: 'ราคาเฉลี่ย ($)',
    discount: 'ส่วนลด (%)',
    qty: 'ยอดขาย (ชิ้น)',
    sales: 'มูลค่าขาย ($)',
    predTitle: 'ตัวอย่างสินค้าชุด Test ที่โมเดลไม่เคยเห็น',
    product: 'สินค้า',
    predicted: 'คลัสเตอร์ที่ทำนาย',
    note: 'หมายเหตุ: หมายเลขคลัสเตอร์ของ K-Means เป็นเพียงป้ายชื่อ อาจสลับลำดับเมื่อเปลี่ยน seed จึงใช้ ARI ซึ่งไม่ขึ้นกับลำดับป้าย',
  },
  en: {
    title: 'Train / Test Split for K-Means',
    intro:
      'Split the data into a Train and a Test set. The scaler and model are fitted on Train only, then used to cluster products the model has never seen, to check whether the segmentation holds up.',
    simNote: 'This page uses simulated data generated from the system’s 4 cluster profiles, not the real 82,103 products.',
    total: 'Total products',
    testRatio: 'Test share',
    k: 'Clusters (k)',
    seed: 'Random seed',
    run: 'Train and test model',
    running: 'Computing…',
    trainSet: 'Train set',
    testSet: 'Test set',
    items: 'items',
    inertia: 'Inertia per product (lower is better)',
    silhouette: 'Silhouette (higher is better)',
    db: 'Davies-Bouldin (lower is better)',
    ari: 'ARI vs true groups (1 = perfect match)',
    verdictGood: 'Model is stable',
    verdictGoodDesc: (g: number) =>
      `Test inertia per product differs from Train by only ${g.toFixed(1)}%, so the learned segments carry over to new products.`,
    verdictBad: 'Possible overfitting',
    verdictBadDesc: (g: number) =>
      `Test inertia per product is ${g.toFixed(1)}% higher than Train. Try a smaller k or more data.`,
    shareTitle: 'Share of products per cluster (%)',
    sweepTitle: 'Choosing k: inertia per product, Train vs Test',
    sweepSil: 'Silhouette by k',
    profileTitle: 'Cluster profiles (from Train)',
    cluster: 'Cluster',
    price: 'Avg price ($)',
    discount: 'Discount (%)',
    qty: 'Units sold',
    sales: 'Sales value ($)',
    predTitle: 'Sample unseen products from the Test set',
    product: 'Product',
    predicted: 'Predicted cluster',
    note: 'Note: K-Means cluster numbers are only labels and can shuffle with a different seed, which is why ARI (label-order independent) is used.',
  },
};

interface Props {
  language: Language;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex flex-col gap-1.5 text-sm font-medium text-[#3D2722]">
    {label}
    {children}
  </label>
);

const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <section className={`rounded-2xl border border-[#3D2722]/10 bg-white/90 p-5 backdrop-blur ${className}`}>
    {title && <h3 className="mb-4 text-base font-semibold text-[#3D2722]">{title}</h3>}
    {children}
  </section>
);

export const TrainTestPanel: React.FC<Props> = ({ language }) => {
  const t = TEXT[language];
  const [total, setTotal] = useState(5000);
  const [testPct, setTestPct] = useState(20);
  const [k, setK] = useState(4);
  const [seed, setSeed] = useState(42);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExperimentResult | null>(null);

  const run = useCallback(() => {
    setBusy(true);
    // ให้ UI วาดสถานะ loading ก่อนเริ่มคำนวณ
    setTimeout(() => {
      setResult(runExperiment({ total, testRatio: testPct / 100, k, seed }));
      setBusy(false);
    }, 30);
  }, [total, testPct, k, seed]);

  useEffect(() => {
    run();
    // รันครั้งแรกตอนเปิดหน้า
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stable = result ? Math.abs(result.generalizationGapPct) < 10 : true;

  const metricRows = result
    ? [
        { label: t.inertia, a: result.train.inertiaPerSample, b: result.test.inertiaPerSample, d: 3 },
        { label: t.silhouette, a: result.train.silhouette, b: result.test.silhouette, d: 3 },
        { label: t.db, a: result.train.daviesBouldin, b: result.test.daviesBouldin, d: 3 },
        { label: t.ari, a: result.train.ari, b: result.test.ari, d: 3 },
      ]
    : [];

  const shareData = result
    ? result.train.clusterShare.map((v, i) => ({
        name: `${t.cluster} ${i + 1}`,
        Train: +v.toFixed(1),
        Test: +result.test.clusterShare[i].toFixed(1),
      }))
    : [];

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <h2 className="text-xl font-bold text-[#3D2722]">{t.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#3D2722]/80">{t.intro}</p>
        <p className="mt-2 text-xs text-[#8C6A08]">{t.simNote}</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <Field label={t.total}>
            <select
              value={total}
              onChange={(e) => setTotal(+e.target.value)}
              className="rounded-lg border border-[#3D2722]/20 bg-white px-3 py-2"
            >
              {[2000, 5000, 10000, 20000].map((n) => (
                <option key={n} value={n}>
                  {n.toLocaleString()}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`${t.testRatio}: ${testPct}%`}>
            <input
              type="range"
              min={10}
              max={40}
              step={5}
              value={testPct}
              onChange={(e) => setTestPct(+e.target.value)}
              className="accent-[#8E1825]"
            />
          </Field>
          <Field label={`${t.k}: ${k}`}>
            <input
              type="range"
              min={2}
              max={8}
              value={k}
              onChange={(e) => setK(+e.target.value)}
              className="accent-[#8E1825]"
            />
          </Field>
          <Field label={t.seed}>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(+e.target.value || 0)}
              className="rounded-lg border border-[#3D2722]/20 bg-white px-3 py-2"
            />
          </Field>
          <button
            onClick={run}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#8E1825] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6E121C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E1825] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {busy ? t.running : t.run}
          </button>
        </div>
      </Card>

      {result && (
        <>
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              stable ? 'border-[#375678]/30 bg-[#EBF2FA]' : 'border-[#8E1825]/30 bg-[#FBF0F1]'
            }`}
          >
            {stable ? (
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#375678]" />
            ) : (
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#8E1825]" />
            )}
            <div>
              <p className="font-semibold text-[#3D2722]">{stable ? t.verdictGood : t.verdictBad}</p>
              <p className="text-sm text-[#3D2722]/80">
                {stable
                  ? t.verdictGoodDesc(Math.abs(result.generalizationGapPct))
                  : t.verdictBadDesc(result.generalizationGapPct)}
              </p>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-[#3D2722]/15 text-left text-[#3D2722]/70">
                    <th className="py-2 pr-4 font-medium" />
                    <th className="py-2 pr-4 font-medium" style={{ color: TRAIN_COLOR }}>
                      {t.trainSet} · {result.train.size.toLocaleString()} {t.items}
                    </th>
                    <th className="py-2 font-medium" style={{ color: TEST_COLOR }}>
                      {t.testSet} · {result.test.size.toLocaleString()} {t.items}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metricRows.map((m) => (
                    <tr key={m.label} className="border-b border-[#3D2722]/8 last:border-0">
                      <td className="py-2.5 pr-4 text-[#3D2722]/80">{m.label}</td>
                      <td className="py-2.5 pr-4 font-['JetBrains_Mono'] tabular-nums">{m.a.toFixed(m.d)}</td>
                      <td className="py-2.5 font-['JetBrains_Mono'] tabular-nums">{m.b.toFixed(m.d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title={t.shareTitle}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D272215" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Train" fill={TRAIN_COLOR} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Test" fill={TEST_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title={t.sweepTitle}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.sweep}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D272215" />
                    <XAxis dataKey="k" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => Number(v).toFixed(3)} />
                    <Legend />
                    <ReferenceLine x={result.k} stroke="#8C6A08" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="trainInertia" name="Train" stroke={TRAIN_COLOR} strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="testInertia"
                      name="Test"
                      stroke={TEST_COLOR}
                      strokeWidth={2}
                      strokeDasharray="6 3"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title={t.sweepSil}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.sweep}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3D272215" />
                  <XAxis dataKey="k" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                  <Tooltip formatter={(v) => Number(v).toFixed(3)} />
                  <Legend />
                  <ReferenceLine x={result.k} stroke="#8C6A08" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="trainSilhouette" name="Train" stroke={TRAIN_COLOR} strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="testSilhouette"
                    name="Test"
                    stroke={TEST_COLOR}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title={t.profileTitle}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[#3D2722]/15 text-left text-[#3D2722]/70">
                    <th className="py-2 pr-4 font-medium">{t.cluster}</th>
                    <th className="py-2 pr-4 font-medium">Train</th>
                    <th className="py-2 pr-4 font-medium">Test</th>
                    <th className="py-2 pr-4 font-medium">{t.price}</th>
                    <th className="py-2 pr-4 font-medium">{t.discount}</th>
                    <th className="py-2 pr-4 font-medium">{t.qty}</th>
                    <th className="py-2 font-medium">{t.sales}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {result.profiles.map((p) => (
                    <tr key={p.cluster} className="border-b border-[#3D2722]/8 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                          style={{ background: CLUSTER_COLORS[(p.cluster - 1) % CLUSTER_COLORS.length] }}
                        />
                        {p.cluster}
                      </td>
                      <td className="py-2.5 pr-4">{p.trainCount.toLocaleString()}</td>
                      <td className="py-2.5 pr-4">{p.testCount.toLocaleString()}</td>
                      <td className="py-2.5 pr-4">{p.avgPrice.toFixed(2)}</td>
                      <td className="py-2.5 pr-4">{p.avgDiscount.toFixed(1)}</td>
                      <td className="py-2.5 pr-4">{Math.round(p.avgQuantity).toLocaleString()}</td>
                      <td className="py-2.5">{Math.round(p.avgSales).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title={t.predTitle}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-[#3D2722]/15 text-left text-[#3D2722]/70">
                    <th className="py-2 pr-4 font-medium">{t.product}</th>
                    <th className="py-2 pr-4 font-medium">{t.price}</th>
                    <th className="py-2 pr-4 font-medium">{t.discount}</th>
                    <th className="py-2 pr-4 font-medium">{t.qty}</th>
                    <th className="py-2 font-medium">{t.predicted}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {result.testPredictions.map(({ row, predicted }) => (
                    <tr key={row.id} className="border-b border-[#3D2722]/8 last:border-0">
                      <td className="py-2.5 pr-4 font-['JetBrains_Mono'] text-xs">{row.id}</td>
                      <td className="py-2.5 pr-4">{row.price.toFixed(2)}</td>
                      <td className="py-2.5 pr-4">{row.discount}</td>
                      <td className="py-2.5 pr-4">{row.quantitySold.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ background: CLUSTER_COLORS[(predicted - 1) % CLUSTER_COLORS.length] }}
                        >
                          {t.cluster} {predicted}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-[#3D2722]/60">{t.note}</p>
          </Card>
        </>
      )}
    </div>
  );
};

export default TrainTestPanel;
