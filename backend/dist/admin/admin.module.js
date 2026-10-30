"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@adminjs/nestjs");
const client_1 = require("@prisma/client");
const prisma_module_1 = require("../prisma/prisma.module");
const prisma = new client_1.PrismaClient();
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
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            nestjs_1.AdminModule.createAdmin({
                adminJsOptions: {
                    rootPath: '/admin',
                    resources: adminOptions.resources,
                    branding: adminOptions.branding,
                    locale: adminOptions.locale,
                },
                auth: {
                    authenticate: async (email, password) => {
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
], AdminModule);
//# sourceMappingURL=admin.module.js.map