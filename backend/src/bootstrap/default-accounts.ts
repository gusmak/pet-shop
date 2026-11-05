import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Tài khoản mặc định — mật khẩu lấy hoàn toàn từ .env, KHÔNG có giá trị mặc định trong code.
// Idempotent: chỉ tạo tài khoản chưa tồn tại, không bao giờ ghi đè mật khẩu/nhóm đã có.
// Biến không đặt (hoặc để trống) => bỏ qua tài khoản đó.
export async function ensureDefaultAccounts(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv = process.env,
  log: (msg: string) => void = console.log,
) {
  const adminPassword = env.ADMIN_PASSWORD?.trim();
  const monitorPassword = env.MONITOR_PASSWORD?.trim();
  const guestPassword = env.GUEST_PASSWORD?.trim();
  // Email đăng nhập của 3 tài khoản mặc định (đổi được bằng .env, mặc định như bên dưới).
  const adminEmail = (env.ADMIN_EMAIL?.trim() || 'admin@petshop.vn').toLowerCase();
  const monitorEmail = (env.MONITOR_EMAIL?.trim() || 'monitor@petshop.vn').toLowerCase();
  const guestEmail = (env.GUEST_EMAIL?.trim() || 'guest@petshop.vn').toLowerCase();

  const [store, adminGroup, monitorGroup, customerGroup] = await Promise.all([
    prisma.store.findUnique({ where: { slug: 'cua-hang-chinh' } }),
    prisma.group.findUnique({ where: { key: 'admin' } }),
    prisma.group.findUnique({ where: { key: 'monitor' } }),
    prisma.group.findUnique({ where: { key: 'customer' } }),
  ]);
  if (!store || !adminGroup || !monitorGroup || !customerGroup) {
    log('⚠️  Chưa có nhóm/cửa hàng mặc định (chạy schema.sql hoặc npm run seed trước) — bỏ qua tạo tài khoản mặc định.');
    return;
  }

  // Admin: bắt buộc phải có ít nhất một tài khoản super admin để đăng nhập lần đầu.
  const hasAdmin = await prisma.staff.findUnique({ where: { email: adminEmail } });
  if (!hasAdmin) {
    if (!adminPassword) {
      const msg = `Chưa có tài khoản ${adminEmail} và ADMIN_PASSWORD trống — hãy đặt ADMIN_PASSWORD trong .env.`;
      if (env.NODE_ENV === 'production') throw new Error(msg);
      log(`⚠️  ${msg}`);
    } else {
      await prisma.staff.create({
        data: {
          email: adminEmail,
          phone: '0900000001',
          passwordHash: await bcrypt.hash(adminPassword, 10),
          fullName: 'Super Admin',
          employeeCode: 'ADMIN001',
          position: 'ADMIN',
          specialties: ['management'],
          isSuperAdmin: true,
          hireDate: new Date('2024-01-01'),
          storeId: store.id,
          groupId: adminGroup.id,
        },
      });
      log(`✅ Đã tạo tài khoản ${adminEmail}`);
    }
  }

  // Tài khoản mẫu (monitor/guest) không bắt buộc: lỗi (vd trùng SĐT với dữ liệu có sẵn) chỉ cảnh báo, không làm backend sập.
  const optional = async (name: string, create: () => Promise<unknown>) => {
    try {
      await create();
      log(`✅ Đã tạo tài khoản ${name}`);
    } catch (e) {
      const reason = e instanceof Error ? (e.message.trim().split(String.fromCharCode(10)).pop() ?? e.message) : String(e);
      log(`⚠️  Không tạo được tài khoản ${name}: ${reason}`);
    }
  };

  if (monitorPassword && !(await prisma.staff.findUnique({ where: { email: monitorEmail } }))) {
    await optional(monitorEmail, async () => prisma.staff.create({
      data: {
        email: monitorEmail,
        phone: '0900000002',
        passwordHash: await bcrypt.hash(monitorPassword, 10),
        fullName: 'Nhân viên Lễ tân',
        employeeCode: 'MON001',
        position: 'RECEPTIONIST',
        specialties: ['booking'],
        hireDate: new Date('2024-06-01'),
        storeId: store.id,
        groupId: monitorGroup.id,
      },
    }));
  }

  if (guestPassword && !(await prisma.user.findUnique({ where: { email: guestEmail } }))) {
    // Không gán SĐT: cột phone là duy nhất, dễ trùng với khách thật/khách mẫu cũ (khach@petshop.vn).
    await optional(guestEmail, async () => prisma.user.create({
      data: {
        email: guestEmail,
        passwordHash: await bcrypt.hash(guestPassword, 10),
        fullName: 'Khách hàng mẫu',
        groupId: customerGroup.id,
      },
    }));
  }
}
