import { Module } from '@nestjs/common';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';

const prisma = new PrismaClient();

const adminOptions = {
  resources: [
    {
      resource: { model: 'Service', client: prisma },
      options: {
        navigation: { name: 'Quản lý dịch vụ', icon: 'Briefcase' },
        listProperties: ['id', 'name', 'category', 'basePrice', 'duration', 'isActive'],
        filterProperties: ['name', 'category', 'isActive'],
        editProperties: ['name', 'slug', 'description', 'categoryId', 'basePrice', 'duration', 'isActive'],
        showProperties: ['id', 'name', 'slug', 'description', 'basePrice', 'duration', 'isActive', 'createdAt'],
      },
    },
    {
      resource: { model: 'ServiceCategory', client: prisma },
      options: {
        navigation: { name: 'Quản lý dịch vụ', icon: 'Briefcase' },
        listProperties: ['id', 'name', 'slug', 'isActive'],
        editProperties: ['name', 'slug', 'description', 'displayOrder', 'isActive'],
      },
    },
    {
      resource: { model: 'Booking', client: prisma },
      options: {
        navigation: { name: 'Quản lý đặt lịch', icon: 'Calendar' },
        listProperties: ['id', 'bookingNumber', 'user', 'pet', 'status', 'date', 'total'],
        filterProperties: ['status', 'date', 'store'],
        editProperties: ['status', 'staffNotes', 'adminNotes'],
        showProperties: ['id', 'bookingNumber', 'userId', 'petId', 'storeId', 'date', 'startTime', 'endTime', 'status', 'total', 'customerNotes', 'staffNotes', 'createdAt'],
      },
    },
    {
      resource: { model: 'User', client: prisma },
      options: {
        navigation: { name: 'Quản lý người dùng', icon: 'Users' },
        listProperties: ['id', 'email', 'fullName', 'phone', 'isActive', 'createdAt'],
        filterProperties: ['email', 'fullName', 'isActive'],
        editProperties: ['fullName', 'phone', 'address', 'isActive'],
      },
    },
    {
      resource: { model: 'Staff', client: prisma },
      options: {
        navigation: { name: 'Quản lý nhân viên', icon: 'UserCheck' },
        listProperties: ['id', 'fullName', 'email', 'position', 'storeId', 'isActive'],
        filterProperties: ['position', 'storeId', 'isActive'],
        editProperties: ['fullName', 'email', 'phone', 'position', 'specialties', 'storeId', 'isActive'],
      },
    },
    {
      resource: { model: 'Store', client: prisma },
      options: {
        navigation: { name: 'Quản lý cửa hàng', icon: 'Home' },
        listProperties: ['id', 'name', 'address', 'phone', 'isActive'],
        editProperties: ['name', 'slug', 'address', 'phone', 'email', 'openingHours', 'isActive'],
      },
    },
    {
      resource: { model: 'Pet', client: prisma },
      options: {
        navigation: { name: 'Quản lý thú cưng', icon: 'Heart' },
        listProperties: ['id', 'name', 'species', 'breed', 'owner', 'isActive'],
        filterProperties: ['species', 'isActive'],
      },
    },
  ],
  branding: {
    companyName: 'PetShop Admin',
    theme: {
      colors: {
        primary100: '#fff7ed',
        primary800: '#ea580c',
      },
    },
  },
  locale: {
    language: 'vi',
    translations: {
      vi: {
        labels: {
          navigation: 'Điều hướng',
          dashboard: 'Tổng quan',
          actions: {
            new: 'Tạo mới',
            edit: 'Sửa',
            show: 'Xem',
            delete: 'Xóa',
            bulkDelete: 'Xóa hàng loạt',
            list: 'Danh sách',
          },
          buttons: {
            save: 'Lưu',
            addNewItem: 'Thêm mới',
            filter: 'Lọc',
            applyChanges: 'Áp dụng thay đổi',
            resetFilter: 'Đặt lại bộ lọc',
            confirmRemovalMany: 'Xác nhận xóa {{count}} bản ghi',
            logout: 'Đăng xuất',
            login: 'Đăng nhập',
            seeTheDocumentation: 'Xem tài liệu',
            createFirstRecord: 'Tạo bản ghi đầu tiên',
          },
          properties: {
            createdAt: 'Ngày tạo',
            updatedAt: 'Ngày cập nhật',
          },
        },
      },
    },
  },
};

@Module({
  imports: [
    PrismaModule,
    AdminJSModule.createAdmin({
      adminJsOptions: {
        rootPath: '/admin',
        resources: adminOptions.resources,
        branding: adminOptions.branding,
        locale: adminOptions.locale,
      },
      auth: {
        authenticate: async (email: string, password: string) => {
          // TODO: Implement proper authentication
          // For now, use hardcoded credentials
          if (email === 'admin@petshop.vn' && password === 'admin123') {
            return { email };
          }
          return null;
        },
        cookieName: 'adminjs',
        cookiePassword: 'petshop-admin-secret-key-change-in-production',
      },
    }),
  ],
})
export class AdminModule {}
