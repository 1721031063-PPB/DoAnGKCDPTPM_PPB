# 🌤️ SKYCAST AI — Your Smart Weather Companion

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/1721031063-PPB/DoAnGiuaKy.git)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Powered-47A248?logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/AI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)

**SKYCAST AI** là ứng dụng dự báo thời tiết thông minh thế hệ mới, kết hợp sức mạnh của Trí tuệ nhân tạo (Generative AI) để biến những con số khí tượng thành lời khuyên hữu ích cho cuộc sống hàng ngày.

---

## ✨ Tính Năng Dự Án (Project Features)

### 🖥️ Frontend (Giao diện người dùng)
- **Glassmorphism UI:** Thiết kế hiện đại, mượt mà với hiệu ứng làm mờ và trong suốt.
- **Atmosphere Effects:** Hiệu ứng mưa, tuyết, mây động theo điều kiện thời tiết thực tế (Framer Motion).
- **Interactive Maps:** Bản đồ radar 6 lớp (Rain, Temp, Wind, Clouds, Pressure, Radar) tích hợp Leaflet.
- **Data Visualization:** Biểu đồ nhiệt độ 24h và lịch sử 30 ngày trực quan (Recharts).
- **Responsive Design:** Tối ưu hóa trải nghiệm trên mọi thiết bị (Mobile, Tablet, Desktop).
- **Push Notifications:** Cảnh báo thời tiết xấu trực tiếp trên trình duyệt qua Service Worker.
- **Embedded Widgets:** Cung cấp iframe với 3 theme màu sắc để nhúng vào website khác.

### ⚙️ Backend (Xử lý hệ thống)
- **AI Integration:** Tích hợp GPT-4o-mini để tóm tắt thời tiết và cố vấn lịch trình chuyến đi.
- **Smart Fallback:** Hệ thống tự động chuyển sang thuật toán nội bộ khi OpenAI lỗi hoặc hết quota.
- **Authentication:** Hệ thống đăng ký/đăng nhập bảo mật với NextAuth.js và mã hóa bcrypt.
- **Database Management:** Lưu trữ và quản lý danh sách địa điểm yêu thích (Favorites) trên MongoDB.
- **Multi-API Orchestration:** Kết nối đồng bộ nhiều nguồn dữ liệu (OpenWeatherMap, Open-Meteo, WAQI, Ambee).
- **Localization:** Tự động dịch và chuẩn hóa dữ liệu thời tiết sang tiếng Việt 100%.

---

## 🛠️ Stack Công Nghệ (Tech Stack)

### 🎨 Frontend Stack
- **Framework:** Next.js 16 (App Router), React 19.
- **Language:** TypeScript (Type-safe).
- **Styling:** Tailwind CSS.
- **Animations:** Framer Motion.
- **Charts:** Recharts.
- **Maps:** Leaflet & React-Leaflet.

### 🔌 Backend Stack
- **Runtime:** Node.js (Next.js API Routes).
- **Database:** MongoDB & Mongoose.
- **Auth:** NextAuth.js (JWT Strategy).
- **Security:** bcryptjs (Mã hóa mật khẩu).
- **AI:** OpenAI SDK (GPT-4o-mini).
- **External APIs:** OpenWeatherMap, Open-Meteo, RainViewer, WAQI, Ambee.

---

## 🚀 Khởi Chạy Dự Án (Quick Start)

### 1. Clone dự án
```bash
git clone https://github.com/1721031063-PPB/DoAnGiuaKy.git
cd skycast-ai
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env.local` và điền các thông tin cần thiết:
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key
MONGODB_URI=mongodb://localhost:27017/skycast
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Tùy chọn
OPENAI_API_KEY=your_openai_key
```

### 4. Chạy chế độ phát triển
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 📂 Cấu Trúc Thư Mục (Project Structure)
```text
src/app/
├── api/             # API Routes xử lý logic backend
├── auth/            # Trang đăng nhập & đăng ký
├── components/      # Các thành phần UI (Charts, Maps, Dashboard)
├── favorites/       # Trang quản lý địa điểm yêu thích
├── compare/         # Trang so sánh thời tiết
├── widget/          # Trang widget nhúng
├── lib/             # Các hàm tiện ích & AI Fallback
└── models/          # Mongoose Schemas (User, Favorites)
```

---

## 📝 Giấy Phép & Tác Giả
- **Tác giả:** Phạm Phước Bình (MSSV: 1721031063)
- **Đồ án:** Chuyên Đề Phát Triển Phần Mềm (2026)

---
*Dự án được xây dựng với mục tiêu mang lại trải nghiệm thời tiết tốt nhất cho người dùng Việt Nam.*
