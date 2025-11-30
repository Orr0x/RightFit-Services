import { RegisterInput, LoginInput, AuthResponse, ChangePasswordInput } from '@rightfit/shared';
export declare class AuthService {
    register(input: RegisterInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
    }>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
}
//# sourceMappingURL=AuthService.d.ts.map