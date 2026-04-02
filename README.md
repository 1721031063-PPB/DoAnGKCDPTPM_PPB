# 🌤️ SKYCAST AI — Your Smart Weather Companion

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/1721031063-PPB/DoAnGiuaKy.git)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Powered-47A248?logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/AI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)

**SKYCAST AI** là ứng dụng dự báo thời tiết thông minh thế hệ mới, kết hợp sức mạnh của Trí tuệ nhân tạo (Generative AI) để biến những con số khí tượng thành lời khuyên hữu ích cho cuộc sống hàng ngày.

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 🤖 Trí Tuệ Nhân Tạo (AI-Powered)
- **Tóm tắt AI (Weather Summary):** GPT-4o-mini tóm tắt tình hình thời tiết trong ~80 từ tiếng Việt cực kỳ dễ hiểu.
- **Cố vấn Chuyến đi (AI Trip Planner):** Phân tích kế hoạch của bạn để đưa ra điểm số an toàn, gợi ý trang phục và khung giờ vàng xuất phát.
- **Smart Fallback:** Hệ thống tự động chuyển sang thuật toán nội bộ khi API OpenAI gặp sự cố, đảm bảo app luôn hoạt động 24/7.

### 📊 Trực Quan Hóa Dữ Liệu (Data Visualization)
- **Bản đồ Radar 6 lớp:** Tương tác với các lớp dữ liệu: Radar mưa, Nhiệt độ, Gió, Mây, Áp suất và Lượng mưa.
- **Biểu đồ Hourly:** Theo dõi biến động nhiệt độ 24h qua biểu đồ Area trực quan.
- **Lịch sử 30 ngày:** Phân tích dữ liệu lịch sử nhiệt độ và lượng mưa (Open-Meteo).

### 👤 Cá Nhân Hóa (Personalization)
- **Hệ thống Tài khoản:** Đăng ký/Đăng nhập bảo mật với NextAuth & bcrypt.
- **Địa điểm Yêu thích:** Lưu và quản lý các địa điểm quan tâm trực tiếp trên Cloud (MongoDB).
- **Trang Favorites:** Giao diện quản lý riêng biệt cho các địa điểm đã lưu.

### 🧩 Tiện Ích Mở Rộng (Advanced Features)
- **So sánh Song song:** So sánh thời tiết giữa 2 thành phố bất kỳ để đưa ra lựa chọn tốt nhất.
- **Widget Nhúng:** Cung cấp iframe với 3 theme màu sắc để nhúng vào website cá nhân của bạn.
- **Push Notification:** Cảnh báo mưa bão ngay lập tức qua trình duyệt (Service Worker).

---

## 🛠️ Stack Công Nghệ (Tech Stack)

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS (Glassmorphism), Framer Motion (Hiệu ứng khí hậu động).
- **Backend:** Next.js API Routes (Node.js).
- **Database:** MongoDB & Mongoose.
- **Authentication:** NextAuth.js (JWT & Credentials).
- **APIs:** OpenWeatherMap, Open-Meteo, RainViewer, OpenAI GPT-4o-mini.

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
