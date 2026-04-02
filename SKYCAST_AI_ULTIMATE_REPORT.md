# SKYCAST AI — BÁO CÁO TỔNG HỢP DỰ ÁN (ULTIMATE REPORT)

**Tên dự án:** SKYCAST AI — Trợ lý Thời tiết Thông minh
**Phiên bản:** v3.1 (Tháng 4/2026)
**Sinh viên thực hiện:** Phạm Phước Bình — 1721031063
**Môn học:** Chuyên Đề Phát Triển Phần Mềm

---

## 📋 MỤC LỤC
1. [Giới Thiệu Dự Án](#1-giới-thiệu-dự-án)
2. [Vấn Đề & Giải Pháp](#2-vấn-đề--giải-pháp)
3. [Đối Tượng Người Dùng & USP](#3-đối-tượng-người-dùng--usp)
4. [Stack Công Nghệ & APIs](#4-stack-công-nghệ--apis)
5. [Kiến Trúc Hệ Thống](#5-kiến-trúc-hệ-thống)
6. [Chi Tiết API Routes](#6-chi-tiết-api-routes)
7. [Cơ Sở Dữ Liệu — MongoDB](#7-cơ-sở-dữ-liệu--mongodb)
8. [Giao Diện & Trải Nghiệm Người Dùng](#8-giao-diện--trải-nghiệm-người-dùng)
9. [Đặc Tả Chi Tiết Tính Năng](#9-đặc-tả-chi-tiết-tính-năng)
10. [Quy Trình Phát Triển](#10-quy-trình-phát-triển)
11. [Kết Quả Đạt Được](#11-kết-quả-đạt-được)
12. [Giới Hạn & Roadmap](#12-giới-hạn--roadmap)

---

## 1. GIỚI THIỆU DỰ ÁN
**SKYCAST AI** là một ứng dụng dự báo thời tiết thông minh thế hệ mới, kết hợp sức mạnh của trí tuệ nhân tạo (Generative AI) để chuyển đổi các con số khí tượng khô khan thành những lời khuyên hành động thực tế. Không chỉ dừng lại ở việc xem nhiệt độ, SKYCAST giúp người dùng lập kế hoạch cuộc sống thông minh hơn thông qua các báo cáo tóm tắt tự nhiên và cố vấn lịch trình chuyến đi.

### Chỉ số dự án (Project Metrics)
*   **Framework:** Next.js 16.1.7 (Turbopack)
*   **Ngôn ngữ:** TypeScript 100%
*   **Tính năng AI:** 2 Core Modules (Summary & Planner)
*   **API Routes:** 11 Endpoints chuyên sâu
*   **Độ phủ Việt hóa:** 100% giao diện và dữ liệu

---

## 2. VẤN ĐỀ & GIẢI PHÁP
| ❌ Vấn đề hiện tại | ✅ Giải pháp SKYCAST AI |
| :--- | :--- |
| **Dữ liệu phức tạp:** Số liệu UV, AQI... khó hiểu. | **AI Summary:** GPT-4o-mini giải thích bằng tiếng Việt dễ hiểu. |
| **Lên kế hoạch khó khăn:** Không biết mặc gì, đi lúc nào. | **AI Planner:** Chấm điểm an toàn và đề xuất trang phục/giờ vàng. |
| **Phụ thuộc API AI:** App dễ crash khi AI lỗi hoặc hết hạn. | **Smart Fallback:** Thuật toán nội bộ tự sinh nội dung ổn định. |
| **Thiếu tính cá nhân hóa:** Mất dữ liệu khi đổi trình duyệt. | **Cloud Persistence:** MongoDB lưu Favorites theo tài khoản. |
| **Dữ liệu lịch sử đắt đỏ:** API lịch sử thường tốn phí cao. | **Open-Meteo:** Tích hợp 30 ngày lịch sử hoàn toàn miễn phí. |
| **Cảnh báo thụ động:** Phải mở app mới biết trời sắp mưa. | **Web Push:** Thông báo đẩy ngay trên trình duyệt (sw.js). |

---

## 3. ĐỐI TƯỢNG NGƯỜI DÙNG & USP
### Đối tượng mục tiêu
*   **Người dùng chính:** Người Việt trẻ (18-40), yêu công nghệ, cần thông tin nhanh.
*   **Du khách:** Người cần lên kế hoạch chuyến đi chính xác dựa trên thời tiết.
*   **Developers:** Muốn nhúng widget thời tiết chuyên nghiệp vào website cá nhân.

### Unique Selling Points (USP)
1.  **AI-First Experience:** AI không phải tính năng phụ, mà là trọng tâm của trải nghiệm người dùng.
2.  **Hoạt động 24/7:** Cơ chế Fallback đảm bảo app luôn phục vụ dù không có OpenAI API Key.
3.  **Bản đồ 6 lớp:** Tích hợp Radar mưa, Mây, Gió, Nhiệt độ... tương tác mượt mà qua Leaflet.
4.  **Việt hóa sâu:** Dịch tự động hơn 50 trạng thái thời tiết từ API quốc tế sang ngôn ngữ tự nhiên.
5.  **Widget nhúng:** Khả năng cá nhân hóa widget (3 theme) để nhúng vào bất kỳ website nào qua Iframe.

---

## 4. STACK CÔNG NGHỆ & APIs
### Công nghệ cốt lõi
*   **Next.js 16 (App Router):** Tối ưu SSR cho SEO và Streaming cho tốc độ load AI.
*   **Tailwind CSS:** Thiết kế phong cách **Glassmorphism** chuẩn chỉnh.
*   **Framer Motion:** Hiệu ứng khí quyển động (mưa/tuyết/mây) theo điều kiện thực.
*   **NextAuth.js:** Bảo mật đăng nhập với JWT và mã hóa bcrypt.
*   **MongoDB/Mongoose:** Lưu trữ User và danh sách Favorites an toàn.

### External APIs
*   **OpenWeatherMap:** Nguồn dữ liệu thời tiết thực và dự báo 5 ngày.
*   **Open-Meteo:** Cung cấp dữ liệu lịch sử 30 ngày và AQI miễn phí.
*   **RainViewer:** Tile layer cho bản đồ Radar mưa realtime.
*   **OpenAI GPT-4o-mini:** Xử lý ngôn ngữ tự nhiên (Tóm tắt & Planner).

---

## 5. KIẾN TRÚC HỆ THỐNG
Dự án được xây dựng theo kiến trúc **Monolithic hiện đại** trên nền tảng Next.js:

```text
[ CLIENT SIDE ] -> [ NEXT.JS MIDDLEWARE / AUTH ] -> [ API ROUTES LAYER ]
      │                     │                            │
      ├─ Components UI      ├─ Security (JWT)            ├─ Weather Proxy
      ├─ Charts (Recharts)  └─ Session Management        ├─ AI (GPT + Fallback)
      └─ Maps (Leaflet)                                  └─ DB (MongoDB)
```

### Cấu trúc thư mục (v3.1)
*   `src/app/favorites/`: Trang quản lý địa điểm yêu thích chuyên biệt.
*   `src/app/api/`: Chứa 11 Routes xử lý logic Backend.
*   `src/lib/aiSummary.ts`: "Trái tim" của hệ thống Fallback AI.
*   `public/sw.js`: Service Worker xử lý Push Notification.

---

## 6. CHI TIẾT API ROUTES
| Endpoint | Method | Chức năng chi tiết |
| :--- | :--- | :--- |
| `/api/weather` | POST | Fetch data OpenWeatherMap + Dịch tự động mô tả sang tiếng Việt. |
| `/api/weather-summary`| POST | GPT-4o-mini sinh tóm tắt ~80 từ. Có fallback thuật toán. |
| `/api/ai-planner` | POST | GPT JSON Mode tư vấn kế hoạch. Có fallback chấm điểm từ xác suất mưa. |
| `/api/favorites` | ALL | Quản lý CRUD địa điểm lưu trên MongoDB (Bảo mật NextAuth). |
| `/api/history` | POST | Lấy dữ liệu 30 ngày lịch sử từ Open-Meteo (Miễn phí). |
| `/api/auth/[...auth]` | ALL | Xử lý Đăng ký/Đăng nhập và Session với mã hóa bcrypt. |

---

## 7. CƠ SỞ DỮ LIỆU — MONGOBD
Ứng dụng sử dụng **Embedded Data Pattern** để tối ưu tốc độ truy vấn:

**User Schema:**
```json
{
  "name": "Display Name",
  "email": "unique@email.com",
  "password": "hashed_password_bcrypt",
  "favorites": [
    { "label": "Thủ Dầu Một", "lat": 10.98, "lon": 106.65 }
  ]
}
```

---

## 8. GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG
### Động lực giao diện (UI Dynamics)
*   **Gradient Background:** Tự động thay đổi màu nền theo 4 mốc thời gian (Sáng, Trưa, Chiều, Tối).
*   **Atmosphere Effects:** Hiệu ứng mưa rơi, tuyết rơi hoặc mây trôi dựa trên trạng thái thời tiết được fetch.
*   **Responsive Page:** Hỗ trợ mọi thiết bị từ Mobile đến Desktop 4K.

### Các trang chuyên biệt
1.  **Dashboard:** Trang chủ tra cứu và xem báo cáo AI tổng hợp.
2.  **Favorites Page (/favorites):** Giao diện lưới quản lý địa điểm yêu thích trực quan.
3.  **Compare Page (/compare):** So sánh song song 2 thành phố với bảng chấm điểm tự động.
4.  **Widget Page (/widget):** Cung cấp mã iframe nhúng với 3 theme màu sắc khác nhau.

---

## 9. ĐẶC TẢ CHI TIẾT TÍNH NĂNG
*   **AI Planner:** Người dùng nhập kế hoạch (vd: "Đi đá bóng"), AI trả về điểm số an toàn, gợi ý trang phục và khung giờ vàng.
*   **Radar Map Layer:** 6 lớp bản đồ chuyên sâu (Nhiệt độ, Gió, Mây, Áp suất, Mưa, Radar) tích hợp trên cùng một bản đồ tương tác.
*   **Push Notification:** Tích hợp Web Notification API giúp cảnh báo mưa bão ngay lập tức cho người dùng thông qua Service Worker.
*   **History Charts:** Phân tích biến động nhiệt độ và lượng mưa trong 30 ngày gần nhất qua biểu đồ chuyên nghiệp.

---

## 10. QUY TRÌNH PHÁT TRIỂN
Dự án trải qua 5 giai đoạn phát triển nghiêm ngặt:
1.  **Chương 1 — Foundation:** Xây dựng core thời tiết và UI Glassmorphism.
2.  **Chương 2 — Authentication:** Tích hợp NextAuth và MongoDB.
3.  **Chương 3 — Data Analysis:** Xây dựng biểu đồ Recharts và Việt hóa sâu.
4.  **Chương 4 — AI Integration:** Triển khai GPT-4o-mini và hệ thống Fallback an toàn.
5.  **Chương 5 — Ecosystem:** Nâng cấp trang Favorites, Compare, Widget và Push Notification.

---

## 11. KẾT QUẢ ĐẠT ĐƯỢC
### Checklist Hoàn thành (19/19)
- [x] Tra cứu thời tiết & Autocomplete địa danh.
- [x] Tóm tắt AI & Cố vấn du lịch (Có Fallback).
- [x] Bản đồ 6 lớp dữ liệu thời tiết trực tiếp.
- [x] Đăng ký / Đăng nhập & Mã hóa bảo mật.
- [x] **Trang Quản lý Yêu thích chuyên biệt.**
- [x] Lịch sử 30 ngày (Open-Meteo) & Biểu đồ.
- [x] Push Notification cảnh báo thiên tai.
- [x] So sánh 2 thành phố & Widget nhúng Iframe.
- [x] Việt hóa 100% giao diện và dữ liệu.

---

## 12. GIỚI HẠN & ROADMAP
### Giới hạn hiện tại
*   UV Index hiện đang tính toán gần đúng từ độ bao phủ mây.
*   Thông báo đẩy Push Notification mới chỉ hoạt động phía Client-side.

### Roadmap Q2 - Q4 2026
*   **V3.2:** Tích hợp Server-side Push Notification qua Web-push Protocol + Cron job.
*   **V3.3:** Nâng cấp lên OpenWeather OneCall v3 để lấy chỉ số UV thực từ vệ tinh.
*   **V3.4:** Ra mắt ứng dụng Mobile (React Native) sử dụng chung hệ thống API Backend.
*   **V3.5:** Hệ thống trang cá nhân (Profile) nâng cao và Dark/Light mode toggle.

---
**SKYCAST AI — BÁO CÁO v3.1**
*Phạm Phước Bình — 02/04/2026*
