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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookingStatusDto = exports.ListBookingsQuery = exports.LookupBookingDto = exports.CreateBookingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const normalize_1 = require("../../common/normalize");
class CreateBookingDto {
    customerName;
    customerPhone;
    customerEmail;
    petName;
    petSpecies;
    petSize;
    services;
    date;
    time;
    notes;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "customerName", void 0);
__decorate([
    (0, normalize_1.NormalizePhone)(),
    (0, class_validator_1.Matches)(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "customerPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Lowercase)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "customerEmail", void 0);
__decorate([
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "petName", void 0);
__decorate([
    (0, normalize_1.Uppercase)(),
    (0, class_validator_1.IsEnum)(client_1.PetSpecies),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "petSpecies", void 0);
__decorate([
    (0, normalize_1.Uppercase)(),
    (0, class_validator_1.IsEnum)(client_1.PetSize),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "petSize", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Vui lòng chọn ít nhất một dịch vụ' }),
    (0, class_validator_1.ArrayMaxSize)(5),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBookingDto.prototype, "services", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'date phải có dạng YYYY-MM-DD' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time phải có dạng HH:mm' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "notes", void 0);
class LookupBookingDto {
    number;
    phone;
}
exports.LookupBookingDto = LookupBookingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LookupBookingDto.prototype, "number", void 0);
__decorate([
    (0, normalize_1.NormalizePhone)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LookupBookingDto.prototype, "phone", void 0);
class ListBookingsQuery {
    q;
    status;
    date;
    page;
    pageSize;
}
exports.ListBookingsQuery = ListBookingsQuery;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListBookingsQuery.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Uppercase)(),
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    __metadata("design:type", String)
], ListBookingsQuery.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    __metadata("design:type", String)
], ListBookingsQuery.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListBookingsQuery.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], ListBookingsQuery.prototype, "pageSize", void 0);
class UpdateBookingStatusDto {
    status;
    reason;
}
exports.UpdateBookingStatusDto = UpdateBookingStatusDto;
__decorate([
    (0, normalize_1.Uppercase)(),
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=booking.dto.js.map