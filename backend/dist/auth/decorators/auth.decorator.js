"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
const permissions_1 = require("../permissions");
const Auth = (...permissions) => (0, common_1.applyDecorators)((0, common_1.SetMetadata)(permissions_1.PERMS_KEY, permissions), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard));
exports.Auth = Auth;
//# sourceMappingURL=auth.decorator.js.map