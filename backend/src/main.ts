import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Sau reverse proxy (nginx, Cloudflare...) phải bật để rate-limit thấy IP thật của khách thay vì IP của proxy.
  // TRUST_PROXY = số tầng proxy (vd 1) hoặc 'true'. Không đặt = không tin header X-Forwarded-For.
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy) app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === 'true');

  // Serve ảnh upload (backend/uploads) tại /uploads/<file>
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.enableCors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:3002').split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Chuỗi origin phân tách bằng dấu phẩy, vd: https://petshop.vn,https://www.petshop.vn
  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Backend running on: http://localhost:${port}`);

}
void bootstrap();
