# 🐾 Kiến Trúc Công Nghệ Website Pet Shop

> **Ngày tạo:** 27/10/2026  
> **Mục tiêu:** Xây dựng website cho thương hiệu cá nhân, bắt đầu từ 1 cửa hàng với khả năng mở rộng thành chuỗi

---

## 📋 Tổng Quan Dự Án

### Mục Tiêu Kinh Doanh
- **Giai đoạn 1:** 1 cửa hàng pet services (spa, grooming, bán phụ kiện)
- **Giai đoạn 2:** Mở rộng thành chuỗi 3-5 cửa hàng
- **Giai đoạn 3:** Franchise hoặc 10+ cửa hàng

### Yêu Cầu Chính
- Website giới thiệu thương hiệu và dịch vụ
- Hệ thống đặt lịch online
- Quản lý khách hàng và thú cưng
- Tích hợp thanh toán online
- Quản lý nhiều chi nhánh (khi mở rộng)
- Báo cáo và analytics

---

## 🏗️ Kiến Trúc Đề Xuất

### Tech Stack

#### Frontend (Khách hàng)
```
Framework: Next.js 14+ (App Router)
UI Library: React 18+
Styling: Tailwind CSS + Shadcn/ui
State Management: Zustand hoặc React Query
i18n: next-intl (Việt/Anh)
```

**Lý do chọn Next.js:**
- SEO tốt (SSR/SSG) - quan trọng cho local business
- Performance cao
- Dễ scale khi thêm features
- Ecosystem lớn, nhiều thư viện

#### Backend (API & Business Logic)
```
Framework: NestJS (Node.js) hoặc FastAPI (Python)
API Style: RESTful + GraphQL (optional)
Authentication: JWT + OAuth2 (Google, Facebook)
Validation: Zod hoặc Joi
```

**Lý do chọn NestJS:**
- TypeScript full-stack
- Architecture rõ ràng (modules, controllers, services)
- Dễ maintain và scale
- Tích hợp tốt với TypeORM/Prisma

#### Database
```
Primary: PostgreSQL 15+
Cache: Redis
Search: Elasticsearch (optional, khi scale)
```

**Lý do chọn PostgreSQL:**
- Strong consistency (quan trọng cho bookings, payments)
- JSON support (linh hoạt cho product attributes)
- Scalable
- Free và open-source

#### ORM
```
Lựa chọn 1: Prisma (Recommended)
- Type-safe
- Auto-generated migrations
- Great DX

Lựa chọn 2: TypeORM
- Mature, battle-tested
- Active record + Data mapper patterns
```

#### Cloud & Infrastructure
```
Hosting: Vercel (Frontend) + Railway/Render (Backend)
Database: Supabase (PostgreSQL + Auth) hoặc PlanetScale
Storage: Cloudflare R2 hoặc AWS S3 (images)
CDN: Cloudflare
Email: Resend hoặc SendGrid
SMS: Twilio (optional)
```

**Chi phí ước tính (Giai đoạn 1):**
- Vercel Hobby: Free
- Railway: $5-20/month
- Supabase: Free tier (500MB DB)
- Cloudflare: Free
- **Tổng: ~$10-30/tháng**

---

## 🎯 Tính Năng Theo Giai Đoạn

### Giai Đoạn 1: Single Store (MVP - 2-3 tháng)

#### Website Công Khai
- [ ] Trang chủ giới thiệu
- [ ] Trang dịch vụ (Spa, Grooming, Hotel, Vet)
- [ ] Trang sản phẩm (catalog)
- [ ] Trang về chúng tôi
- [ ] Blog/tin tức
- [ ] Liên hệ

#### Hệ Thống Đặt Lịch
- [ ] Xem lịch trống theo dịch vụ
- [ ] Chọn ngày giờ
- [ ] Điền thông tin thú cưng
- [ ] Xác nhận qua email/SMS
- [ ] Nhắc nhở tự động (24h trước)

#### Quản Lý Khách Hàng (CRM cơ bản)
- [ ] Đăng ký/đăng nhập
- [ ] Profile khách hàng
- [ ] Danh sách thú cưng
- [ ] Lịch sử đặt lịch
- [ ] Lịch sử dịch vụ

