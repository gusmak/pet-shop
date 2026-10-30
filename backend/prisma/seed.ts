import { PrismaClient, PetSize } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DEFAULT_GROUP_PERMISSIONS, GROUP_DEFS, PERMISSIONS } from '../src/auth/permissions';

// Idempotent: chạy lại không tạo trùng, và KHÔNG ghi đè mật khẩu/nhóm của tài khoản đã tồn tại.
// Dữ liệu tương đương phần "DỮ LIỆU MẶC ĐỊNH" trong ../../schema.sql.
const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hash(pw, 10);

async function main() {
  console.log('🌱 Seeding database...');

  // Nhóm & quyền
  for (const g of GROUP_DEFS) {
    await prisma.group.upsert({ where: { key: g.key }, update: {}, create: { ...g } });
  }
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: { label: p.label }, create: { ...p } });
  }
  for (const g of GROUP_DEFS) {
    const group = await prisma.group.findUniqueOrThrow({ where: { key: g.key } });
    // Chỉ gán quyền mặc định lần đầu (nhóm chưa có quyền nào) — không ghi đè phần admin đã tùy chỉnh.
    const existing = await prisma.groupPermission.count({ where: { groupId: group.id } });
    if (existing === 0 || g.isLocked) {
      const perms = await prisma.permission.findMany({ where: { key: { in: DEFAULT_GROUP_PERMISSIONS[g.key] } } });
      await prisma.groupPermission.createMany({
        data: perms.map((p) => ({ groupId: group.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }
  }
  console.log(`  ✅ ${GROUP_DEFS.length} groups, ${PERMISSIONS.length} permissions`);

  const store = await prisma.store.upsert({
    where: { slug: 'cua-hang-chinh' },
    update: {},
    create: {
      name: 'PetShop - Cửa hàng chính',
      slug: 'cua-hang-chinh',
      address: '7 Chùa Bộc, Đống Đa, Hà Nội',
      phone: '0971616634',
      email: 'info@petshop.vn',
      zaloLink: 'https://zalo.me/0971616634',
      latitude: 21.005,
      longitude: 105.825,
    },
  });

  const [adminGroup, monitorGroup, customerGroup] = await Promise.all(
    ['admin', 'monitor', 'customer'].map((key) => prisma.group.findUniqueOrThrow({ where: { key } })),
  );

  // Super Admin mặc định. Đặt SUPER_ADMIN_PASSWORD khi seed production; mặc định chỉ dành cho dev.
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  await prisma.staff.upsert({
    where: { email: 'admin@petshop.vn' },
    update: { isSuperAdmin: true, groupId: adminGroup.id },
    create: {
      email: 'admin@petshop.vn',
      phone: '0900000001',
      passwordHash: await hash(adminPassword),
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
  console.log(`  ✅ Super admin: admin@petshop.vn${process.env.SUPER_ADMIN_PASSWORD ? '' : ' / admin123  (ĐỔI MẬT KHẨU khi lên production)'}`);

  // Tài khoản mẫu cho dev/demo — bỏ qua khi SEED_DEMO_ACCOUNTS=false
  if (process.env.SEED_DEMO_ACCOUNTS !== 'false') {
    await prisma.staff.upsert({
      where: { email: 'monitor@petshop.vn' },
      update: {},
      create: {
        email: 'monitor@petshop.vn',
        phone: '0900000002',
        passwordHash: await hash('monitor123'),
        fullName: 'Nhân viên Lễ tân',
        employeeCode: 'MON001',
        position: 'RECEPTIONIST',
        specialties: ['booking'],
        hireDate: new Date('2024-06-01'),
        storeId: store.id,
        groupId: monitorGroup.id,
      },
    });
    await prisma.user.upsert({
      where: { email: 'khach@petshop.vn' },
      update: {},
      create: {
        email: 'khach@petshop.vn',
        phone: '0912345678',
        passwordHash: await hash('khach123'),
        fullName: 'Nguyễn Văn A',
        groupId: customerGroup.id,
      },
    });
    console.log('  ✅ Demo: monitor@petshop.vn / monitor123, khach@petshop.vn / khach123');
  }

  // Danh mục & dịch vụ
  const categories = [
    { name: 'Spa & Tắm', slug: 'spa-tam', description: 'Dịch vụ tắm và spa thư giãn cho thú cưng', icon: 'bath', displayOrder: 1 },
    { name: 'Cắt tỉa & Grooming', slug: 'cat-tia-grooming', description: 'Cắt tỉa lông tạo kiểu chuyên nghiệp', icon: 'scissors', displayOrder: 2 },
    { name: 'Chăm sóc đặc biệt', slug: 'cham-soc-dac-biet', description: 'Dịch vụ chăm sóc chuyên sâu', icon: 'heart', displayOrder: 3 },
  ];
  for (const c of categories) await prisma.serviceCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });

  const sizes: PetSize[] = ['TOY', 'SMALL', 'MEDIUM', 'LARGE'];
  const services = [
    { cat: 'spa-tam', slug: 'tam-ve-sinh-co-ban', name: 'Tắm vệ sinh cơ bản', description: 'Tắm gội toàn thân với sữa tắm chuyên dụng, sấy khô, vệ sinh tai mắt mũi', basePrice: 150000, duration: 60, features: ['Tắm gội với sữa tắm phù hợp', 'Sấy khô lông', 'Vệ sinh tai', 'Vệ sinh mắt mũi', 'Chải lông'], prices: [150000, 200000, 250000, 300000], isFeatured: true },
    { cat: 'spa-tam', slug: 'tam-spa-cao-cap', name: 'Tắm spa cao cấp', description: 'Trải nghiệm spa thư giãn với sản phẩm cao cấp, massage và dưỡng lông', basePrice: 250000, duration: 90, features: ['Tắm với sữa tắm cao cấp', 'Massage thư giãn 15 phút', 'Dưỡng lông với dầu xả', 'Sấy tạo kiểu', 'Nước hoa thơm nhẹ', 'Vệ sinh tai mắt mũi'], prices: [250000, 300000, 380000, 450000], isFeatured: true, isPopular: true },
    { cat: 'cat-tia-grooming', slug: 'cat-tia-long-co-ban', name: 'Cắt tỉa lông cơ bản', description: 'Cắt tỉa gọn gàng, tạo form chuẩn theo giống', basePrice: 200000, duration: 90, features: ['Tắm gội trước khi cắt', 'Cắt tỉa theo form chuẩn', 'Cắt móng', 'Vệ sinh tai', 'Sấy khô và chải lông'], prices: [200000, 280000, 350000, 400000], isFeatured: true },
    { cat: 'cat-tia-grooming', slug: 'cat-tia-tao-kieu-nghe-thuat', name: 'Cắt tỉa tạo kiểu nghệ thuật', description: 'Cắt tỉa theo các kiểu dáng đặc biệt, nghệ thuật', basePrice: 350000, duration: 120, features: ['Tư vấn kiểu dáng phù hợp', 'Tắm gội cao cấp', 'Cắt tỉa nghệ thuật', 'Phụ kiện trang trí', 'Chụp ảnh kỷ niệm'], prices: [350000, 450000, 550000, 600000], isFeatured: true, isPopular: true },
    { cat: 'cham-soc-dac-biet', slug: 've-sinh-rang-mieng', name: 'Vệ sinh răng miệng', description: 'Đánh răng, vệ sinh răng miệng chuyên sâu', basePrice: 180000, duration: 30, features: ['Kiểm tra răng miệng', 'Đánh răng chuyên sâu', 'Loại bỏ cao răng nhẹ', 'Tư vấn chăm sóc răng'], prices: [180000, 180000, 180000, 180000] },
    { cat: 'cham-soc-dac-biet', slug: 'vat-tuyen-hoi', name: 'Vắt tuyến hôi', description: 'Vắt tuyến hôi, vệ sinh vùng hậu môn', basePrice: 100000, duration: 15, features: ['Vắt tuyến hôi chuyên nghiệp', 'Vệ sinh vùng hậu môn', 'Kiểm tra sức khỏe'], prices: [100000, 100000, 100000, 100000] },
  ];
  for (const [i, s] of services.entries()) {
    const category = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: s.cat } });
    const { cat, prices, ...data } = s;
    void cat;
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: { ...data, categoryId: category.id, displayOrder: i + 1 },
    });
    for (const [j, size] of sizes.entries()) {
      await prisma.serviceVariant.upsert({
        where: { serviceId_size: { serviceId: service.id, size } },
        update: {},
        create: { serviceId: service.id, size, price: prices[j] },
      });
    }
  }
  console.log(`  ✅ ${categories.length} categories, ${services.length} services`);

  // Bài viết mẫu
  const posts = [
    { email: 'admin@petshop.vn', slug: '5-meo-giu-long-cho-luon-muot-ma', title: '5 mẹo giữ lông chó luôn mượt mà', excerpt: 'Chải lông đúng cách, chọn sữa tắm phù hợp và chế độ ăn là chìa khóa.', content: 'Chải lông mỗi ngày giúp loại bỏ lông rụng và phân bổ dầu tự nhiên.\n\nChọn sữa tắm theo loại da, tắm 2-4 tuần một lần, và bổ sung omega-3 trong khẩu phần ăn.' },
    { email: 'monitor@petshop.vn', slug: 'khi-nao-nen-dua-meo-di-spa', title: 'Khi nào nên đưa mèo đi spa?', excerpt: 'Không phải bé mèo nào cũng cần tắm thường xuyên — vậy khi nào là phù hợp?', content: 'Mèo tự liếm lông nên ít khi cần tắm. Hãy đưa bé đi spa khi lông bết dính, có mùi, hoặc bác sĩ khuyên dùng dầu gội dược liệu.' },
  ];
  for (const p of posts) {
    const author = await prisma.staff.findUnique({ where: { email: p.email } });
    if (!author) continue; // tài khoản mẫu bị tắt
    const { email, ...data } = p;
    void email;
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, authorId: author.id, authorName: author.fullName, isPublished: true, publishedAt: new Date() },
    });
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
