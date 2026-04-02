# BÁO CÁO TỔNG KẾT DỰ ÁN CUỐI KỲ

**Họ và tên:** Phạm Phước Bình  
**MSSV:** 1721031063  
**Môn học:** Chuyên Đề Phát Triển Phần Mềm  
**Ngày nộp:** 02/04/2026  

---

# 🌤️ SKYCAST AI — Trợ Lý Thời Tiết Thông Minh (v3.1)

> **GitHub:** [https://github.com/1721031063-PPB/DoAnGKCDPTPM_PPB](https://github.com/1721031063-PPB/DoAnGKCDPTPM_PPB)  
> **Video Demo:** [https://youtu.be/V6vfWKGXHR0](https://youtu.be/V6vfWKGXHR0)  

---

## 1. MÔ TẢ SẢN PHẨM

**SKYCAST AI** là ứng dụng dự báo thời tiết Full-Stack thế hệ mới, kết hợp dữ liệu khí tượng thực tế với Trí tuệ nhân tạo tạo sinh (AI — GPT-4o-mini). Sản phẩm giúp người dùng Việt Nam không chỉ theo dõi thời tiết mà còn nhận được những lời khuyên thực tế, thân thiện bằng tiếng Việt để lên kế hoạch cuộc sống hiệu quả hơn.

### 📊 Chỉ Số Thành Tựu
| Chỉ số | Kết quả |
| :--- | :--- |
| Tính năng hoàn thành | **19 / 19** |
| API Routes Server-side | **11 Endpoints** |
| Độ phủ Việt hóa | **100%** |
| Framework | **Next.js 16 (App Router)** |
| Database | **MongoDB Atlas Cloud** |

---

## 2. VẤN ĐỀ & GIẢI PHÁP

| ❌ Vấn đề | ✅ Giải pháp SKYCAST AI |
| :--- | :--- |
| Số liệu UV, AQI... khô khan, khó hiểu. | **AI Summary:** GPT-4o-mini tóm tắt tiếng Việt ~80 từ. |
| Không biết mặc gì, đi lúc nào cho hợp lý. | **AI Planner:** Cố vấn trang phục & Giờ vàng xuất phát. |
| Lỗi app khi AI API quá tải hoặc lỗi. | **Smart Fallback:** Thuật toán nội bộ tự sinh nội dung. |
| Mất danh sách yêu thích khi đổi thiết bị. | **Cloud Persistence:** MongoDB lưu Favorites theo tài khoản. |
| Dữ liệu lịch sử 30 ngày thường tốn phí. | **Open-Meteo:** Cung cấp lịch sử 30 ngày miễn phí. |
| Bỏ lỡ cảnh báo khi không mở ứng dụng. | **Web Push:** Thông báo đẩy chủ động qua Service Worker. |

---

## 3. CÁCH THỰC HIỆN — QUY TRÌNH PHÁT TRIỂN

Dự án được triển khai qua **5 Sprint Agile** (6 tuần):

- **Sprint 1 — Khởi tạo:** Next.js 16, Glassmorphism UI, OpenWeatherMap API & Việt hóa 50+ mô tả.
- **Sprint 2 — Bảo mật:** MongoDB Atlas, NextAuth.js, bcrypt mã hóa mật khẩu, trang Auth chuyên nghiệp.
- **Sprint 3 — Trực quan hóa:** Recharts biểu đồ 24h, Leaflet bản đồ 6 lớp, Open-Meteo lịch sử 30 ngày.
- **Sprint 4 — Trí não AI:** Tích hợp GPT-4o-mini, xây dựng hệ thống **Smart Fallback** đảm bảo uptime 100%.
- **Sprint 5 — Hệ sinh thái:** Trang Favorites, Compare, Widget nhúng iframe và Web Push Notification.

---

## 4. KẾT QUẢ ĐẠT ĐƯỢC (CHECKLIST 19/19)

- [x] Tra cứu thời tiết toàn cầu & Autocomplete địa danh.
- [x] Dự báo 5 ngày & Biểu đồ nhiệt độ Area Chart 24h.
- [x] **Tóm tắt AI tiếng Việt** (GPT-4o-mini + Fallback nội bộ).
- [x] **AI Cố Vấn Chuyến Đi** — Chấm điểm an toàn, trang phục, giờ vàng.
- [x] Bản đồ 6 lớp dữ liệu thời tiết tương tác (Radar mây, Nhiệt độ, Gió...).
- [x] Lịch sử 30 ngày & Biểu đồ Recharts chuyên sâu.
- [x] Đăng ký / Đăng nhập bảo mật (NextAuth + bcrypt + MongoDB).
- [x] **Trang Quản lý Yêu Thích** riêng biệt (`/favorites`).
- [x] **Thông báo đẩy (Push)** cảnh báo thời tiết xấu chủ động.
- [x] Chế độ **So sánh 2 thành phố** song song chuyên nghiệp.
- [x] **Widget nhúng Iframe** 3 theme màu sắc cho nhà phát triển.
- [x] Việt hóa 100% toàn bộ giao diện và dữ liệu API.
- [x] Thiết kế Glassmorphism & atmosphere effects (Rain, Snow, Clouds).
- [x] Tối ưu Responsive (Mobile → Desktop 4K).
- [x] 11 API Routes server-side & Cloud Database.

---

## 5. GIỚI HẠN & HƯỚNG PHÁT TRIỂN TIẾP THEO

### Giới hạn
- Web Push hiện đang là Client-side, cần nâng cấp Server-side Web-push Protocol + Cron job.
- UV Index cần bản OneCall v3 để có dữ liệu vệ tinh chính xác hơn.

### Roadmap (v3.2 - v4.0)
- **v3.2:** Server-side Push Notification + Vercel Cron.
- **v3.4:** Phát triển ứng dụng Mobile (React Native).
- **v4.0:** AI tự huấn luyện dự báo cục bộ tại Việt Nam.

---

**KẾT LUẬN:** Dự án đã hoàn thành vượt mục tiêu đề ra, mang lại một sản phẩm thời tiết hiện đại, ổn định và lấy AI làm trọng tâm trải nghiệm cho người dùng Việt Nam.

---
*Phạm Phước Bình — MSSV: 1721031063 — April 2026*
