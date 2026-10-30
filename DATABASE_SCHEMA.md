# Database Schema — PostgreSQL schema `pet-shop`

Nguồn chuẩn: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma). File [`schema.sql`](schema.sql) được sinh từ đó (DDL) kèm **dữ liệu mặc định**.

## Thiết lập

```bash
# Cách 1 — SQL thuần (database trống)
psql -d petshop -f schema.sql

# Cách 2 — Prisma
cd backend
npx prisma db push && npm run seed     # seed idempotent, chạy lại không tạo trùng
```

`DATABASE_URL="postgresql://user:pass@localhost:5432/petshop?schema=pet-shop"`

Tạo lại phần DDL trong `schema.sql` sau khi sửa Prisma schema:
`npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`

## Dữ liệu mặc định

| Gì | Chi tiết |
|----|----------|
| 3 nhóm | `admin` (khóa, toàn quyền), `monitor`, `customer` |
| 11 quyền | xem `backend/src/auth/permissions.ts` |
| **Super Admin** | `admin@petshop.vn` / `admin123` — `is_super_admin = true`. **Đổi mật khẩu khi lên production** (`SUPER_ADMIN_PASSWORD` khi seed bằng Prisma, hoặc `POST /api/auth/change-password`) |
| Tài khoản mẫu (dev) | `monitor@petshop.vn` / `monitor123` (nhóm monitor), `khach@petshop.vn` / `khach123` (nhóm customer) |
| Cửa hàng, 3 danh mục, 6 dịch vụ + 24 mức giá theo size, 2 bài viết | khớp nội dung website |

## Mô hình phân quyền

```
users / staff ──► groups ──► group_permissions ──► permissions
```

- Mỗi tài khoản thuộc **đúng một nhóm** (`group_id`). Quyền được tra từ DB ở **mỗi request** → đổi nhóm/quyền có hiệu lực ngay, không cần đăng nhập lại.
- `staff` thuộc nhóm `admin` hoặc `monitor`; `users` (khách) luôn thuộc `customer`. Đăng ký trên website → `customer`.
- Nhóm `customer` chỉ được cấp quyền `account.view`; nhóm `admin` (`is_locked`) không chỉnh được.
- `staff.is_super_admin`: không đổi nhóm, không khóa, không xóa.

## Bảng

| Bảng | Mô tả |
|------|-------|
| `groups`, `permissions`, `group_permissions` | Nhóm, danh mục quyền, quyền theo nhóm |
| `users` | Khách hàng (email, phone unique, `loyalty_points`) |
| `staff` | Nhân viên (position: receptionist/groomer/manager/admin), `employee_code` |
| `stores` | Cửa hàng; `open_time`/`close_time`, `slot_capacity` (số lịch tối đa / khung giờ) |
| `pets` | Hồ sơ thú cưng của khách đã đăng nhập |
| `service_categories`, `services`, `service_variants` | Danh mục, dịch vụ, giá theo size (`toy/small/medium/large/giant`), unique `(service_id, size)` |
| `bookings`, `booking_services`, `payments` | Đặt lịch, dịch vụ trong lịch (giá chốt lúc đặt), thanh toán |
| `posts` | Bài viết (`author_id` → staff, SET NULL khi xóa; `author_name` lưu snapshot) |
| `contact_messages` | Tin nhắn từ form liên hệ |

## Quyết định thiết kế

- **Đặt lịch không cần đăng nhập:** `bookings.user_id` và `pet_id` cho phép NULL; thông tin liên hệ + thú cưng lưu thẳng trên booking (`customer_*`, `pet_*`). Khách đăng nhập thì gắn `user_id` và tạo hồ sơ `pets`.
- **Không có bảng slot:** `start_time`/`end_time` là `HH:mm` (VARCHAR(5)), sức chứa tính bằng cách đếm lịch cùng `(store, date, start_time)` chưa hủy, được khóa bằng `pg_advisory_xact_lock` để chống đặt vượt khi nhiều người đặt cùng lúc.
- **Mã đặt lịch:** `BK-YYYYMMDD-NNNN` với `NNNN` lấy từ cột `booking_seq` (autoincrement).
- **Tiền là số nguyên VNĐ** (`INT`), không dùng float.
- Khóa ngoại: dịch vụ/danh mục/cửa hàng `RESTRICT` (không xóa được khi còn dữ liệu tham chiếu); xóa nhân viên giữ lại bài viết và lịch đã xử lý.
- Enum lưu dạng IN HOA (`PENDING`, `DOG`, …); API trả trạng thái lịch dạng chữ thường.
