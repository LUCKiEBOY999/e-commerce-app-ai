# ==========================================
# train_kmeans.py  (K = 2..6)  เขียนตามรูปแบบในแลป 5 (ใช้ KMeans จาก scikit-learn)
#
# ขั้นตอนเหมือนตัวอย่างแลป:
#   kmean_model = KMeans(n_clusters=K, random_state=42)
#   kmean_model.fit(X)
#   y_kmeans = kmean_model.predict(X)
#   centroids = kmean_model.cluster_centers_   -> วาดกราฟ scatter + จุด centroid
#   kmean_model.predict([new_input])           -> ทำนายสินค้าใหม่
# แล้วบันทึกผลลง JSON เพื่อให้เว็บแอปนำไปแสดง
#
# รัน:  python scripts/train_kmeans.py ["data/AI project.csv"]
# ติดตั้ง:  pip install pandas numpy scikit-learn matplotlib
# ผลลัพธ์: src/data/kmeans_results.json  (+ รูปกราฟ scripts/kmeans_plot.png)
# ==========================================

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from scipy.optimize import linear_sum_assignment
from sklearn.metrics import davies_bouldin_score, silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

try:
    import matplotlib.pyplot as plt   # ใช้วาดกราฟแบบในแลป (ถ้าไม่ได้ติดตั้งจะข้ามการวาดกราฟ)
except ImportError:
    plt = None


ROOT = Path(__file__).resolve().parent.parent.parent   # โฟลเดอร์โปรเจกต์ (สคริปต์อยู่ที่ src/utils/)
# ถ้าไม่ระบุไฟล์ จะลองหาชื่อ "AI project.csv" (เว้นวรรค) และ "AI_project.csv" (ขีดล่าง) ในโฟลเดอร์ data
if len(sys.argv) > 1:
    CSV_PATH = Path(sys.argv[1])
else:
    _cands = [ROOT / "data" / "AI project.csv", ROOT / "data" / "AI_project.csv"]
    CSV_PATH = next((c for c in _cands if c.exists()), _cands[0])
if not CSV_PATH.exists():
    sys.exit(f"ไม่พบไฟล์ข้อมูล: {CSV_PATH}\nวางไฟล์ CSV ไว้ที่โฟลเดอร์ data หรือระบุ path: python scripts/train_kmeans.py \"data/ชื่อไฟล์.csv\"")
print("อ่านข้อมูลจาก:", CSV_PATH)
OUT_PATH = ROOT / "src" / "data" / "kmeans_results.json"

KS = list(range(2, 7))       # เลือกได้ K = 2..6
DEFAULT_K = 4                # ค่าเริ่มต้นที่เว็บแสดง
FEATURES = ["price_usd", "pct_discount", "qty_sold", "sales_value"]
RNG = 42

# ------------------------------------------
# LOAD + PREPARE
# ------------------------------------------
df = pd.read_csv(CSV_PATH, low_memory=False)
raw_rows = len(df)

