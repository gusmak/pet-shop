# 🐾 PetShop — Spa & Grooming Thú Cưng

Website đặt lịch spa / grooming cho thú cưng, gồm trang công khai (khách hàng) và admin panel quản lý.

## Tech Stack

| Tầng | Công nghệ | Phiên bản |
|------|-----------|-----------|
| Frontend | Next.js + React + Tailwind CSS | 16.4.3 / 19.3.0 / 4.x |
| i18n | next-intl | 4.14.9 |
| Rich-text | TipTap (+ DOMPurify để sanitize) | 3.x |
| Backend | NestJS + Prisma | 12.x / 5.22.0 |
| Database | PostgreSQL | 16 (Docker) |
| Runtime | Node.js | 20 |

## Cấu trúc thư mục

```
pet-shop/
├── frontend/                        # Next.js — Docker: 3006, dev: 3002
│   ├── app/[locale]/                # Trang công khai (next-intl: /vi, /en)
│   │   ├── page.tsx                 # Trang chủ
│   │   ├── services/ pricing/ booking/ contact/ about/
│   │   ├── news/ + news/[slug]/     # Tin tức (danh sách + chi tiết)
│   │   └── login/ register/ account/
│   ├── app/admin/                   # Admin panel (layout riêng)
│   │   ├── page.tsx                 # Dashboard
│   │   └── services/ bookings/ posts/ users/ staff/ groups/ settings/
│   ├── components/                  # Header, Footer, SiteChrome, RichTextEditor…
│   ├── lib/                         # api.ts (fetch + JWT), useAuth, permissions…
│   ├── messages/{vi,en}.json        # Bản dịch
│   └── i18n/                        # Cấu hình next-intl
├── backend/                         # NestJS API — Docker: 8060, dev: 8000
│   ├── prisma/schema.prisma         # Nguồn chuẩn của DB
│   ├── uploads/                     # Ảnh upload (runtime, KHÔNG commit lên git)
│   └── src/                         # modules: auth, services, bookings, posts, uploads…
├── schema.sql                       # DDL + seed (tự chạy khi DB volume còn trống)
├── docker-compose.yml               # postgres + backend + frontend
├── .env.example                     # Mẫu biến môi trường (sao chép sang .env khi deploy)
├── backup-db.cmd / restore-db.cmd   # Script backup/restore database (Windows)
└── DEPLOYMENT.md / TECH_STACK.md / DATABASE_SCHEMA.md
```

## Cài đặt & Chạy nhanh

### Cách 1: Docker (khuyên dùng — giống hệt môi trường VPS)

```bash
# 1) Tạo file biến môi trường (chỉ cần khi deploy; local có thể bỏ qua để dùng giá trị mặc định)
cp .env.example .env      # Linux/macOS
copy .env.example .env    # Windows

# 2) Build + chạy toàn bộ stack
docker compose up -d --build
```

| Dịch vụ | Cổng host | Ghi chú |
|---------|-----------|---------|
| Frontend | **3006** | `NEXT_PUBLIC_API_URL` trỏ tới backend |
| Backend API | **8060** | serve tĩnh `/uploads/<file>` |
| PostgreSQL | **5433** | schema `pet-shop`, seed tự động lần chạy đầu |

Ghé thăm: `http://localhost:3006/vi` (hoặc `/en`).

### Cách 2: Chạy thủ công (không Docker)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push && npm run seed     # hoặc: psql -d petshop -f ../schema.sql
npm run start:dev                      # http://localhost:8000

# Frontend (terminal khác)
cd frontend
npm install
npm run dev                            # http://localhost:3002
```

## Biến môi trường

**Root `.env` (Docker)** — copy từ `.env.example`:

```env
POSTGRES_DB=petshop
POSTGRES_USER=petshop
POSTGRES_PASSWORD=thay-bang-mat-khau-manh
JWT_SECRET=thay-bang-chuoi-ngau-nhien          # bắt buộc đổi khi production
FRONTEND_URL=https://domain.com                # origin FE (CORS), phân tách bằng dấu phẩy
NEXT_PUBLIC_API_URL=https://api.domain.com     # FE gọi BE — được "nướng" lúc build
```

**`backend/.env` (chạy thủ công)** — xem `backend/.env.example`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/petshop?schema=pet-shop"
PORT=8000
FRONTEND_URL=http://localhost:3002
JWT_SECRET=<ngẫu nhiên>
SUPER_ADMIN_PASSWORD=          # chỉ dùng khi npm run seed
SEED_DEMO_ACCOUNTS=true
```

## API Endpoints

