"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminServicesController = exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const services_service_1 = require("./services.service");
const service_dto_1 = require("./dto/service.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
let ServicesController = class ServicesController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    findAll() {
        return this.servicesService.findAll();
    }
    findCategories() {
        return this.servicesService.findCategories();
    }
    findByCategory(slug) {
        return this.servicesService.findByCategory(slug);
    }
    async findBySlug(slug) {
        const service = await this.servicesService.findBySlug(slug);
        if (!service)
            throw new common_1.NotFoundException(`Không tìm thấy dịch vụ "${slug}"`);
        return service;
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findCategories", null);
__decorate([
    (0, common_1.Get)('category/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "findBySlug", null);
exports.ServicesController = ServicesController = __decorate([
    (0, common_1.Controller)('api/services'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
let AdminServicesController = class AdminServicesController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    list() {
        return this.servicesService.adminList();
    }
    create(dto) {
        return this.servicesService.create(dto);
    }
    update(id, dto) {
        return this.servicesService.update(id, dto);
    }
    remove(id) {
        return this.servicesService.remove(id);
    }
};
exports.AdminServicesController = AdminServicesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminServicesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", void 0)
], AdminServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", void 0)
], AdminServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminServicesController.prototype, "remove", null);
exports.AdminServicesController = AdminServicesController = __decorate([
    (0, common_1.Controller)('api/admin/services'),
    (0, auth_decorator_1.Auth)('admin.access', 'services.manage'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], AdminServicesController);
//# sourceMappingURL=services.controller.js.map