import { PrismaService } from '../prisma.service';
import { UpdateUserDto, CreateUserDto } from './user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        username: string;
        fullname: string;
    }[]>;
    findOne(id: string): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        username: string;
        fullname: string;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        username: string;
        fullname: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
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
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        username: string;
        fullname: string;
        password: string;
        roleId: string;
    }>;
}
