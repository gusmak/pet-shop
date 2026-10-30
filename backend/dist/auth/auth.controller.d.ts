import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthUser } from './strategies/jwt.strategy';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    me(user: AuthUser): Promise<{
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
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
}
