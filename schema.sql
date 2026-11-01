-- ============================================================================
-- PETSHOP — PostgreSQL schema "pet-shop"
--
-- File này được sinh từ backend/prisma/schema.prisma (nguồn chuẩn) + dữ liệu mặc định.
-- Tạo lại phần DDL:
--   cd backend && npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
--
-- Cách dùng (trên database trống):
--   psql -d <db> -f schema.sql
--   DATABASE_URL="postgresql://user:pass@localhost:5432/<db>?schema=pet-shop"
--
-- Hoặc để Prisma tạo bảng:  npx prisma db push && npm run seed
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;          -- gen_random_uuid(), crypt()
CREATE SCHEMA IF NOT EXISTS "pet-shop";
SET search_path TO "pet-shop", public;

-- ============================================================================
-- CẤU TRÚC BẢNG (sinh bởi Prisma)
-- ============================================================================

-- CreateEnum
CREATE TYPE "staff_position" AS ENUM ('RECEPTIONIST', 'GROOMER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "pet_species" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'REPTILE', 'OTHER');

-- CreateEnum
CREATE TYPE "pet_size" AS ENUM ('TOY', 'SMALL', 'MEDIUM', 'LARGE', 'GIANT');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOMO', 'ZALOPAY');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_permissions" (
    "group_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "group_permissions_pkey" PRIMARY KEY ("group_id","permission_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar" TEXT,
    "address" TEXT,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar" TEXT,
    "employee_code" TEXT NOT NULL,
    "position" "staff_position" NOT NULL,
    "specialties" TEXT[],
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hire_date" DATE NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "zalo_link" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "open_time" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "close_time" VARCHAR(5) NOT NULL DEFAULT '20:00',
    "slot_capacity" INTEGER NOT NULL DEFAULT 3,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "pet_species" NOT NULL,
    "size" "pet_size" NOT NULL DEFAULT 'SMALL',
    "breed" TEXT,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "base_price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "features" TEXT[],
    "image_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_variants" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "size" "pet_size" NOT NULL,
    "price" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "booking_number" TEXT NOT NULL,
    "booking_seq" SERIAL NOT NULL,
    "user_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "pet_id" TEXT,
    "pet_name" TEXT NOT NULL,
    "pet_species" "pet_species" NOT NULL,
    "pet_size" "pet_size" NOT NULL,
    "store_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'PENDING',
    "assigned_to_id" TEXT,
    "customer_notes" TEXT,
    "staff_notes" TEXT,
    "total" INTEGER NOT NULL,
    "cancel_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_services" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "payment_method" NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "author_id" TEXT,
    "author_name" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_key_key" ON "groups"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_group_id_idx" ON "users"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_phone_key" ON "staff"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employee_code_key" ON "staff"("employee_code");

-- CreateIndex
CREATE INDEX "staff_store_id_idx" ON "staff"("store_id");

-- CreateIndex
CREATE INDEX "staff_group_id_idx" ON "staff"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "pets_owner_id_idx" ON "pets"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_variants_service_id_size_key" ON "service_variants"("service_id", "size");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_seq_key" ON "bookings"("booking_seq");

-- CreateIndex
CREATE INDEX "bookings_date_start_time_idx" ON "bookings"("date", "start_time");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_customer_phone_idx" ON "bookings"("customer_phone");

-- CreateIndex
CREATE INDEX "booking_services_booking_id_idx" ON "booking_services"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_is_published_published_at_idx" ON "posts"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "contact_messages_is_read_created_at_idx" ON "contact_messages"("is_read", "created_at");

-- AddForeignKey
ALTER TABLE "group_permissions" ADD CONSTRAINT "group_permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_permissions" ADD CONSTRAINT "group_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_variants" ADD CONSTRAINT "service_variants_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "service_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ============================================================================
-- DỮ LIỆU MẶC ĐỊNH (idempotent — chạy lại không tạo trùng)
-- Mật khẩu băm bcrypt bằng pgcrypto ($2a$10$…) — tương thích bcrypt của backend.
-- ĐỔI MẬT KHẨU admin@petshop.vn NGAY khi đưa lên production.
-- ============================================================================

-- Nhóm -----------------------------------------------------------------------
INSERT INTO groups (id, key, name, description, is_locked, updated_at) VALUES
  (gen_random_uuid()::text, 'admin',    'Nhóm Admin',    'Quản trị viên — toàn quyền hệ thống', true,  CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'monitor',  'Nhóm Monitor',  'Nhân viên (staff) — theo dõi lịch đặt và đăng bài', false, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'customer', 'Nhóm Customer', 'Khách hàng — mặc định khi đăng ký trên website', false, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO NOTHING;

-- Quyền ----------------------------------------------------------------------
INSERT INTO permissions (id, key, label) VALUES
  (gen_random_uuid()::text, 'admin.access',      'Vào khu quản trị'),
  (gen_random_uuid()::text, 'dashboard.revenue', 'Xem doanh thu & số liệu dịch vụ'),
  (gen_random_uuid()::text, 'bookings.view',     'Xem lịch đặt'),
  (gen_random_uuid()::text, 'bookings.manage',   'Xác nhận / hoàn thành / hủy lịch'),
  (gen_random_uuid()::text, 'posts.write',       'Viết bài và sửa/xóa bài của mình'),
  (gen_random_uuid()::text, 'posts.manage_all',  'Sửa/xóa bài của mọi người'),
  (gen_random_uuid()::text, 'services.manage',   'Quản lý dịch vụ'),
  (gen_random_uuid()::text, 'customers.view',    'Xem khách hàng'),
  (gen_random_uuid()::text, 'staff.manage',      'Quản lý nhân viên'),
  (gen_random_uuid()::text, 'groups.manage',     'Quản lý nhóm & tài khoản'),
  (gen_random_uuid()::text, 'settings.manage',   'Quản lý cấu hình hệ thống'),
  (gen_random_uuid()::text, 'account.view',      'Xem tài khoản & lịch sử đặt lịch của mình')
ON CONFLICT (key) DO NOTHING;

-- Quyền theo nhóm: admin = tất cả; monitor & customer theo mặc định
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM groups g CROSS JOIN permissions p WHERE g.key = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM groups g JOIN permissions p ON
     (g.key = 'monitor'  AND p.key IN ('admin.access', 'bookings.view', 'posts.write', 'account.view'))
  OR (g.key = 'customer' AND p.key IN ('account.view'))
ON CONFLICT DO NOTHING;

-- Cửa hàng -------------------------------------------------------------------
INSERT INTO stores (id, name, slug, address, phone, email, zalo_link, latitude, longitude, updated_at) VALUES
  (gen_random_uuid()::text, 'PetShop - Cửa hàng chính', 'cua-hang-chinh', '7 Chùa Bộc, Đống Đa, Hà Nội',
   '0971616634', 'info@petshop.vn', 'https://zalo.me/0971616634', 21.0050, 105.8250, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

-- Tài khoản mặc định ---------------------------------------------------------
-- Super Admin (không đổi nhóm / khóa / xóa được)
INSERT INTO staff (id, store_id, group_id, email, phone, password_hash, full_name, employee_code, position,
                   specialties, is_super_admin, hire_date, updated_at)
SELECT gen_random_uuid()::text, s.id, g.id, 'admin@petshop.vn', '0900000001', crypt('admin123', gen_salt('bf', 10)),
       'Super Admin', 'ADMIN001', 'ADMIN', ARRAY['management'], true, DATE '2024-01-01', CURRENT_TIMESTAMP
FROM stores s, groups g WHERE s.slug = 'cua-hang-chinh' AND g.key = 'admin'
ON CONFLICT (email) DO NOTHING;

-- Nhân viên mẫu (nhóm Monitor)
INSERT INTO staff (id, store_id, group_id, email, phone, password_hash, full_name, employee_code, position,
                   specialties, hire_date, updated_at)
SELECT gen_random_uuid()::text, s.id, g.id, 'monitor@petshop.vn', '0900000002', crypt('monitor123', gen_salt('bf', 10)),
       'Nhân viên Lễ tân', 'MON001', 'RECEPTIONIST', ARRAY['booking'], DATE '2024-06-01', CURRENT_TIMESTAMP
FROM stores s, groups g WHERE s.slug = 'cua-hang-chinh' AND g.key = 'monitor'
ON CONFLICT (email) DO NOTHING;

-- Khách hàng mẫu (nhóm Customer)
INSERT INTO users (id, group_id, email, phone, password_hash, full_name, updated_at)
SELECT gen_random_uuid()::text, g.id, 'khach@petshop.vn', '0912345678', crypt('khach123', gen_salt('bf', 10)),
       'Nguyễn Văn A', CURRENT_TIMESTAMP
FROM groups g WHERE g.key = 'customer'
ON CONFLICT (email) DO NOTHING;

-- Danh mục & dịch vụ -----------------------------------------------------------
INSERT INTO service_categories (id, name, slug, description, icon, display_order, updated_at) VALUES
  (gen_random_uuid()::text, 'Spa & Tắm',            'spa-tam',           'Dịch vụ tắm và spa thư giãn cho thú cưng', 'bath', 1, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Cắt tỉa & Grooming',   'cat-tia-grooming',  'Cắt tỉa lông tạo kiểu chuyên nghiệp', 'scissors', 2, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Chăm sóc đặc biệt',    'cham-soc-dac-biet', 'Dịch vụ chăm sóc chuyên sâu', 'heart', 3, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (id, category_id, name, slug, description, base_price, duration, features, display_order, is_featured, is_popular, updated_at)
SELECT gen_random_uuid()::text, c.id, v.name, v.slug, v.description, v.base_price, v.duration, v.features, v.ord, v.featured, v.popular, CURRENT_TIMESTAMP
FROM (VALUES
  ('spa-tam', 'Tắm vệ sinh cơ bản', 'tam-ve-sinh-co-ban', 'Tắm gội toàn thân với sữa tắm chuyên dụng, sấy khô, vệ sinh tai mắt mũi', 150000, 60,
     ARRAY['Tắm gội với sữa tắm phù hợp','Sấy khô lông','Vệ sinh tai','Vệ sinh mắt mũi','Chải lông'], 1, true, false),
  ('spa-tam', 'Tắm spa cao cấp', 'tam-spa-cao-cap', 'Trải nghiệm spa thư giãn với sản phẩm cao cấp, massage và dưỡng lông', 250000, 90,
     ARRAY['Tắm với sữa tắm cao cấp','Massage thư giãn 15 phút','Dưỡng lông với dầu xả','Sấy tạo kiểu','Nước hoa thơm nhẹ','Vệ sinh tai mắt mũi'], 2, true, true),
  ('cat-tia-grooming', 'Cắt tỉa lông cơ bản', 'cat-tia-long-co-ban', 'Cắt tỉa gọn gàng, tạo form chuẩn theo giống', 200000, 90,
     ARRAY['Tắm gội trước khi cắt','Cắt tỉa theo form chuẩn','Cắt móng','Vệ sinh tai','Sấy khô và chải lông'], 3, true, false),
  ('cat-tia-grooming', 'Cắt tỉa tạo kiểu nghệ thuật', 'cat-tia-tao-kieu-nghe-thuat', 'Cắt tỉa theo các kiểu dáng đặc biệt, nghệ thuật', 350000, 120,
     ARRAY['Tư vấn kiểu dáng phù hợp','Tắm gội cao cấp','Cắt tỉa nghệ thuật','Phụ kiện trang trí','Chụp ảnh kỷ niệm'], 4, true, true),
  ('cham-soc-dac-biet', 'Vệ sinh răng miệng', 've-sinh-rang-mieng', 'Đánh răng, vệ sinh răng miệng chuyên sâu', 180000, 30,
     ARRAY['Kiểm tra răng miệng','Đánh răng chuyên sâu','Loại bỏ cao răng nhẹ','Tư vấn chăm sóc răng'], 5, false, false),
  ('cham-soc-dac-biet', 'Vắt tuyến hôi', 'vat-tuyen-hoi', 'Vắt tuyến hôi, vệ sinh vùng hậu môn', 100000, 15,
     ARRAY['Vắt tuyến hôi chuyên nghiệp','Vệ sinh vùng hậu môn','Kiểm tra sức khỏe'], 6, false, false)
) AS v(cat, name, slug, description, base_price, duration, features, ord, featured, popular)
JOIN service_categories c ON c.slug = v.cat
ON CONFLICT (slug) DO NOTHING;

-- Giá theo kích thước (TOY / SMALL / MEDIUM / LARGE)
INSERT INTO service_variants (id, service_id, size, price, updated_at)
SELECT gen_random_uuid()::text, s.id, p.size::pet_size, p.price, CURRENT_TIMESTAMP
FROM (VALUES
  ('tam-ve-sinh-co-ban', 'TOY', 150000), ('tam-ve-sinh-co-ban', 'SMALL', 200000), ('tam-ve-sinh-co-ban', 'MEDIUM', 250000), ('tam-ve-sinh-co-ban', 'LARGE', 300000),
  ('tam-spa-cao-cap', 'TOY', 250000), ('tam-spa-cao-cap', 'SMALL', 300000), ('tam-spa-cao-cap', 'MEDIUM', 380000), ('tam-spa-cao-cap', 'LARGE', 450000),
  ('cat-tia-long-co-ban', 'TOY', 200000), ('cat-tia-long-co-ban', 'SMALL', 280000), ('cat-tia-long-co-ban', 'MEDIUM', 350000), ('cat-tia-long-co-ban', 'LARGE', 400000),
  ('cat-tia-tao-kieu-nghe-thuat', 'TOY', 350000), ('cat-tia-tao-kieu-nghe-thuat', 'SMALL', 450000), ('cat-tia-tao-kieu-nghe-thuat', 'MEDIUM', 550000), ('cat-tia-tao-kieu-nghe-thuat', 'LARGE', 600000),
  ('ve-sinh-rang-mieng', 'TOY', 180000), ('ve-sinh-rang-mieng', 'SMALL', 180000), ('ve-sinh-rang-mieng', 'MEDIUM', 180000), ('ve-sinh-rang-mieng', 'LARGE', 180000),
  ('vat-tuyen-hoi', 'TOY', 100000), ('vat-tuyen-hoi', 'SMALL', 100000), ('vat-tuyen-hoi', 'MEDIUM', 100000), ('vat-tuyen-hoi', 'LARGE', 100000)
) AS p(slug, size, price)
JOIN services s ON s.slug = p.slug
ON CONFLICT (service_id, size) DO NOTHING;

-- Bài viết mẫu -----------------------------------------------------------------
INSERT INTO posts (id, slug, title, excerpt, content, author_id, author_name, is_published, published_at, updated_at)
SELECT gen_random_uuid()::text, v.slug, v.title, v.excerpt, v.content, st.id, st.full_name, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('admin@petshop.vn', '5-meo-giu-long-cho-luon-muot-ma', '5 mẹo giữ lông chó luôn mượt mà',
   'Chải lông đúng cách, chọn sữa tắm phù hợp và chế độ ăn là chìa khóa.',
   E'Chải lông mỗi ngày giúp loại bỏ lông rụng và phân bổ dầu tự nhiên.\n\nChọn sữa tắm theo loại da, tắm 2-4 tuần một lần, và bổ sung omega-3 trong khẩu phần ăn.'),
  ('monitor@petshop.vn', 'khi-nao-nen-dua-meo-di-spa', 'Khi nào nên đưa mèo đi spa?',
   'Không phải bé mèo nào cũng cần tắm thường xuyên — vậy khi nào là phù hợp?',
   'Mèo tự liếm lông nên ít khi cần tắm. Hãy đưa bé đi spa khi lông bết dính, có mùi, hoặc bác sĩ khuyên dùng dầu gội dược liệu.')
) AS v(email, slug, title, excerpt, content)
JOIN staff st ON st.email = v.email
ON CONFLICT (slug) DO NOTHING;