# ราคาบางแถวมีคอมมาคั่นหลักพัน เช่น "1,430.99" -> ต้องลบคอมมาก่อนแปลงเป็นตัวเลข (ไม่งั้นถูกตัดทิ้ง 25 แถว)
df["price_usd"] = df["price_usd"].astype(str).str.replace(",", "", regex=False)
for col in ["price_usd", "pct_discount", "qty_sold"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df = df.dropna(subset=["price_usd"]).copy()
df["pct_discount"] = df["pct_discount"].fillna(0)
qty_median = float(df["qty_sold"].median())
qty_imputed = int(df["qty_sold"].isna().sum())
df["qty_imputed"] = df["qty_sold"].isna()
df["qty_sold"] = df["qty_sold"].fillna(qty_median)
df["sales_value"] = df["price_usd"] * df["qty_sold"]
df = df.reset_index(drop=True)
n = len(df)

X = np.log1p(df[FEATURES].to_numpy(dtype=float))

# ------------------------------------------
# ELBOW / SILHOUETTE (train/test split)
# ------------------------------------------
X_train, X_test = train_test_split(X, test_size=0.20, random_state=RNG)
sc = StandardScaler()
Xtr = sc.fit_transform(X_train)
Xte = sc.transform(X_test)

elbow = []
for k in KS:
    m = KMeans(n_clusters=k, random_state=RNG, n_init=10).fit(Xtr)
    sil = None
    if k > 1:
        sil = float(silhouette_score(Xte, m.predict(Xte), sample_size=10000, random_state=RNG))
    elbow.append({"k": k, "inertia": round(float(m.inertia_), 2),
                  "silhouetteScore": None if sil is None else round(sil, 4)})
test_sil = {e["k"]: e["silhouetteScore"] for e in elbow}

# ------------------------------------------
# BEST K
#  - silhouette: K (>=2) ที่ silhouette บน test set สูงสุด
#  - elbow: จุดโค้งศอก = K ที่ห่างจากเส้นตรง (K แรก -> K สุดท้าย) มากที่สุด
#  - recommended: ใช้ silhouette เป็นหลัก (เปลี่ยนเป็น best_k_elbow ได้ถ้าต้องการ)
# ------------------------------------------
sil_points = [(e["k"], e["silhouetteScore"]) for e in elbow if e["silhouetteScore"] is not None]
best_k_silhouette = max(sil_points, key=lambda t: t[1])[0]

_k = np.array([e["k"] for e in elbow], dtype=float)
_i = np.array([e["inertia"] for e in elbow], dtype=float)
_x = (_k - _k.min()) / (_k.max() - _k.min())
_y = (_i - _i.min()) / ((_i.max() - _i.min()) or 1.0)
best_k_elbow = int(_k[np.argmax(1 - _x - _y)])

best_k = best_k_silhouette
print(f"BEST K: silhouette={best_k_silhouette}  elbow={best_k_elbow}  recommended={best_k}")

# ------------------------------------------
# FINAL MODELS: ทุกค่า K บนข้อมูลทั้งชุด
# ------------------------------------------
scaler = StandardScaler()
Xs = scaler.fit_transform(X)

overall = df[FEATURES].mean()


def make_mapping(k, raw):
    """จับคู่ cluster ดิบ -> id 1..k"""
    means = df.groupby(raw)[FEATURES].mean()
    if k == 4:
        # ความหมายเดิมของเว็บ: 1=ยอดขายสูง 2=ราคาสูง 3=ลดราคาหนัก 4=ที่เหลือ
        remaining = set(means.index)
        mapping = {}
        for new_id, col in [(1, "qty_sold"), (2, "price_usd"), (3, "pct_discount")]:
            pick = means.loc[list(remaining), col].idxmax()
            mapping[int(pick)] = new_id
            remaining.discard(pick)
        mapping[int(remaining.pop())] = 4
        return mapping
    # K อื่น: เรียงตามมูลค่าขายเฉลี่ยมาก -> น้อย
    order = means["sales_value"].sort_values(ascending=False).index
    return {int(raw_id): i + 1 for i, raw_id in enumerate(order)}


def auto_label(g):
    th, en = [], []
    if g.price_usd.mean() > overall.price_usd * 1.25:
        th.append("ราคาสูง"); en.append("High price")
    elif g.price_usd.mean() < overall.price_usd * 0.75:
        th.append("ราคาต่ำ"); en.append("Low price")
    if g.pct_discount.mean() > overall.pct_discount + 8:
        th.append("ลดราคาหนัก"); en.append("Heavy discount")
    elif g.pct_discount.mean() < 3:
        th.append("แทบไม่มีส่วนลด"); en.append("Little discount")
    if g.qty_sold.mean() > overall.qty_sold * 1.25:
        th.append("ยอดขายสูง"); en.append("High sales")
    elif g.qty_sold.mean() < overall.qty_sold * 0.75:
        th.append("ยอดขายต่ำ"); en.append("Low sales")
    if not th:
        th, en = ["ระดับกลาง"], ["Mid-range"]
    return " · ".join(th), " · ".join(en)


inf = float("inf")
BIN_DEFS = {
    "priceBins": ("price_usd", [0, 5, 10, 15, 25, 40, inf],
                  ["$0 - $5", "$5 - $10", "$10 - $15", "$15 - $25", "$25 - $40", "$40+"]),
    "quantityBins": ("qty_sold", [0, 250, 500, 1000, 1800, inf],
                     ["0 - 250", "250 - 500", "500 - 1000", "1000 - 1800", "1800+"]),
    "discountBins": ("pct_discount", [0, 10, 20, 30, inf],
                     ["0 - 10%", "10 - 20%", "20 - 30%", "30%+"]),
}

CAT_TH = {
    "womens_clothing": "เสื้อผ้าสตรี", "baby_and_maternity": "แม่และเด็กอ่อน",
    "electronics": "อิเล็กทรอนิกส์", "shoes": "รองเท้า", "kids": "สินค้าเด็ก",
    "bags_and_luggage": "กระเป๋าและสัมภาระ", "beauty_and_health": "ความงามและสุขภาพ",
    "office_and_school_supplies": "อุปกรณ์สำนักงานและเครื่องเขียน", "automotive": "ยานยนต์",
    "pet_supplies": "สินค้าสัตว์เลี้ยง", "underwear_and_sleepwear": "ชุดชั้นในและชุดนอน",
    "appliances": "เครื่องใช้ไฟฟ้า", "tools_and_home_improvement": "เครื่องมือและซ่อมแซมบ้าน",
    "home_textile": "ผ้าและสิ่งทอในบ้าน", "sports_and_outdoors": "กีฬาและกิจกรรมกลางแจ้ง",
    "swimwear": "ชุดว่ายน้ำ", "home_and_kitchen": "ของใช้ในบ้านและครัว",
    "toys_and_games": "ของเล่นและเกม", "jewelry_and_accessories": "เครื่องประดับ",
    "curve": "เสื้อผ้าไซส์ใหญ่", "mens_clothes": "เสื้อผ้าบุรุษ",
}


def pretty(c):
    return c.replace("_", " ").replace(" and ", " & ").title()


def bins(col, edges, labels, ccol, k):
    cut = pd.cut(df[col], bins=edges, labels=labels, right=False)
    ct = pd.crosstab(cut, df[ccol]).reindex(labels).fillna(0).astype(int)
    out = []
    for lab in labels:
        row = {"range": lab}
        for cid in range(1, k + 1):
            row[f"C{cid}"] = int(ct.loc[lab, cid]) if cid in ct.columns else 0
        out.append(row)
    return out


by_k = {}
models, mappings = {}, {}   # เก็บโมเดลและการจับคู่กลุ่มของแต่ละ K ไว้ใช้ทำนาย/วาดกราฟ
for k in KS:
    ccol = f"c{k}"
    # --- เหมือนแลป: สร้างโมเดล -> fit -> predict ---
    kmean_model = KMeans(n_clusters=k, random_state=RNG, n_init=10)
    kmean_model.fit(Xs)
    y_kmeans = kmean_model.predict(Xs)
    models[k] = kmean_model
    raw = pd.Series(y_kmeans, index=df.index)
    mapping = make_mapping(k, raw)
    mappings[k] = mapping
    df[ccol] = raw.map(mapping).astype(int)
    inv = {v: kk for kk, v in mapping.items()}
    centroids = [kmean_model.cluster_centers_[inv[i]].tolist() for i in range(1, k + 1)]
    sil = None
    if k > 1:
        sil = round(float(silhouette_score(Xs, y_kmeans, sample_size=10000, random_state=RNG)), 4)

    clusters = []
    for cid in range(1, k + 1):
        g = df[df[ccol] == cid]
        name_th, name_en = auto_label(g)
        clusters.append({
            "id": cid,
            "autoName": name_en, "autoNameTh": name_th,
            "productCount": int(len(g)),
            "percentage": round(len(g) / n * 100, 1),
            "avgPrice": round(float(g.price_usd.mean()), 2),
            "avgDiscount": round(float(g.pct_discount.mean()), 1),
            "avgQuantitySold": round(float(g.qty_sold.mean()), 0),
            "avgSalesValue": round(float(g.sales_value.mean()), 2),
            "medianPrice": round(float(g.price_usd.median()), 2),
            "medianQuantitySold": round(float(g.qty_sold.median()), 0),
            "imputedQtyPct": round(float(g.qty_imputed.mean() * 100), 1),
        })

    distribution = {name: bins(col, edges, labels, ccol, k)
                    for name, (col, edges, labels) in BIN_DEFS.items()}

    cat_ct = pd.crosstab(df.category_name, df[ccol])
    cat_ct["total"] = cat_ct.sum(axis=1)
    cat_ct = cat_ct.sort_values("total", ascending=False)
    breakdown = []
    for cat, row in cat_ct.iterrows():
        item = {"name": pretty(cat), "nameTh": CAT_TH.get(cat, pretty(cat))}
        for cid in range(1, k + 1):
            item[f"C{cid}"] = int(row.get(cid, 0))
        breakdown.append(item)
    distribution["categoryBreakdown"] = breakdown

    by_k[str(k)] = {
        "clusterCount": k,
        "silhouette": sil,
        "testSilhouette": test_sil[k],
        "inertia": round(float(kmean_model.inertia_), 1),
        "daviesBouldin": round(float(davies_bouldin_score(Xs, y_kmeans)), 3),
        "nIter": int(kmean_model.n_iter_),
        "centroidsScaled": centroids,
        "clusters": clusters,
        "distribution": distribution,
    }
    print(f"K={k}: silhouette={sil}  sizes={[c['productCount'] for c in clusters]}")

# ------------------------------------------
# TRAIN / TEST EVALUATION (ทุกค่า K)
#   - fit StandardScaler + KMeans จาก Train เท่านั้น แล้ว predict Test (ไม่ fit ใหม่)
#   - จับคู่เลขกลุ่มให้ตรงกับโมเดลหลัก (Hungarian) เพื่อให้สี/เลขกลุ่มเหมือนกันทั้งเว็บ
#   - เก็บจุด scatter ของ Train/Test (แกน X = log(1+price), แกน Y = log(1+qty))
# ------------------------------------------
SCATTER_TRAIN, SCATTER_TEST = 1500, 600
rng_pts = np.random.default_rng(RNG)
train_test = {}
for k in KS:
    m = KMeans(n_clusters=k, random_state=RNG, n_init=10).fit(Xtr)
    ytr, yte = m.predict(Xtr), m.predict(Xte)

    # เทียบ centroid ของโมเดล Train กับโมเดลหลัก (สเกลเดียวกัน = scaler ของโมเดลหลัก)
    c_tt_log = m.cluster_centers_ * sc.scale_ + sc.mean_
    c_tt_main = (c_tt_log - scaler.mean_) / scaler.scale_
    c_main = np.array(by_k[str(k)]["centroidsScaled"])
    cost = ((c_tt_main[:, None, :] - c_main[None, :, :]) ** 2).sum(axis=2)
    r_idx, c_idx = linear_sum_assignment(cost)
    remap = {int(a): int(b) + 1 for a, b in zip(r_idx, c_idx)}
    ytr_m = np.array([remap[int(v)] for v in ytr])
    yte_m = np.array([remap[int(v)] for v in yte])

    def metrics(Xs_, y_raw, y_map):
        sil_ = float(silhouette_score(Xs_, y_raw, sample_size=min(10000, len(Xs_)), random_state=RNG))
        return {
            "size": int(len(Xs_)),
            "inertiaPerSample": round(float(-m.score(Xs_) / len(Xs_)), 4),
            "silhouette": round(sil_, 4),
            "daviesBouldin": round(float(davies_bouldin_score(Xs_, y_raw)), 4),
            "clusterShare": [round(float((y_map == c).mean() * 100), 2) for c in range(1, k + 1)],
        }

    tr_m, te_m = metrics(Xtr, ytr, ytr_m), metrics(Xte, yte, yte_m)
    gap = (te_m["inertiaPerSample"] - tr_m["inertiaPerSample"]) / tr_m["inertiaPerSample"] * 100

    centroids_log = [None] * k
    for raw_id, new_id in remap.items():
        centroids_log[new_id - 1] = [round(float(c_tt_log[raw_id][0]), 4), round(float(c_tt_log[raw_id][2]), 4)]

    def pts(X_, y_map, size):
        idx = rng_pts.choice(len(X_), size=min(len(X_), size), replace=False)
        return [[round(float(X_[i, 0]), 3), round(float(X_[i, 2]), 3), int(y_map[i])] for i in idx]

    train_test[str(k)] = {
        "train": tr_m,
        "test": te_m,
        "gapPct": round(float(gap), 2),
        "centroids": centroids_log,
        "trainPoints": pts(X_train, ytr_m, SCATTER_TRAIN),
        "testPoints": pts(X_test, yte_m, SCATTER_TEST),
    }
    print(f"K={k}: train inertia/n={tr_m['inertiaPerSample']}  test inertia/n={te_m['inertiaPerSample']}  gap={gap:.1f}%  "
          f"sil train={tr_m['silhouette']} test={te_m['silhouette']}")

# ------------------------------------------
# ตัวอย่างสินค้า + scatter (สุ่มแบบแบ่งชั้นตามกลุ่มของ DEFAULT_K)
# แต่ละรายการเก็บ clusterByK = กลุ่มของสินค้านั้นในทุกค่า K
# ------------------------------------------
dcol = f"c{DEFAULT_K}"
df["rankScore"] = (df.sales_value.rank(pct=True) * 100).round().clip(1, 100).astype(int)


def rid(r, i):
    return int(r["Unnamed: 0"]) if "Unnamed: 0" in r else i


def cluster_by_k(r):
    return {str(k): int(r[f"c{k}"]) for k in KS}


def to_product(r, i):
    cat = r.category_name
    title = str(r.product_title).strip()
    return {
        "id": f"PROD-{rid(r, i)}",
        "sku": f"{cat[:4].upper()}-{rid(r, i)}",
        "name": title, "nameTh": title,
        "category": pretty(cat),
        "categoryTh": CAT_TH.get(cat, pretty(cat)),
        "price": round(float(r.price_usd), 2),
        "discount": round(float(r.pct_discount), 0),
        "quantitySold": int(r.qty_sold),
        "salesValue": round(float(r.sales_value), 2),
        "cluster": int(r[dcol]),
        "clusterByK": cluster_by_k(r),
        "rankScore": int(r.rankScore),
        "qtyImputed": bool(r.qty_imputed),
    }


def union_sample(budget):
    """สุ่มสินค้าให้ทุกกลุ่มของทุกค่า K มีตัวอย่าง (กลุ่มละ ~budget/K) แล้วรวมกัน"""
    idx = set()
    for k in KS:
        quota = -(-budget // k)
        for c in range(1, k + 1):
            members = df.index[df[f"c{k}"] == c]
            take = min(len(members), quota)
            idx.update(pd.Series(members).sample(take, random_state=RNG).tolist())
    return df.loc[sorted(idx)]


sample = union_sample(400).sort_values("sales_value", ascending=False)
products = [to_product(r, i) for i, (_, r) in enumerate(sample.iterrows())]

scatter = []
for i, (_, r) in enumerate(union_sample(300).iterrows()):
    scatter.append({
        "id": f"S-{rid(r, i)}",
        "name": str(r.product_title)[:60],
        "price": round(float(r.price_usd), 2),
        "quantitySold": int(r.qty_sold),
        "discount": round(float(r.pct_discount), 0),
        "salesValue": round(float(r.sales_value), 2),
        "cluster": int(r[dcol]),
        "clusterByK": cluster_by_k(r),
        "category": pretty(r.category_name),
    })

# ------------------------------------------
# EXPORT
# ------------------------------------------
d = by_k[str(DEFAULT_K)]
out = {
    "defaultK": DEFAULT_K,
    "ks": KS,
    "stats": {
        "rawRows": raw_rows,
        "totalProducts": n,
        "droppedNoPrice": raw_rows - n,
        "avgPrice": round(float(df.price_usd.mean()), 2),
        "avgQuantitySold": round(float(df.qty_sold.mean()), 0),
        "qtyMedian": qty_median,
        "qtyImputed": qty_imputed,
        "qtyImputedPct": round(qty_imputed / n * 100, 1),
        "clusterCount": DEFAULT_K,
        "silhouette": d["silhouette"],
        "testSilhouette": d["testSilhouette"],
    },
    "model": {
        "features": FEATURES,
        "scalerMean": scaler.mean_.tolist(),
        "scalerScale": scaler.scale_.tolist(),
        "centroidsScaled": d["centroidsScaled"],
    },
    "clusters": d["clusters"],
    "elbow": elbow,
    "bestK": {
        "recommended": best_k,
        "silhouette": best_k_silhouette,
        "elbow": best_k_elbow,
        "method": "silhouette",
    },
    "distribution": d["distribution"],
    "byK": by_k,
    "trainTest": {"testSize": 0.20, "nTrain": int(len(Xtr)), "nTest": int(len(Xte)), "byK": train_test},
    "products": products,
    "scatter": scatter,
}

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"wrote {OUT_PATH}  ({OUT_PATH.stat().st_size/1024:.0f} KB)")


# ==========================================
# ทำนายสินค้าใหม่ (เหมือน new_input ในแลป)
#   new_input = [ราคา, ส่วนลด%, จำนวนที่ขาย]  ต้องผ่าน log1p + scale เหมือนตอนเทรน
# ==========================================
new_input = [10, 20, 500]
price_, disc_, qty_ = new_input
z_new = scaler.transform(np.log1p([[price_, disc_, qty_, price_ * qty_]]))
raw_pred = int(models[DEFAULT_K].predict(z_new)[0])
print(f"สินค้าใหม่ {new_input} (K={DEFAULT_K}) -> กลุ่มที่ {mappings[DEFAULT_K][raw_pred]}")

# ==========================================
# วาดกราฟ scatter + centroid (เหมือนแลป)
#   แกน X = log(1+ราคา), แกน Y = log(1+จำนวนที่ขาย)  สีตามกลุ่ม  ดาวสีแดง = centroid
# ==========================================
if plt is not None:
    plot_idx = np.random.default_rng(RNG).choice(n, size=min(n, 5000), replace=False)
    centroids = np.array(d["centroidsScaled"]) * scaler.scale_ + scaler.mean_   # แปลงกลับจากสเกล z เป็นสเกล log
    plt.figure(figsize=(8, 6))
    plt.scatter(X[plot_idx, 0], X[plot_idx, 2], c=df[dcol].to_numpy()[plot_idx], s=15, cmap="viridis")
    plt.scatter(centroids[:, 0], centroids[:, 2], c="red", s=150, marker="*", label="Centroids")
    plt.xlabel("log(1 + price_usd)")
    plt.ylabel("log(1 + qty_sold)")
    plt.title(f"K-Means Clustering of Products ({DEFAULT_K} Clusters)")
    plt.legend()
    plt.grid(True)
    (ROOT / "scripts").mkdir(exist_ok=True)
    plt.savefig(ROOT / "scripts" / "kmeans_plot.png", dpi=120, bbox_inches="tight")
    print("บันทึกกราฟที่ scripts/kmeans_plot.png")
    plt.show()   # ปิดหน้าต่างกราฟเพื่อจบโปรแกรม
else:
    print("ไม่ได้ติดตั้ง matplotlib จึงข้ามการวาดกราฟ (pip install matplotlib)")