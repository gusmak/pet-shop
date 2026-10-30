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
exports.AdminPostsController = exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("./posts.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PostsController = class PostsController {
    posts;
    constructor(posts) {
        this.posts = posts;
    }
    list() {
        return this.posts.listPublished();
    }
    get(idOrSlug) {
        return this.posts.findPublished(idOrSlug);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':idOrSlug'),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "get", null);
exports.PostsController = PostsController = __decorate([
    (0, common_1.Controller)('api/posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
let AdminPostsController = class AdminPostsController {
    posts;
    constructor(posts) {
        this.posts = posts;
    }
    list() {
        return this.posts.adminList();
    }
    create(dto, user) {
        return this.posts.create(dto, user);
    }
    update(id, dto, user) {
        return this.posts.update(id, dto, user);
    }
    remove(id, user) {
        return this.posts.remove(id, user);
    }
};
exports.AdminPostsController = AdminPostsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPostsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [posts_service_1.CreatePostDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPostsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_service_1.UpdatePostDto, Object]),
    __metadata("design:returntype", void 0)
], AdminPostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPostsController.prototype, "remove", null);
exports.AdminPostsController = AdminPostsController = __decorate([
    (0, common_1.Controller)('api/admin/posts'),
    (0, auth_decorator_1.Auth)('admin.access', 'posts.write'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], AdminPostsController);
//# sourceMappingURL=posts.controller.js.map