"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = getJwtSecret;
const DEV_SECRET = 'petshop-jwt-secret-change-me';
function getJwtSecret(config) {
    const secret = config.get('JWT_SECRET');
    if (secret)
        return secret;
    if (config.get('NODE_ENV') === 'production') {
        throw new Error('JWT_SECRET là bắt buộc khi NODE_ENV=production');
    }
    return DEV_SECRET;
}
//# sourceMappingURL=jwt-secret.js.map