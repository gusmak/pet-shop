-- Nâng cấp DB đang chạy (đã init bằng schema.sql cũ) lên schema mới. Idempotent — chạy lại không sao.
--   * password_reset_tokens        : luồng "quên mật khẩu" qua email
--   * users/staff.password_changed_at: đổi mật khẩu => vô hiệu token cũ
-- Chạy (Docker):
--   docker compose exec -T postgres psql -U petshop -d petshop -v ON_ERROR_STOP=1 < backend/prisma/upgrades/2026-11-auth.sql
SET search_path TO "pet-shop";

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_account_type_account_id_idx" ON "password_reset_tokens"("account_type", "account_id");

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3);
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3);
