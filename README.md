# 🐾 PetShop — Spa & Grooming Thú Cưng

Website đặt lịch dịch vụ spa và grooming cho thú cưng. Bao gồm trang công khai cho khách hàng và admin panel quản lý.

## Tech Stack

| Tầng | Công nghệ | Phiên bản |
|------|-----------|-----------|
| Frontend | Next.js + React + Tailwind CSS | 16.4.3 / 19.3.0 / 4.x |
| Backend | NestJS + Prisma | 12.x / 5.22.0 |
| Database | PostgreSQL | 15+ |
| Runtime | Node.js | 20+ |

## Cấu trúc thư mục

```
pet-shop/
├── frontend/                    # Next.js frontend (port 3002)
│   ├── app/
│   │   ├── page.tsx        # Trang chủ
│   │   ├── dich-vu/        # Trang dịch vụ
│   │   ├── bang-gia/       # Trang bảng giá
│   │   ├── dat-lich/       # Trang đặt lịch
│   │   ├── lien-he/        # Trang liên hệ
│   │   ├── ve-chung-toi/   # Trang giới thiệu
│   │   └── admin/          # Admin panel (login, dashboard, services, bookings, users, staff)
│   └── components/         # Header, Footer, ContactWidget, GoogleMap
├── backend/                # NestJS API (port 8000)
│   ├── prisma/schema.prisma
│   └── src/
│       ├── services/       # API dịch vụ
│       ├── bookings/       # API đặt lịch
│       ├── contact/        # API liên hệ
│       ├── prisma/         # Prisma service
│       └── admin/          # AdminJS module (legacy)
├── schema.sql              # SQL schema đầy đủ
└── DEPLOYMENT.md           # Hướng dẫn deploy VPS
```

## Cài đặt & Chạy

### Yêu cầu
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push && npm run seed   # hoặc: psql -d petshop -f ../schema.sql
npm run start:dev
```

Backend chạy tại `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3002`

### Môi trường

**backend/.env:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pshop?schema=pet-shop"
JWT_SECRET=<chuỗi ngẫu nhiên — bắt buộc khi production>
PORT=8000
FRONTEND_URL=http://localhost:3002
```

## API Endpoints