#### Admin Dashboard
- [ ] Quản lý bookings
- [ ] Quản lý khách hàng
- [ ] Quản lý dịch vụ & giá
- [ ] Báo cáo cơ bản (doanh thu, bookings)
- [ ] Quản lý nội dung (blog, banners)

#### Thanh Toán
- [ ] Tích hợp MoMo/ZaloPay/VNPay
- [ ] Thanh toán khi đến nơi (COD)
- [ ] Hóa đơn tự động

### Giai Đoạn 2: Multi-Store (3-6 tháng sau)

#### Multi-Location Features
- [ ] Quản lý nhiều chi nhánh
- [ ] Đặt lịch theo chi nhánh
- [ ] Phân quyền theo chi nhánh (Store Manager)
- [ ] Báo cáo theo chi nhánh
- [ ] Chuyển đổi chi nhánh trên UI

#### Nâng Cao
- [ ] Loyalty program (tích điểm)
- [ ] Gift cards/vouchers
- [ ] Referral program
- [ ] Email marketing automation
- [ ] SMS marketing
- [ ] Chatbot tư vấn (AI)

#### Mobile App (Optional)
- [ ] React Native hoặc Flutter
- [ ] Push notifications
- [ ] QR code check-in
- [ ] Mobile payment

### Giai Đoạn 3: Scale & Franchise (6-12 tháng)

#### Enterprise Features
- [ ] Franchise management
- [ ] Centralized inventory
- [ ] Advanced analytics & BI
- [ ] API cho partners
- [ ] White-label solution
- [ ] Multi-language (tiếng Anh cho expats)

---

## 📊 Database Schema (Core Entities)

### Users & Authentication
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  password      String
  fullName      String
  role          Role      @default(CUSTOMER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  pets          Pet[]
  bookings      Booking[]
  addresses     Address[]
}

