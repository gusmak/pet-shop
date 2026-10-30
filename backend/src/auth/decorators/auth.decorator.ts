import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PERMS_KEY, type PermissionKey } from '../permissions';

// Đăng nhập + có đủ các quyền chỉ định. Dùng ở class hoặc method.
export const Auth = (...permissions: PermissionKey[]) =>
  applyDecorators(SetMetadata(PERMS_KEY, permissions), UseGuards(JwtAuthGuard, PermissionsGuard));
