import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto, LoginDto } from '../users/user.dto';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private usersService;
    constructor(prisma: PrismaService, jwtService: JwtService, usersService: UsersService);
    validateUser(email: string, password: string): Promise<{
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
    } | null>;
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
<<<<<<< HEAD
            createdAt: Date;
            updatedAt: Date;
            email: string;
            username: string;
            fullname: string;
            roleId: string;
        };
        message: string;
=======
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
>>>>>>> d73092f12b9ee543ede2ade796d0fa198606cfc6
    }>;
}
