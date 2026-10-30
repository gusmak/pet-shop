import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthUser } from './strategies/jwt.strategy';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private token;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: string;
            permissions: string[];
            position: string;
            storeId: string;
            storeName: string;
            isSuper: boolean;
        };
        accessToken: string;
        tokenType: string;
        expiresIn: string;
    } | {
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            role: string;
            permissions: string[];
            loyaltyPoints: number;
        };
        accessToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            role: string;
            permissions: string[];
            loyaltyPoints: number;
        };
        accessToken: string;
        tokenType: string;
        expiresIn: string;
    }>;
    getProfile(auth: AuthUser): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        role: string;
        permissions: string[];
        position: string;
        storeId: string;
        storeName: string;
        isSuper: boolean;
    } | {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        permissions: string[];
        loyaltyPoints: number;
    }>;
    changePassword(auth: AuthUser, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    private permissionKeys;
    private staffUser;
    private customerUser;
}
