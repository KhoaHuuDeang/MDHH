import { PrismaService } from '../prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }[]>;
    findOne(id: string): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        roleId: string;
    }>;
}
