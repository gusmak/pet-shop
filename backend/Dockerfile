# NestJS 12 + Prisma 5.22 (PostgreSQL)
# Node 20 (KHÔNG dùng Node 24: AdminJS v7 + @adminjs/nestjs v7 chạy lỗi trên Node 24)
FROM node:20-slim

# Build tools cho bcrypt@6 (native module) phòng khi không có prebuilt binary
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài ĐẦY ĐỦ dependencies (gồm devDependencies) — cần @nestjs/cli, typescript, prisma để build
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source và build
COPY . .
RUN npx prisma generate \
  && npm run build

EXPOSE 8000

# "node dist/main.js" tương đương start:prod
CMD ["node", "dist/main.js"]