Quyền (🔐) được kiểm tra ở backend mỗi request (`@Auth(...)`), không chỉ ở FE.

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/api/auth/login` | công khai | Đăng nhập chung (nhân viên: email; khách: email/SĐT) |
| POST | `/api/auth/register` | công khai | Đăng ký → nhóm Customer |
| GET | `/api/auth/me` | 🔐 đăng nhập | Hồ sơ + nhóm + danh sách quyền |
| POST | `/api/auth/change-password` | 🔐 đăng nhập | Đổi mật khẩu |
| GET | `/api/services`, `/:slug`, `/categories`, `/category/:slug` | công khai | Dịch vụ đang hoạt động (kèm giá theo size) |
| POST | `/api/bookings` | công khai / đăng nhập | Đặt lịch (khách vãng lai hoặc gắn tài khoản) |
| GET | `/api/bookings/lookup?number=&phone=` | công khai | Tra cứu lịch bằng mã + SĐT |
| GET | `/api/bookings/me` | 🔐 `account.view` | Lịch sử đặt lịch của tôi |
| PATCH | `/api/bookings/:id/cancel` | 🔐 `account.view` | Khách hủy lịch của mình |
| POST | `/api/contact` | công khai | Gửi liên hệ (lưu DB) |
| GET | `/api/posts`, `/api/posts/:idOrSlug` | công khai | Bài viết đã đăng |
| GET | `/api/admin/stats` | 🔐 `admin.access` | Số liệu tổng quan (doanh thu cần `dashboard.revenue`) |
| GET | `/api/admin/bookings` | 🔐 `bookings.view` | Danh sách lịch (lọc q/status/date, phân trang) |
| PATCH | `/api/admin/bookings/:id/status` | 🔐 `bookings.manage` | Xác nhận / hoàn thành / hủy (kiểm tra luồng trạng thái) |
| GET/POST/PATCH/DELETE | `/api/admin/services[/:id]` | 🔐 `services.manage` | Quản lý dịch vụ |
| GET/POST/PATCH/DELETE | `/api/admin/posts[/:id]` | 🔐 `posts.write` | Bài viết (sửa/xóa bài người khác cần `posts.manage_all`) |
| GET | `/api/admin/customers` | 🔐 `customers.view` | Danh sách khách |
| GET/POST/PATCH/DELETE | `/api/admin/staff[/:id]` | 🔐 `staff.manage` | Nhân viên (super admin được bảo vệ) |
| GET | `/api/admin/groups` | 🔐 `groups.manage` | Nhóm + quyền + số thành viên |
| PUT | `/api/admin/groups/:key/permissions` | 🔐 `groups.manage` | Đặt quyền cho nhóm (trừ Admin) |

Database: xem [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — schema PostgreSQL `pet-shop`, `schema.sql` đã kèm dữ liệu mặc định (super admin `admin@petshop.vn`).

## Đăng nhập & Phân quyền

Mô hình: **User → Nhóm → Quyền**. Một trang đăng nhập chung `/login` (có đăng ký cho khách). Quản lý nhóm, ma trận quyền và tài khoản tại `/admin/groups`.

| Nhóm | Dành cho | Quyền mặc định | Tài khoản demo |
|------|----------|----------------|----------------|
| **Admin** | Quản trị viên | Toàn quyền (cố định, không chỉnh được) | **admin@petshop.vn / admin123** — Super Admin tạo sẵn, không đổi nhóm/xóa được |
| **Monitor** | Staff | Vào khu quản trị, xem lịch đặt, viết/sửa/xóa bài của mình | monitor@petshop.vn / monitor123 |
| **Customer** | Khách hàng | Xem tài khoản và lịch sử đặt lịch của mình | khach@petshop.vn / khach123 |

- Đăng ký trên website luôn vào nhóm **Customer**; staff do admin tạo và gán nhóm Monitor.
- Backend: Staff có position ADMIN/MANAGER -> `admin`, position khác -> `monitor`; khách -> `customer`.
- Quyền của Monitor/Customer chỉnh được trong ma trận (chế độ demo lưu localStorage). Chưa có model Group/Permission ở backend.
> Phân quyền ở FE chỉ để ẩn/hiện giao diện — backend vẫn cần guard (JwtAuthGuard + RolesGuard) cho từng endpoint.

> **Chế độ demo (preview không cần backend/DB):** đặt `NEXT_PUBLIC_DEMO_MODE=true` trong `frontend/.env.local` rồi chạy `npm run dev`.
> Đăng nhập, dịch vụ, đặt lịch (kể cả đơn khách đặt từ `/booking`) hoạt động hoàn toàn trên trình duyệt (localStorage).
> Khi triển khai thật: bỏ biến này để FE gọi API backend (JWT).

## Database Schema

12 models chính trong Prisma:

- **User** — Khách hàng
- **Store** — Cửa hàng
- **Staff** — Nhân viên (4 vị trí: Admin, Manager, Groomer, Receptionist)
- **Pet** — Thú cưng (7 loài: Dog, Cat, Bird, Rabbit, Hamster, Reptile, Other)
- **ServiceCategory** — Danh mục dịch vụ
- **Service** — Dịch vụ (spa, grooming, chăm sóc đặc biệt)
- **ServiceVariant** — Biến thể giá theo size pet
- **AppointmentSlot** — Khung giờ hẹn
- **Booking** — Đặt lịch (6 trạng thái: Pending → Confirmed → In Progress → Completed/Cancelled/No Show)
- **BookingService** — Dịch vụ trong booking
- **Payment** — Thanh toán (Cash, Bank Transfer, MoMo, ZaloPay)

Xem chi tiết tại [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) hoặc `backend/prisma/schema.prisma`.

## Các trang Frontend

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ — Hero, dịch vụ, đánh giá, bản đồ |
| `/services` | Danh sách dịch vụ với filter theo danh mục |
| `/pricing` | Bảng giá chi tiết theo size pet |
| `/booking` | Form đặt lịch online |
| `/news` | Tin tức & kinh nghiệm chăm sóc thú cưng |
| `/about` | Giới thiệu, đội ngũ, timeline |
| `/contact` | Form liên hệ + bản đồ |
| `/login` | Đăng nhập |
| `/register` | Đăng ký khách hàng |
| `/account` | Tài khoản khách hàng + lịch sử đặt lịch |
| `/admin` | Dashboard admin |
| `/admin/services` | Quản lý dịch vụ |
| `/admin/bookings` | Quản lý đặt lịch |
| `/admin/users` | Quản lý khách hàng |
| `/admin/staff` | Quản lý nhân viên |

## Tình trạng dự án

**Hoàn thiện: ~40%** — Build thành công, UI hoàn chỉnh, cần bổ sung:

- [ ] Kết nối Frontend ↔ Backend (forms, admin pages)
- [ ] Authentication (JWT backend, guard API endpoints)
- [ ] Admin CRUD API + functional UI (modal create/edit)
- [ ] Lưu contact form vào database
- [ ] Tích hợp thanh toán (MoMo/ZaloPay)
- [ ] Email/SMS thông báo
- [ ] Tests

## Tài liệu liên quan

- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Chi tiết schema database
- [DEPLOYMENT.md](DEPLOYMENT.md) — Hướng dẫn deploy VPS (PM2 + Docker)
- [TECH_STACK.md](TECH_STACK.md) — Kiến trúc công nghệ chi tiết

## Liên hệ

- **Hotline:** 0971 616 634
- **Zalo:** https://zalo.me/0971616634


# pet-shop

## Admin (Full quyền):

Email: admin@petshop.vn
Password: admin123
Quyền: Tất cả (CRUD services, bookings, users, staff)

## Monitor (Chỉ xem):

Email: monitor@petshop.vn
Password: monitor123
