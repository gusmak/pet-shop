import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Auth } from '../auth/decorators/auth.decorator';

// Ảnh được lưu vào <root>/uploads và serve tĩnh tại /uploads/<file> (xem main.ts + docker-compose volume).
const UPLOAD_DIR = join(process.cwd(), 'uploads');

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

@Controller('api/admin/uploads')
@Auth('admin.access', 'posts.write')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = EXT_BY_MIME[file.mimetype] ?? '.bin';
          cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (EXT_BY_MIME[file.mimetype]) cb(null, true);
        else cb(new BadRequestException('Chỉ chấp nhận ảnh JPG/PNG/WebP/GIF/AVIF'), false);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file ảnh');
    return { url: `/uploads/${file.filename}` };
  }
}