Quyền (🔐) kiểm tra tại backend ở mỗi request (`@Auth(...)`), không phải chỉ ẩn/hiện ở FE.

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| POST | `/api/auth/login` | công khai | Đăng nhập (staff: email; khách: email/SĐT) |
| POST | `/api/auth/register` | công khai | Đăng ký → nhóm Customer |
| GET | `/api/auth/me` | 🔐 đăng nhập | Hồ sơ + nhóm + quyền |
| POST | `/api/auth/change-password` | 🔐 đăng nhập | Đổi mật khẩu |
| GET | `/api/services`, `/:slug`, `/categories`, `/category/:slug` | công khai | Dịch vụ đang hoạt động (kèm giá theo size) |
| POST | `/api/bookings` | công khai / đăng nhập | Đặt lịch |
| GET | `/api/bookings/lookup?number=&phone=` | công khai | Tra cứu lịch bằng mã + SĐT |
| GET | `/api/bookings/me` | 🔐 `account.view` | Lịch sử đặt lịch của tôi |
| PATCH | `/api/bookings/:id/cancel` | 🔐 `account.view` | Khách hủy lịch của mình |
| POST | `/api/contact` | công khai | Gửi liên hệ (lưu DB) |
| GET | `/api/posts`, `/:idOrSlug` | công khai | Bài viết đã đăng |
| **POST** | **`/api/admin/uploads`** | 🔐 `posts.write` | **Upload ảnh** (multipart, ≤5MB, jpg/png/webp/gif/avif) → `{ url: "/uploads/<file>" }` |
| GET/POST/PATCH/DELETE | `/api/admin/posts[/:id]` | 🔐 `posts.write` | Bài viết (sửa/xóa bài người khác cần `posts.manage_all`); `PATCH {published}` để ẩn/hiện |
| GET/POST/PATCH/DELETE | `/api/admin/services[/:id]` | 🔐 `services.manage` | Quản lý dịch vụ |
| GET | `/api/admin/bookings` | 🔐 `bookings.view` | Danh sách lịch (lọc, phân trang) |
| PATCH | `/api/admin/bookings/:id/status` | 🔐 `bookings.manage` | Xác nhận / hoàn thành / hủy |
| GET | `/api/admin/customers` | 🔐 `customers.view` | Danh sách khách |
| GET/POST/PATCH/DELETE | `/api/admin/staff[/:id]` | 🔐 `staff.manage` | Quản lý nhân viên |
| GET | `/api/admin/groups` | 🔐 `groups.manage` | Nhóm + quyền |
| PUT | `/api/admin/groups/:key/permissions` | 🔐 `groups.manage` | Gán quyền cho nhóm |
| GET | `/api/admin/stats` | 🔐 `admin.access` | Số liệu tổng quan |
| GET/PATCH | `/api/settings`, `/api/admin/settings` | công khai / 🔐 `settings.manage` | Cấu hình hệ thống |

## Tin tức (News)

Tính năng bài viết hoạt động end-to-end:

- **Soạn thảo WYSIWYG** bằng TipTap (đậm, nghiêng, heading, danh sách, trích dẫn, **chèn ảnh vào giữa bài**).
- **Ảnh bìa** upload từ admin → lưu `backend/uploads/` → serve tại `/uploads/<file>` → hiển thị bằng `next/image`.
- **Ảnh trong nội dung** cũng dùng chung endpoint upload; nội dung lưu HTML và được **sanitize bằng DOMPurify** khi hiển thị.
- **Toggle trạng thái** (Đã đăng ⇄ Bản nháp) ngay trong bảng quản lý bài viết.
- Ảnh lưu trong Docker volume `uploads_data` → không mất khi rebuild, và **không đưa lên git** (đã gitignore).

## Đăng nhập & Phân quyền

Mô hình **User → Nhóm → Quyền**. Trang đăng nhập chung `/login`; quản lý nhóm/quyền tại `/admin/groups`.

| Nhóm | Dành cho | Tài khoản demo |
|------|----------|----------------|
| **Admin** | Quản trị viên — toàn quyền (khóa, không chỉnh được) | `admin@petshop.vn` / `admin123` |
| **Monitor** | Staff — vào admin, xem lịch, viết bài | `monitor@petshop.vn` / `monitor123` |
| **Customer** | Khách hàng — xem tài khoản & lịch sử đặt | `khach@petshop.vn` / `khach123` |

> ⚠️ Đổi mật khẩu `admin` khi đưa lên production.

## Database

PostgreSQL schema **`pet-shop`**. `schema.sql` (sinh từ `backend/prisma/schema.prisma`) chứa DDL + dữ liệu mặc định, tự chạy khi DB volume còn trống.

- Chi tiết schema & dữ liệu seed: xem [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).
- Sửa Prisma schema rồi sinh lại DDL:
  `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`

## Backup & Restore

Database và ảnh upload là **dữ liệu runtime, không nằm trong git** — cần backup riêng.

```bash
# Windows (double-click hoặc chạy từ project root)
backup-db.cmd
restore-db.cmd backup_YYYYMMDD_HHMMSS.dump

# Tương đương bằng lệnh Docker (custom format)
docker compose exec -T postgres pg_dump -U petshop -d petshop -Fc > backup.dump
docker compose exec -T postgres pg_restore -U petshop -d petshop --clean --if-exists < backup.dump
```

> Ảnh upload nằm trong volume `uploads_data` (tương tự `postgres_data`) — muốn sao lưu cả ảnh thì backup thêm volume này.

## Tài liệu liên quan

- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — Chi tiết schema & dữ liệu mẫu
- [DEPLOYMENT.md](DEPLOYMENT.md) — Hướng dẫn deploy VPS
- [TECH_STACK.md](TECH_STACK.md) — Kiến trúc & lựa chọn công nghệ

## Liên hệ

- **Hotline:** 0971 616 634
- **Zalo:** https://zalo.me/0971616634