enum Role {
  CUSTOMER
  STAFF
  MANAGER
  ADMIN
}
```

### Pets (Thú Cưng)
```prisma
model Pet {
  id            String    @id @default(cuid())
  name          String
  species       String    // Dog, Cat, etc.
  breed         String?   // Poodle, Persian, etc.
  birthDate     DateTime?
  weight        Float?    // kg
  gender        Gender
  color         String?
  notes         String?
  
  ownerId       String
  owner         User      @relation(fields: [ownerId], references: [id])
  
  medicalRecords MedicalRecord[]
  bookings      Booking[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Gender {
  MALE
  FEMALE
}
```

### Services & Pricing
```prisma
model Service {
  id            String    @id @default(cuid())
  name          String
  description   String
  category      ServiceCategory
  basePrice     Float
  duration      Int       // minutes
  
  variants      ServiceVariant[]
  bookings      Booking[]
}

model ServiceVariant {
  id            String    @id @default(cuid())
  serviceId     String
  size          String    // Small, Medium, Large
  price         Float
  
  service       Service   @relation(fields: [serviceId], references: [id])
}

enum ServiceCategory {
  SPA
  GROOMING
  HOTEL
  VET
  TAXI
}
```

### Bookings
```prisma
model Booking {
  id            String    @id @default(cuid())
  userId        String
  petId         String
  serviceId     String
  storeId       String
  
  startTime     DateTime
  endTime       DateTime
  status        BookingStatus @default(PENDING)
  
  notes         String?
  totalPrice    Float
  
  user          User      @relation(fields: [userId], references: [id])
  pet           Pet       @relation(fields: [petId], references: [id])
  service       Service   @relation(fields: [serviceId], references: [id])
  store         Store     @relation(fields: [storeId], references: [id])
  
  payment       Payment?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Stores (Multi-Location)
```prisma
model Store {
  id            String    @id @default(cuid())
  name          String
  address       String
  phone         String
  email         String
  
  latitude      Float?
  longitude     Float?
  
  openingHours  Json      // { "mon": { "open": "08:00", "close": "20:00" }, ... }
  
  isActive      Boolean   @default(true)
  
  bookings      Booking[]
  staff         Staff[]
  inventory     InventoryItem[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Payments
```prisma
model Payment {
  id            String    @id @default(cuid())
  bookingId     String    @unique
  amount        Float
  method        PaymentMethod
  status        PaymentStatus
  
  transactionId String?
  paidAt        DateTime?
  
  booking       Booking   @relation(fields: [bookingId], references: [id])
  
  createdAt     DateTime  @default(now())
}

enum PaymentMethod {
  CASH
  MOMO
  ZALOPAY
  VNPAY
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

---

## 🔌 Tích Hợp Bên Ngoài

### Payment Gateways
```javascript
// MoMo
- API: https://developers.momo.vn
- Phí: 1.5% - 2%
- Thời gian: T+1

// ZaloPay
- API: https://docs.zalopay.vn
- Phí: 1.5% - 2%
- Thời gian: T+1

// VNPay
- API: https://sandbox.vnpayment.vn
- Phí: 1.5% - 2.5%
- Thời gian: T+1
```

### Notifications
```javascript
// Email
- Provider: Resend hoặc SendGrid
- Use cases: Booking confirmation, reminders, receipts
- Template engine: React Email hoặc MJML

// SMS
- Provider: Twilio hoặc eSMS (Vietnam)
- Use cases: OTP, booking reminders
- Cost: ~500-1000 VND/SMS

// Zalo OA (Optional)
- API: https://developers.zalo.me
- Use cases: Chatbot, notifications
- Advantage: Popular in Vietnam
```

### Maps & Location
```javascript
// Google Maps
- Embed store locations
- Directions
- Geocoding
- Cost: Free tier (28,500 map loads/month)

// Alternative: Mapbox
- Cheaper at scale
- Better customization
```

### Calendar Integration
```javascript
// Google Calendar Sync (Optional)
- Sync bookings với calendar cá nhân
- Useful cho staff

// Cal.com (Self-hosted)
- Open-source scheduling
- Customizable
- Free
```

---

## 🚀 Deployment & DevOps

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
- Lint & Type check
- Run tests (unit + integration)
- Build Docker images
- Deploy to staging (auto)
- Deploy to production (manual)
```

### Environment Setup
```bash
# Development
- Local: Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- Hot reload cho development

# Staging
- Branch: develop
- Auto-deploy khi merge vào develop
- Test environment cho QA

# Production
- Branch: main
- Manual deploy sau khi approve
- Zero-downtime deployment
```

### Monitoring & Logging
```javascript
// Error tracking
- Sentry: Free tier (5k events/month)

// Analytics
- Google Analytics 4
- Mixpanel (user behavior)
- PostHog (self-hosted alternative)

// Uptime monitoring
- UptimeRobot (free)
- Better Uptime (paid)

// Logging
- Datadog (expensive)
- Grafana + Loki (self-hosted, free)
```

---

## 💰 Chi Phí Ước Tính

### Giai Đoạn 1 (Single Store)

#### Infrastructure (Monthly)
```
Hosting (Vercel + Railway):     $20-30
Database (Supabase):            $0-25
Storage (Cloudflare R2):        $0-5
Domain (.vn):                   ~$15/year
SSL Certificate:                Free (Let's Encrypt)
-------------------------------------------
Total:                          ~$25-60/month (~600k-1.5M VND)
```

#### Development (One-time)
```
Thiết kế UI/UX:                 10-20M VND
Frontend development:           30-50M VND
Backend development:            40-60M VND
Testing & QA:                   10-15M VND
-------------------------------------------
Total:                          90-145M VND
```

**Alternative:** Self-develop (nếu có technical skills)
- Time: 2-3 tháng full-time
- Cost: Only infrastructure (~600k-1.5M VND/month)

### Giai Đoạn 2 (Multi-Store)

#### Additional Costs (Monthly)
```
Scaling infrastructure:         +$50-100
Payment gateway fees:           1.5-2% per transaction
SMS notifications:              ~500k-1M VND/month
Email service:                  ~200k-500k VND/month
-------------------------------------------
Total additional:               ~2-4M VND/month
```

#### Development (One-time)
```
Multi-store features:           30-50M VND
Loyalty program:                15-25M VND
Mobile app (optional):          80-150M VND
-------------------------------------------
Total:                          125-225M VND
```

---

## 📅 Roadmap Đề Xuất

### Tháng 1-2: Foundation
- [ ] Finalize requirements & wireframes
- [ ] Setup repository & CI/CD
- [ ] Database schema & API design
- [ ] Basic authentication system
- [ ] Core UI components

### Tháng 2-3: MVP Features
- [ ] Website công khai (homepage, services, about)
- [ ] Booking system (basic)
- [ ] Admin dashboard (basic)
- [ ] Payment integration (1 gateway)
- [ ] Email notifications

### Tháng 3: Launch & Iterate
- [ ] Beta testing với khách hàng thật
- [ ] Fix bugs & UX improvements
- [ ] SEO optimization
- [ ] Google My Business setup
- [ ] Social media integration
- [ ] **LAUNCH** 🚀

### Tháng 4-6: Growth
- [ ] Loyalty program
- [ ] Advanced booking features
- [ ] Inventory management
- [ ] Enhanced reporting
- [ ] Mobile app planning

### Tháng 7-12: Scale
- [ ] Multi-store features
- [ ] Franchise system design
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] API for partners

---

## 🎨 UI/UX Guidelines

### Design System
```
Colors:
- Primary: Warm orange/brown (pet-friendly)
- Secondary: Soft green/blue
- Accent: Playful yellow

Typography:
- Heading: Be Vietnam Pro hoặc Montserrat
- Body: Inter hoặc Roboto

Spacing: 8px grid system
Border radius: 8-12px (friendly feel)
```

### Key Pages
```
1. Homepage
   - Hero section với CTA "Đặt lịch ngay"
   - Services showcase
   - Testimonials
   - Store locations (map)

2. Services Page
   - Filter by category
   - Price table
   - "Book now" button

3. Booking Flow
   - Step 1: Select service
   - Step 2: Select date/time
   - Step 3: Pet information
   - Step 4: Confirm & pay

4. Admin Dashboard
   - Today's bookings
   - Revenue chart
   - Customer list
   - Quick actions
```

---

## 🔒 Security Considerations

### Must-Have
```
✓ HTTPS everywhere
✓ JWT authentication with refresh tokens
✓ Rate limiting (API)
✓ Input validation & sanitization
✓ SQL injection prevention (ORM)
✓ XSS protection
✓ CORS configuration
✓ Environment variables (no secrets in code)
```

### Nice-to-Have
```
✓ 2FA for admin accounts
✓ Audit logs
✓ GDPR compliance (nếu có khách EU)
✓ Regular security audits
✓ Penetration testing
```

---

## 📚 Tài Liệu Tham Khảo

### Competitors Analysis
- tropicpet.vn - Spa chuyên nghiệp
- pethealth.vn - Hệ thống y tế
- petmart.vn - Chuỗi pet shop
- kimipet.vn - Spa + đào tạo

### Tech Resources
- Next.js: https://nextjs.org/docs
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- Tailwind: https://tailwindcss.com/docs

### Payment Integration
- MoMo: https://developers.momo.vn
- ZaloPay: https://docs.zalopay.vn
- VNPay: https://sandbox.vnpayment.vn

---

## ❓ Câu Hỏi Cần Trả Lời

### Trước Khi Bắt Đầu
1. **Tên thương hiệu là gì?** (domain, logo, branding)
2. **Dịch vụ chính:** Spa, grooming, hotel, vet, hay tất cả?
3. **Sản phẩm:** Có bán phụ kiện không? Inventory management?
4. **Đối tượng khách hàng:** Local, expats, hay cả hai?
5. **Ngân sách:** Self-develop hay thuê agency?
6. **Timeline:** Khi nào muốn launch?

### Technical Decisions
1. **Backend:** NestJS hay FastAPI?
2. **Database hosting:** Supabase hay self-host?
3. **Payment:** MoMo, ZaloPay, hay cả hai?
4. **Mobile app:** React Native hay Flutter?
5. **Analytics:** Google Analytics hay Mixpanel?

---

## 📝 Ghi Chú

- **Bắt đầu nhỏ, scale dần** - Đừng cố build tất cả cùng lúc
- **Focus vào UX** - Khách hàng pet owners thường bận rộn, cần booking nhanh
- **Mobile-first** - 70%+ traffic sẽ từ mobile
- **SEO local** - Quan trọng cho local business (Google My Business, local keywords)
- **Customer retention** - Loyalty program và personalized marketing
- **Data-driven** - Track mọi thứ để optimize

---

**Cập nhật lần cuối:** 27/10/2026  
**Trạng thái:** Draft - Cần review và finalize
