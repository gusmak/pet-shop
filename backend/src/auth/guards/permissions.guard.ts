import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMS_KEY } from '../permissions';
import type { AuthUser } from '../strategies/jwt.strategy';

// Yêu cầu user có ĐỦ mọi quyền khai báo bằng @Auth(...). Không khai báo quyền = chỉ cần đăng nhập.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [context.getHandler(), context.getClass()]) ?? [];
    const user: AuthUser | undefined = context.switchToHttp().getRequest().user;

    if (!user || !required.every((p) => user.permissions.includes(p))) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
