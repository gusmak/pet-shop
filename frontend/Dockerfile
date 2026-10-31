# Next.js 16.4 + React 19 (build bằng Turbopack)
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* bị "nướng" vào bundle lúc build — phải truyền qua build-arg,
# KHÔNG thể set bằng environment ở runtime.
ARG NEXT_PUBLIC_API_URL=http://localhost:8060
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

# Production chạy trên port 3000 (dev mới dùng 3002)
CMD ["npm", "start"]