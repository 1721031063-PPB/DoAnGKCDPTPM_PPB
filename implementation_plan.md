# 🌤️ SKYCAST AI — Tài Liệu Tổng Hợp Dự Án

> **Phiên bản:** 2.0 Full-Stack | **Cập nhật:** 29/03/2026 | **Framework:** Next.js 16.1.7

---

## 📐 Kiến Trúc Thư Mục

```
skycast-ai/
├── src/app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   ← NextAuth handler (login/session)
│   │   │   └── register/        ← Đăng ký tài khoản mới
│   │   ├── weather/             ← Thời tiết hiện tại + dự báo + hourly
│   │   ├── weather-summary/     ← Tóm tắt AI (GPT / Fallback)
│   │   ├── health/              ← AQI + phấn hoa
│   │   ├── geo-search/          ← Autocomplete địa danh
│   │   ├── favorites/           ← CRUD yêu thích (MongoDB)
│   │   └── ai-planner/          ← AI Cố Vấn chuyến đi (JSON Mode)
│   ├── auth/
│   │   ├── login/page.tsx       ← Trang đăng nhập (Glassmorphism)
│   │   └── register/page.tsx    ← Trang đăng ký
│   ├── components/
│   │   ├── WeatherDashboard.tsx ← Component chính (toàn bộ UI)
│   │   ├── HourlyChart.tsx      ← Biểu đồ Area Recharts (24h)
│   │   └── RainRadarMap.tsx     ← Bản đồ Leaflet radar mưa
│   ├── effects/
│   │   └── WeatherAtmosphere.js ← Hiệu ứng hạt mưa/mây/tuyết
│   ├── lib/
│   │   ├── mongoose.ts          ← Kết nối MongoDB singleton
│   │   ├── aiSummary.ts         ← Helper gọi weather-summary API
│   │   └── tripPlanner.ts       ← Thuật toán Trip Score nội bộ
│   ├── models/
│   │   └── User.ts              ← Mongoose Schema (User + Favorites)
│   ├── providers.tsx            ← NextAuth SessionProvider wrapper
│   └── layout.tsx               ← Root layout
```

---

## 🔧 Stack Công Nghệ

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **Next.js** | 16.1.7 | Framework Full-Stack (App Router) |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | 5.7 | Type safety |
| **Tailwind CSS** | 3.4.4 | Styling — Glassmorphism |
| **Framer Motion** | 11.0 | Animation & micro-interactions |
| **Mongoose** | 9.3 | MongoDB ODM |
| **NextAuth** | 4.24 | Authentication (JWT + Credentials) |
| **bcryptjs** | 3.0 | Mã hoá mật khẩu |
| **Recharts** | 3.8 | Biểu đồ Area Chart |
| **Leaflet / react-leaflet** | 1.9 / 5.0 | Bản đồ tương tác |
| **Lucide React** | 1.7 | Icon library |
| **OpenAI SDK** | 4.77 | Tích hợp GPT |

---

## 🌐 API Routes Chi Tiết

### `POST /api/weather`
- **Input:** `{ city: string }`
- **Output:** `{ current, forecast[], hourly[], lat, lon }`
- Tự tính UV Index từ mây + giờ trong ngày
- ✅ Dịch tự động 50+ mô tả Anh → Việt (`few clouds` → `Ít mây`)

### `POST /api/weather-summary`
- **Input:** `{ city, current, forecast[], health }`
- **Chính:** GPT-4o-mini trả đoạn văn tiếng Việt (~80 từ)
- **Fallback:** Tự sinh câu từ data thực khi OpenAI lỗi/hết quota

### `POST /api/ai-planner`
- **Input:** `{ activity, timeDescription, current, forecast }`
- **Output JSON cấu trúc:**
```json
{
  "score": 82,
  "outfit": ["Áo thun", "Kính râm", "Mũ lưỡi trai"],
  "bestTime": "Sáng sớm 6–8h",
  "advice": "Thời tiết lý tưởng, nên xuất phát sớm..."
}
```
- **Fallback:** Thuật toán tính điểm từ nhiệt độ + xác suất mưa

### `GET / POST / DELETE /api/favorites`
- Yêu cầu session NextAuth hợp lệ
- `GET` → danh sách yêu thích của user
- `POST { label, lat, lon }` → thêm địa điểm
- `DELETE ?label=...` → xoá địa điểm

### `POST /api/auth/register`
- Mã hoá mật khẩu bcrypt (10 rounds)
- Tự đăng nhập sau khi đăng ký thành công

### `GET/POST /api/auth/[...nextauth]`
- Strategy: JWT Session
- Provider: Credentials (email + password)
- Inject `user.id` vào JWT token

---

## 🗄️ Database — MongoDB

**Connection:** `mongodb://localhost:27017/skycast`

> MongoDB tự tạo database `skycast` và collection `users` khi có user đầu tiên đăng ký — không cần setup thủ công.

