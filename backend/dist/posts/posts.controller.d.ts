import { CreatePostDto, PostsService, UpdatePostDto } from './posts.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
export declare class PostsController {
    private readonly posts;
    constructor(posts: PostsService);
    list(): Promise<{
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
    get(idOrSlug: string): Promise<{
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
}
export declare class AdminPostsController {
    private readonly posts;
    constructor(posts: PostsService);
    list(): Promise<{
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
    create(dto: CreatePostDto, user: AuthUser): Promise<{
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
    update(id: string, dto: UpdatePostDto, user: AuthUser): Promise<{
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
    remove(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
}
