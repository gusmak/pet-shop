# PetShop Backend API

NestJS backend cho PetShop - Dịch vụ spa & grooming thú cưng

## 🚀 Cài đặt

### 1. Install dependencies
```bash
cd backend
npm install
npm install @prisma/client @nestjs/config class-validator class-transformer
npm install prisma --save-dev
```

### 2. Setup Database

#### Tạo file .env
```bash
cp .env.example .env
```

Cập nhật `DATABASE_URL` trong `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/petshop?schema=public"
PORT=8000
FRONTEND_URL=http://localhost:3000
```

#### Tạo database PostgreSQL
```sql
CREATE DATABASE petshop;
```

#### Import schema (2 cách)

**Cách 1: Dùng SQL file**
```bash
# Import schema.sql vào PostgreSQL
psql -U postgres -d petshop -f ../schema.sql
```

**Cách 2: Dùng Prisma (Recommended)**
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 3. Chạy server

**Development:**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

Server sẽ chạy tại: **http://localhost:8000**

## 📚 API Endpoints

### Services (Dịch vụ)
```http
GET /api/services
GET /api/services/:slug
GET /api/services/categories
GET /api/services/category/:slug
```

### Bookings (Đặt lịch)
```http
POST /api/bookings
GET /api/bookings/user/:userId
GET /api/bookings/:id
```

**POST /api/bookings body:**
```json
{
  "userId": "uuid",
  "petId": "uuid",
  "storeId": "uuid",
  "serviceId": "uuid",
  "variantId": "uuid (optional)",
  "date": "2026-10-30",
  "startTime": "2026-10-30T10:00:00Z",
  "endTime": "2026-10-30T11:00:00Z",
  "notes": "Ghi chú (optional)"
}
```

### Contact (Liên hệ)
```http
POST /api/contact
```

**POST /api/contact body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "email@example.com",
  "phone": "0912345678",
  "subject": "booking",
  "message": "Nội dung tin nhắn"
}
```

## 🏗️ Cấu trúc thư mục

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── services/
│   │   ├── services.module.ts
│   │   ├── services.service.ts
│   │   └── services.controller.ts
│   ├── bookings/
│   │   ├── bookings.module.ts
│   │   ├── bookings.service.ts
│   │   ├── bookings.controller.ts
│   │   └── dto/
│   │       └── create-booking.dto.ts
│   ├── contact/
│   │   ├── contact.module.ts
│   │   ├── contact.service.ts
│   │   ├── contact.controller.ts
│   │   └── dto/
│   │       └── create-contact.dto.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
└── package.json
```

## 🔧 Development

### Xem database với Prisma Studio
```bash
npx prisma studio
```

### Reset database
```bash
npx prisma migrate reset
```

### Tạo migration mới
```bash
npx prisma migrate dev --name migration_name
```

## 📝 Notes

- Backend chạy trên port **8000**
- Frontend chạy trên port **3000**
- CORS đã được enable cho frontend
- Validation enabled với class-validator
- Tất cả API endpoints bắt đầu với `/api/`

## 🐛 Troubleshooting

### Lỗi: Cannot find module '@prisma/client'
```bash
npm install @prisma/client
npx prisma generate
```

### Lỗi: Database connection failed
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra database "petshop" đã được tạo

### Lỗi: Port 8000 already in use
- Đổi PORT trong .env
- Hoặc kill process đang dùng port 8000

## 📞 Support

Hotline: 0971 616 634
Zalo: https://zalo.me/0971616634
