import { AuthService } from './auth.service';
import { LoginDto, CreateUserDto } from '../users/user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        user: {
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            username: string;
            fullname: string;
            roleId: string;
        };
        accessToken: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        user: {
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            username: string;
            fullname: string;
            roleId: string;
        };
        message: string;
    }>;
}
