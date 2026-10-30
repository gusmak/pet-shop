import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
export declare class CreatePostDto {
    title: string;
    excerpt: string;
    content: string;
    published?: boolean;
}
export declare class UpdatePostDto {
    title?: string;
    excerpt?: string;
    content?: string;
    published?: boolean;
}
export declare class PostsService {
    private prisma;
    constructor(prisma: PrismaService);
    listPublished(): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        authorId: string | null;
        authorName: string;
        createdAt: string;
        published: boolean;
    }[]>;
    findPublished(idOrSlug: string): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        authorId: string | null;
        authorName: string;
        createdAt: string;
        published: boolean;
    }>;
    adminList(): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        authorId: string | null;
        authorName: string;
        createdAt: string;
        published: boolean;
    }[]>;
    private uniqueSlug;
    create(dto: CreatePostDto, actor: AuthUser): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        authorId: string | null;
        authorName: string;
        createdAt: string;
        published: boolean;
    }>;
    private loadManageable;
    update(id: string, dto: UpdatePostDto, actor: AuthUser): Promise<{
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        authorId: string | null;
        authorName: string;
        createdAt: string;
        published: boolean;
    }>;
    remove(id: string, actor: AuthUser): Promise<{
        success: boolean;
    }>;
}