### Schema `User`
```typescript
{
  name: String,
  email: String,         // unique index
  password: String,      // bcrypt hash
  favorites: [{
    label: String,       // "Hội An, Vietnam"
    lat: Number,
    lon: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Giao Diện — WeatherDashboard

| Khu vực | Mô tả |
|---|---|
| **Header / Navbar** | Logo, nút Đăng nhập / Tên user / Đăng xuất |
| **Thanh tìm kiếm** | Autocomplete dropdown + Favorites Bar (khi đăng nhập) |
| **Card Thời tiết Hiện tại** | Nhiệt độ, icon Gió/Ẩm/UV, nút ⭐ Yêu thích, tóm tắt AI |
| **Dự báo 5 ngày** | Grid 5 card + Biểu đồ Area 24h (Recharts) |
| **AI Cố Vấn** | Input kế hoạch → Điểm, Trang phục, Giờ vàng, Lời khuyên |
| **Thông tin Sức khoẻ** | AQI, UV Index, Phấn hoa Cây/Cỏ, Cảnh báo |
| **Bản đồ Radar Mưa** | Leaflet + lớp mây RainViewer realtime |
| **Hiệu ứng Khí hậu** | Hạt mưa/mây/tuyết Framer Motion theo điều kiện thực |

### Gradient nền thay đổi theo giờ
| Khung giờ | Màu sắc |
|---|---|
| 5h–11h (Sáng) | Cam nhạt → Slate |
| 11h–16h (Trưa) | Vàng Amber → Sky |
| 16h–19h (Chiều tối) | Hồng/Rose → Indigo |
| 19h–5h (Đêm) | Slate đậm → Indigo thẫm |

---

## 🔑 Cấu Hình `.env.local`

```env
# Bắt buộc
NEXT_PUBLIC_OPENWEATHER_API_KEY=...
MONGODB_URI=mongodb://localhost:27017/skycast
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# Tuỳ chọn (app fallback nếu thiếu)
OPENAI_API_KEY=...
NEXT_PUBLIC_WAQI_TOKEN=...
NEXT_PUBLIC_AMBEE_API_KEY=...
```

---

## 🚀 Luồng Người Dùng (User Journey)

```
1. Vào trang → Glassmorphism UI + hiệu ứng khí quyển
2. Gõ thành phố → Autocomplete gợi ý địa danh
3. Chọn → Weather API trả dữ liệu thực, gradient nền cập nhật
4. AI tóm tắt thời tiết bằng tiếng Việt (hoặc fallback nội bộ)
5. Đăng ký / Đăng nhập → Bật tính năng Yêu thích
6. Bấm ⭐ → Lưu thành phố lên MongoDB
7. Favorites Bar xuất hiện → click chuyển thành phố nhanh
8. Nhập kế hoạch du lịch → AI trả: Điểm số + Trang phục + Giờ vàng
```

---

## ✅ Checklist Tính Năng Đã Hoàn Thành

- [x] Tra cứu thời tiết toàn cầu theo tên thành phố
- [x] Autocomplete địa danh (OpenWeatherMap Geo API)
- [x] Dự báo 5 ngày
- [x] Biểu đồ nhiệt độ 24h (Recharts Area Chart)
- [x] Chỉ số UV, AQI, Phấn hoa
- [x] Tóm tắt AI tiếng Việt + Fallback nội bộ
- [x] Bản đồ Radar mưa (Leaflet + RainViewer)
- [x] Hiệu ứng khí quyển động (Framer Motion)
- [x] Gradient nền thay đổi theo giờ
- [x] Đăng ký / Đăng nhập (NextAuth + MongoDB + bcrypt)
- [x] Lưu / Xoá địa điểm Yêu thích lên server
- [x] Favorites Bar chuyển đổi nhanh
- [x] AI Cố Vấn Chuyến Đi (JSON Mode, Trang phục + Giờ vàng)
- [x] Việt hóa 100% giao diện
- [x] Dịch mô tả thời tiết Anh → Việt (50+ cụm từ)

---

## 🔮 Đề Xuất Phát Triển Tiếp Theo

| Tính năng | Ưu tiên | Ghi chú |
|---|---|---|
| Push Notification khi có bão/mưa | 🔴 Cao | Web Push API |
| So sánh thời tiết 2 thành phố | 🟡 Trung bình | Side-by-side UI |
| Lịch sử thời tiết 30 ngày | 🟡 Trung bình | OpenWeather Historical |
| Widget nhúng cho website khác | 🟡 Trung bình | iframe/embed |
| Trang hồ sơ cá nhân (Profile) | 🟢 Thấp | Chỉnh tên, avatar |
| Dark / Light mode toggle | 🟢 Thấp | CSS variables |
| App mobile (React Native) | ⚪ Dài hạn | Tái sử dụng API |
