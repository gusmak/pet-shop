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
exports.AdminBookingsController = exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const booking_dto_1 = require("./dto/booking.dto");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BookingsController = class BookingsController {
    bookings;
    constructor(bookings) {
        this.bookings = bookings;
    }
    create(dto, user) {
        return this.bookings.create(dto, user);
    }
    lookup(q) {
        return this.bookings.lookup(q.number, q.phone);
    }
    mine(userId) {
        return this.bookings.listMine(userId);
    }
    cancel(userId, id) {
        return this.bookings.cancelMine(userId, id);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('lookup'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_dto_1.LookupBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "lookup", null);
__decorate([
    (0, auth_decorator_1.Auth)('account.view'),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "mine", null);
__decorate([
    (0, auth_decorator_1.Auth)('account.view'),
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('api/bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
let AdminBookingsController = class AdminBookingsController {
    bookings;
    constructor(bookings) {
        this.bookings = bookings;
    }
    list(query) {
        return this.bookings.adminList(query);
    }
    updateStatus(id, dto, user) {
        return this.bookings.updateStatus(id, dto, user);
    }
};
exports.AdminBookingsController = AdminBookingsController;
__decorate([
    (0, auth_decorator_1.Auth)('admin.access', 'bookings.view'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_dto_1.ListBookingsQuery]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('admin.access', 'bookings.manage'),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, booking_dto_1.UpdateBookingStatusDto, Object]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "updateStatus", null);
exports.AdminBookingsController = AdminBookingsController = __decorate([
    (0, common_1.Controller)('api/admin/bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], AdminBookingsController);
//# sourceMappingURL=bookings.controller.js.map