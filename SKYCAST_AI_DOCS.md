# 🌤️ SKYCAST AI — Kế Hoạch Tổng Hợp Dự Án v3.0

> **Phiên bản:** 3.1 Full-Stack + Advanced Features  
> **Cập nhật:** 02/04/2026  
> **GitHub:** [https://github.com/1721031063-PPB/DoAnGKCDPTPM_PPB.git](https://github.com/1721031063-PPB/DoAnGKCDPTPM_PPB.git)  
> **Framework:** Next.js 16.1.7 (App Router + Turbopack)  
> **Trạng thái:** ✅ Hoàn thành — 19/19 tính năng  
> **Database:** MongoDB (localhost:27017/skycast)  
> **Chạy dự án:** `npm run dev` → http://localhost:3000

---

## 📋 Mục Lục

1. [Tổng Quan Sản Phẩm](#1-tổng-quan-sản-phẩm)
2. [Stack Công Nghệ](#2-stack-công-nghệ)
3. [Kiến Trúc Thư Mục](#3-kiến-trúc-thư-mục)
4. [API Routes](#4-api-routes-chi-tiết)
5. [Database Schema](#5-database--mongodb)
6. [Giao Diện & Các Trang](#6-giao-diện--các-trang)
7. [Cấu Hình Môi Trường](#7-cấu-hình-môi-trường)
8. [Luồng Người Dùng](#8-luồng-người-dùng)
9. [Checklist Tính Năng](#9-checklist-tính-năng-đã-hoàn-thành)
10. [Quy Trình Phát Triển](#10-quy-trình-phát-triển-theo-giai-đoạn)
11. [Đề Xuất Phát Triển Tiếp Theo](#11-đề-xuất-phát-triển-tiếp-theo)

---

## 1. Tổng Quan Sản Phẩm

**SKYCAST AI** là ứng dụng web thời tiết thế hệ mới, kết hợp:  
- 🌡️ **Dữ liệu thời tiết thực** từ OpenWeatherMap (toàn cầu)  
- 🤖 **Trí tuệ nhân tạo** GPT-4o-mini (tóm tắt, cố vấn chuyến đi)  
- 📊 **Trực quan hóa dữ liệu** (Recharts, Leaflet)  
- 👤 **Hệ thống tài khoản** đầy đủ (NextAuth + MongoDB)  
- 🇻🇳 **100% tiếng Việt** — kể cả dịch tự động mô tả thời tiết

### Điểm mạnh nổi bật
| # | USP | Chi tiết |
|---|---|---|
| 1 | **Hoạt động dù không có OpenAI** | Fallback nội bộ tự sinh câu tiếng Việt từ data thực |
| 2 | **Lịch sử 30 ngày miễn phí** | Open-Meteo API — không cần API key, không giới hạn |
| 3 | **Nhúng được vào mọi website** | Widget iframe 3 theme (dark/light/minimal) |
| 4 | **Cảnh báo thông minh** | Push Notification giới hạn 1 lần/30 phút |
| 5 | **Việt hóa hoàn toàn** | 50+ mô tả thời tiết Anh → Việt tự động |

---

## 2. Stack Công Nghệ

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **Next.js** | 16.1.7 | Framework Full-Stack (App Router + Turbopack) |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | 5.7 | Type safety toàn dự án |
| **Tailwind CSS** | 3.4.4 | Styling — Glassmorphism design system |
| **Framer Motion** | 11.0 | Animation, hiệu ứng hạt khí hậu động |
| **MongoDB + Mongoose** | 9.3 | Database — Users, Favorites |
| **NextAuth** | 4.24 | Authentication (JWT + Credentials) |
| **bcryptjs** | 3.0 | Mã hoá mật khẩu (10 rounds) |
| **Recharts** | 3.8 | Area Chart (24h), Bar Chart (lượng mưa) |
| **Leaflet / react-leaflet** | 1.9 / 5.0 | Bản đồ radar mưa tương tác |
| **Lucide React** | 1.7 | Bộ icon toàn dự án |
| **OpenAI SDK** | 4.77 | GPT-4o-mini + JSON Mode |

### External APIs

| API | Mục đích | Miễn phí? |
|---|---|---|
| OpenWeatherMap | Thời tiết thực + Geo Search | ✅ Free tier |
| Open-Meteo | Lịch sử 30 ngày | ✅ Hoàn toàn miễn phí |
| RainViewer | Radar mưa (Leaflet layer) | ✅ Miễn phí |
| WAQI | AQI (chất lượng không khí) | ✅ Free token |
| Ambee | Phấn hoa (pollen data) | ✅ Free tier |
| OpenAI GPT-4o-mini | AI tóm tắt + Trip Planner | ❌ Tính phí (có Fallback) |

---

## 3. Kiến Trúc Thư Mục

```
skycast-ai/
├── public/                        ← [FRONTEND tĩnh] sw.js, images...
│
├── src/app/
│   │
│   ├── [ 🖥️ FRONTEND - CLIENT SIDE ] ──────────────────────
│   │   ├── favorites/             ← Trang quản lý địa điểm yêu thích
│   │   ├── compare/               ← Trang so sánh thời tiết
│   │   ├── widget/                ← Trang widget nhúng
│   │   ├── auth/                  ← Trang đăng nhập/đăng ký
│   │   ├── components/            ← Khối giao diện chính (Bản đồ, Biểu đồ...)
│   │   ├── effects/               ← Hiệu ứng hoạt họa (Framer Motion)
│   │   ├── providers.tsx          ← NextAuth SessionProvider wrapper
│   │   ├── layout.tsx             ← Root layout UI
│   │   └── page.tsx               ← Entry point trang chủ
│   │
│   ├── [ ⚙️ BACKEND - SERVER SIDE ] ───────────────────────
│   │   ├── api/                   ← API Routes (Node.js Serverless)
│   │   │   ├── auth/              ← Xử lý Session & mã hoá bcrypt
│   │   │   ├── weather/           ← Fetch API + Dịch tiếng Việt
│   │   │   ├── weather-summary/   ← OpenAI GPT + Fallback sinh tóm tắt
│   │   │   ├── ai-planner/        ← OpenAI JSON Mode + Fallback
│   │   │   ├── favorites/         ← MongoDB CRUD Endpoints
│   │   │   └── history/           ← Fetch Open-Meteo
│   │   │
│   │   ├── lib/                   ← Thư viện chạy ngầm trên Server
│   │   │   ├── mongoose.ts        ← Kết nối MongoDB an toàn
│   │   │   └── aiSummary.ts       ← Thuật toán Fallback AI
│   │   │
│   │   └── models/                ← Database Schema
│   │       └── User.ts            ← Mongoose Schema (Users & Favorites)
│
├── .env.local                     ← API keys & connection strings
├── .env.example                   ← Template cấu hình
├── SKYCAST_AI_DOCS.md             ← Tài liệu tổng hợp
├── PRODUCT_BRIEF.md               ← Bản tóm tắt sản phẩm
├── REPORT.html                    ← Báo cáo xuất PDF
└── package.json                   ← Dependencies
```

---

## 4. API Routes Chi Tiết

### `POST /api/weather`
**Mục đích:** Lấy toàn bộ dữ liệu thời tiết.  
**Input:** `{ city: string }`  
**Output:** `{ current, forecast[], hourly[], lat, lon }`  
**Đặc biệt:**
- Tự tính UV Index từ % mây che phủ và giờ trong ngày
- ✅ **Dịch tự động 50+ mô tả** Anh → Việt:
  - `"few clouds"` → `"Ít mây"`
  - `"thunderstorm"` → `"Dông"`
  - `"light rain"` → `"Mưa nhẹ"`
  - `"overcast clouds"` → `"Trời u ám"`  
  - _(xem đầy đủ trong `weatherDescriptionMap` tại route)_

---

### `POST /api/weather-summary`
**Mục đích:** Tóm tắt thời tiết bằng ngôn ngữ tự nhiên.  
**Input:** `{ city, current, forecast[], health }`  
**Luồng:**
```
OpenAI GPT-4o-mini (nếu có API key)
    ↓ (lỗi/quota)
generateFallbackSummary() — tự sinh câu từ data thực
```
**Fallback** đảm bảo app không bao giờ crash vì OpenAI.

---

### `POST /api/ai-planner`
**Mục đích:** AI Cố Vấn Du Lịch dựa trên thời tiết thực.  
**Input:** `{ activity, timeDescription, current, forecast }`  
**Output JSON cấu trúc:**
```json
{
  "score": 85,
  "outfit": ["Áo thun", "Mũ lưỡi trai", "Kính râm"],
  "bestTime": "Sáng sớm 6–8h",
  "advice": "Thời tiết lý tưởng cho chuyến đi, nên xuất phát trước 10h..."
}
```
**Fallback:** Thuật toán tính điểm từ nhiệt độ (gần 25°C = tốt) + xác suất mưa.

---

### `GET / POST / DELETE /api/favorites`
**Yêu cầu:** NextAuth Session hợp lệ (401 nếu chưa đăng nhập).  
- `GET` → Danh sách yêu thích của user hiện tại
- `POST { label, lat, lon }` → Thêm vào MongoDB
- `DELETE ?label=...` → Xoá khỏi MongoDB

---

### `POST /api/history`
**Nguồn:** [Open-Meteo](https://open-meteo.com/) — **Hoàn toàn miễn phí, không cần API key**.  
**Input:** `{ lat, lon }`  
**Output:** Mảng 30 object `{ date, maxTemp, minTemp, precipitation }`  
_(Số liệu từ 30 ngày trước đến hôm qua)_

---

### `POST /api/auth/register`
- Kiểm tra email trùng lặp → Hash bcrypt (10 rounds) → Lưu MongoDB

### `GET/POST /api/auth/[...nextauth]`
- Strategy: **JWT** | Provider: **Credentials** (email + password)
- Inject `user.id` vào JWT token qua callback

---

## 5. Database — MongoDB

**Kết nối:** `mongodb://localhost:27017/skycast`

> 💡 MongoDB **tự tạo** database `skycast` và collection `users` khi user đầu tiên đăng ký. Không cần setup thủ công.

### Schema `User`
```typescript
{
  name:      String,          // Tên hiển thị
  email:     String,          // unique index
  password:  String,          // bcrypt hash — không lưu plain text
  favorites: [{               // Embedded array — không tách collection
    label:   String,          // VD: "Hội An, Quảng Nam, Vietnam"
    lat:     Number,
    lon:     Number,
  }],
  createdAt: Date,            // timestamps: true (tự động)
  updatedAt: Date,
}
```

---

## 6. Giao Diện & Các Trang

### 📍 Trang chủ — `localhost:3000`

| Khu vực UI | Mô tả |
|---|---|
| **Header / Navbar** | Logo SKYCAST AI, link ⭐ Yêu thích / ⇄ So sánh / 🧩 Widget, Auth |
| **Thanh tìm kiếm** | Autocomplete dropdown 5 gợi ý địa điểm |
| **Card Thời tiết Hiện tại** | Nhiệt độ, mô tả VN, icon Gió/Ẩm/UV, ⭐ Yêu thích, 🔔 Cảnh báo, tóm tắt AI |
| **Dự báo 5 ngày** | Grid 5 card + Biểu đồ Area nhiệt độ 24h (Recharts) |
| **AI Cố Vấn Chuyến Đi** | Input kế hoạch → Điểm số, Trang phục, Giờ vàng, Lời khuyên AI |
| **Thông tin Sức khoẻ** | AQI, UV Index, Phấn hoa Cây/Cỏ, Cảnh báo theo mức độ |
| **Bản đồ Radar Mưa** | Leaflet interactive + lớp mây RainViewer realtime |
| **Lịch sử 30 ngày** | 2 tab: 🌡️ Nhiệt độ Area / 🌧️ Lượng mưa Bar + 4 stat cards |
| **Hiệu ứng Khí hậu** | Hạt mưa/mây/tuyết Framer Motion theo điều kiện thực |

**Gradient nền thay đổi theo 4 khung giờ:**

| Giờ | Màu sắc | Ý nghĩa |
|---|---|---|
| 5h–11h | Cam nhạt → Slate | Bình minh / Sáng sớm |
| 11h–16h | Vàng Amber → Sky | Ban trưa |
| 16h–19h | Hồng/Rose → Indigo | Hoàng hôn |
| 19h–5h | Slate đậm → Indigo thẫm | Đêm khuya |

---

### ⚖️ Trang So Sánh — `localhost:3000/compare`
- Nhập 2 thành phố bất kỳ, so sánh song song: nhiệt độ, ẩm, gió, UV, dự báo 3 ngày
- Bảng **"Kết Quả"** chỉ thành phố thắng theo 4 tiêu chí tự động
- Truy cập từ link **"⇄ So sánh"** trên Navbar

### ⭐ Trang Yêu Thích — `localhost:3000/favorites`
- Cung cấp giao diện lưới trực quan để quản lý các địa điểm đã lưu.
- Cho phép xem nhanh thông tin tóm tắt và xóa các địa điểm.
- Truy cập thông qua link **"⭐ Yêu thích"** trên Navbar.

### 🧩 Widget Nhúng — `localhost:3000/widget`
```html
<iframe src="http://your-domain/widget?city=Hanoi&theme=dark"
        width="280" height="210" frameborder="0"></iframe>
```
| Param | Giá trị | Mô tả |
|---|---|---|
| `city` | Tên thành phố | VD: `Hanoi`, `Ho+Chi+Minh+City` |
| `theme` | `dark` / `light` / `minimal` | 3 giao diện khác nhau |

### 🔐 Auth Pages
- `/auth/login` — Form đăng nhập Glassmorphism
- `/auth/register` — Đăng ký, tự động đăng nhập sau khi xong

---

## 7. Cấu Hình Môi Trường

**File:** `.env.local` (tạo từ `.env.example`)

```env
# ── BẮT BUỘC ─────────────────────────────────────────────
NEXT_PUBLIC_OPENWEATHER_API_KEY=...   # openweathermap.org — Free tier
MONGODB_URI=mongodb://localhost:27017/skycast
NEXTAUTH_SECRET=chuoi_bi_mat_bat_ky_bat_ky
NEXTAUTH_URL=http://localhost:3000

# ── TUỲ CHỌN (App hoạt động đầy đủ kể cả khi thiếu) ─────
OPENAI_API_KEY=...                    # GPT-4o-mini (có Fallback nội bộ)
NEXT_PUBLIC_WAQI_TOKEN=...            # Chất lượng không khí AQI
NEXT_PUBLIC_AMBEE_API_KEY=...         # Phấn hoa (Pollen)
```

> ⚠️ **Quan trọng:** `OPENAI_API_KEY` là **tuỳ chọn**. Khi thiếu hoặc hết quota, cả `weather-summary` lẫn `ai-planner` đều tự động chuyển sang **thuật toán Fallback nội bộ** — app không bao giờ bị crash.

---

## 8. Luồng Người Dùng

```
① Vào trang → Glassmorphism UI + hiệu ứng hạt khí hậu động
② Gõ thành phố → Autocomplete hiện 5 gợi ý địa danh
③ Chọn thành phố → Weather API lấy data, gradient nền cập nhật
④ AI tóm tắt ~80 từ tiếng Việt xuất hiện trong Card chính
⑤ Biểu đồ Area 24h hiện bên dưới Dự báo 5 ngày
⑥ Lịch sử 30 ngày (Open-Meteo) tải ngầm, hiện ở cuối trang
⑦ Bấm 🔔 → Trình duyệt xin quyền → Cảnh báo tự động khi bão/mưa
⑧ Đăng ký / Đăng nhập → Bật tính năng Yêu thích
⑨ Click ⭐ → Lưu vào MongoDB, quản lý tại trang /favorites chuyên biệt
⑩ Nhập kế hoạch → AI trả: Điểm + Trang phục + Giờ vàng + Lời khuyên
⑪ Click ⇄ So sánh → Trang so sánh song song 2 thành phố
⑫ Click 🧩 Widget → Xem widget, copy code iframe nhúng
```

---

## 9. Checklist Tính Năng Đã Hoàn Thành

### 🌤️ Core Weather (9/9)
- [x] Tra cứu thời tiết toàn cầu theo tên thành phố
- [x] Autocomplete địa danh (OpenWeatherMap Geo API)
- [x] **Dịch tự động 50+ mô tả** thời tiết Anh → Việt
- [x] Dự báo 5 ngày
- [x] Biểu đồ nhiệt độ 24h — Recharts Area Chart
- [x] Chỉ số UV Index, AQI, Phấn hoa Cây/Cỏ
- [x] Bản đồ Đa Lớp (6 lớp: Radar, Nhiệt độ, Gió, Mây, Áp suất, Lượng mưa)
- [x] Hiệu ứng khí quyển động (Framer Motion)
- [x] Gradient nền thay đổi theo 4 khung giờ

### 🤖 AI & Phân Tích (3/3)
- [x] Tóm tắt AI tiếng Việt — GPT-4o-mini + Fallback nội bộ
- [x] AI Cố Vấn Chuyến Đi — JSON Mode: Điểm, Trang phục, Giờ vàng
- [x] Lịch sử 30 ngày miễn phí — Open-Meteo, Area + Bar Chart

### 👤 Full-Stack & Auth (3/3)
- [x] Hệ thống tài khoản — NextAuth + MongoDB + bcrypt
- [x] Lưu / Xoá địa điểm Yêu thích lên MongoDB
- [x] Trang /favorites chuyên biệt để quản lý các địa điểm đã lưu

### ⭐ Tính năng Cao Cấp (4/4)
- [x] **Push Notification** cảnh báo mưa/bão (Service Worker)
- [x] **So sánh 2 thành phố** song song — trang `/compare`
- [x] **Widget nhúng iframe** 3 theme — trang `/widget`
- [x] Việt hóa 100% toàn bộ giao diện

---

## 10. Quy Trình Phát Triển Theo Giai Đoạn

### Giai đoạn 1 — Nền tảng UI/UX
> **Thành quả:** Khung giao diện hoàn chỉnh, tích hợp API thời tiết cơ bản

- Thiết kế Glassmorphism với Tailwind CSS
- Tích hợp OpenWeatherMap API (thời tiết + dự báo)
- Xây dựng `WeatherDashboard` component (~300 dòng)
- Radar mưa `RainRadarMap` với Leaflet + RainViewer
- Hiệu ứng `WeatherAtmosphere` (Framer Motion)
- Gradient nền động theo giờ
- Autocomplete địa danh (Geo API)

### Giai đoạn 2 — Backend & Authentication
> **Thành quả:** Hệ thống tài khoản đầy đủ + MongoDB

- Kết nối MongoDB với Singleton Pattern (`lib/mongoose.ts`)
- Mongoose Schema `User` với embedded `favorites[]`
- Cài đặt NextAuth v4 (JWT + Credentials Provider)
- Mã hoá bcrypt 10 rounds
- Trang Login/Register Glassmorphism (`/auth/...`)
- `SessionProvider` wrapper toàn ứng dụng

### Giai đoạn 3 — Favorites, Biểu đồ & Việt hóa
> **Thành quả:** Tính năng đăng nhập thực sự có ý nghĩa

- API CRUD Favorites (`GET/POST/DELETE /api/favorites`)
- Nút ⭐ Yêu thích + Trang Quản lý Favorites riêng biệt
- `HourlyChart.tsx` — Recharts Area Chart 24h
- Bảng dịch 50+ mô tả thời tiết Anh → Việt
- Bổ sung Lucide icons cho toàn bộ widget
- Việt hóa 100% giao diện Dashboard

### Giai đoạn 4 — AI Nâng cao & Fallback
> **Thành quả:** AI hoạt động ổn định bất kể trạng thái OpenAI

- GPT-4o-mini **JSON Mode** cho AI Planner
- API `/api/ai-planner` mới (thay tripPlanner cũ)
- Viết lại `weather-summary` dùng fetch thuần (bỏ SDK)
- `generateFallbackSummary()` sinh câu từ data thực
- Fallback thuật toán cho cả 2 AI endpoint
- Giao diện AI Planner mới: Điểm / Trang phục / Giờ vàng

### Giai đoạn 5 — Advanced Features
> **Thành quả:** 4 tính năng cao cấp nâng tầm sản phẩm

- **Push Notification**: `sw.js` Service Worker + `NotificationToggle.tsx`, giới hạn 1/30 phút
- **Lịch sử 30 ngày**: API `/api/history` Open-Meteo + `WeatherHistory.tsx` 2 tab biểu đồ
- **So sánh 2 thành phố**: `/compare/page.tsx` side-by-side + bảng kết quả
- **Widget nhúng**: `/widget/page.tsx` 3 theme, hỗ trợ iframe
- Cập nhật Navbar với link So sánh / Widget
- Tích hợp `NotificationToggle` và `WeatherHistory` vào Dashboard

---

## 11. Đề Xuất Phát Triển Tiếp Theo

### 🔴 Ưu tiên Cao

#### 11.1 — Web Push Notification Server-Side (Thực thụ)
**Vấn đề hiện tại:** Push Notification hiện chỉ là client-side (cần tab đang mở).  
**Đề xuất:**
- Cài `web-push` package
- Lưu `PushSubscription` vào MongoDB theo từng User
- Cron job (Vercel Cron / node-cron) kiểm tra thời tiết mỗi 30 phút
- Gửi push đến tất cả users đang subscribe khi phát hiện dông/bão
```
MONGODB: subscriptions[] trong User schema
API: POST /api/push/subscribe | POST /api/push/unsubscribe
CRON: /api/cron/weather-check (chạy mỗi 30 phút)
```

#### 11.2 — Trang Profile Người Dùng
**Đề xuất trang `/profile`:**
- Thay đổi tên hiển thị
- Đổi mật khẩu (cần xác nhận mật khẩu cũ)
- Xem danh sách Yêu thích dưới dạng bảng
- Thống kê: thành phố hay tra nhất, số lần đăng nhập

#### 11.3 — UV Index Chính Xác
**Vấn đề:** Hiện tính UV gần đúng từ mây + giờ (không chính xác).  
**Giải pháp:** Nâng cấp lên OpenWeather **OneCall API v3** để lấy UV Index thực tế từ vệ tinh.

---

### 🟡 Ưu tiên Trung Bình

#### 11.4 — Dark / Light Mode Toggle
- Thêm toggle button trên Navbar
- Dùng CSS variables (HSL) cho tất cả màu sắc
- Lưu preference vào `localStorage`
- Hỗ trợ `prefers-color-scheme` tự động

#### 11.5 — Chia Sẻ Kết Quả (Share Weather)
- Nút **"Chia sẻ"** trên Card thời tiết
- Tạo **OG Image** động (Next.js `ImageResponse`)
- Copy link dạng: `skycast-ai.app/share?city=HCM&date=2026-03-29`
- Tích hợp nút chia sẻ Facebook, Twitter, Zalo

#### 11.6 — Tìm Kiếm Bằng GPS Tự Động
- Nút **"Vị trí hiện tại"** → `navigator.geolocation`
- Reverse geocoding: tọa độ → tên thành phố
- Tự động tra thời tiết vị trí hiện tại khi vào trang lần đầu

#### 11.7 — So Sánh Nâng Cao
**Mở rộng trang `/compare`:**
- Thêm biểu đồ Recharts so sánh nhiệt độ 2 thành phố theo giờ
- Export kết quả so sánh ra ảnh/PDF
- Lưu lịch sử các cặp đã so sánh (nếu đã login)

---

### 🟢 Ưu tiên Thấp

#### 11.8 — Progressive Web App (PWA)
- Thêm `manifest.json` với icon đầy đủ
- Cache chiến lược với Service Worker
- Cài đặt như app trên điện thoại (Add to Home Screen)
- Hoạt động offline với data cache lần trước

#### 11.9 — Đa Ngôn Ngữ (i18n)
- Hỗ trợ chuyển đổi Tiếng Việt ↔ English
- Dùng `next-intl` hoặc `react-i18next`
- Bộ từ điển JSON riêng cho từng ngôn ngữ

#### 11.10 — Thống Kê Cá Nhân (Personal Analytics)
Trang Dashboard riêng sau khi đăng nhập:
- Biểu đồ các thành phố hay tra theo tần suất
- Thời gian trung bình sử dụng app
- Lịch sử tra cứu 7 ngày gần nhất

---

### ⚪ Dài Hạn

#### 11.11 — Ứng Dụng Mobile (React Native)
- Tái sử dụng toàn bộ API Backend (Next.js API Routes)
- UI riêng cho mobile với React Native Paper
- Tích hợp Native Push Notification (iOS/Android)
- Deploy lên App Store + Google Play

#### 11.12 — Marketplace Widget
- Trang `/marketplace` cho developers chọn widget muốn nhúng
- Nhiều loại widget: mini, compact, full, dark ticker
- Tạo code snippet copy-paste tự động
- Analytics: đếm lượt embed

#### 11.13 — API Công Khai (Public API)
- Expose `/api/v1/weather?city=...` với API key authentication
- Rate limiting per key
- Dashboard quản lý usage
- Cho phép developer bên ngoài sử dụng

---

## 📊 Roadmap Tổng Thể

```
2026 Q1 (Đã hoàn thành) ──────────────────────────────────────
  ✅ MVP → Full-Stack với Auth + MongoDB
  ✅ AI Integration (GPT-4o-mini + Fallback)
  ✅ 4 Advanced Features (Push, History, Compare, Widget)
  ✅ Việt hóa 100%

2026 Q2 (Đề xuất tiếp theo) ──────────────────────────────────
  🔴 Server-side Push Notification thực thụ
  🔴 Trang Profile người dùng
  🔴 UV Index chính xác (OneCall API v3)
  🟡 Dark/Light Mode toggle
  🟡 Chia sẻ kết quả (Share + OG Image)

2026 Q3 ──────────────────────────────────────────────────────
  🟡 Tìm kiếm bằng GPS tự động
  🟡 So sánh nâng cao (biểu đồ, export)
  🟢 PWA (Progressive Web App)
  🟢 i18n (Tiếng Việt ↔ English)

2026 Q4+ ─────────────────────────────────────────────────────
  ⚪ React Native mobile app
  ⚪ Widget Marketplace cho developers
  ⚪ Public API với key management
```
