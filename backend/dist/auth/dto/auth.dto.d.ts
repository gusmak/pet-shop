export declare class LoginDto {
    identifier: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
