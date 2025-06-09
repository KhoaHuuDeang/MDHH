import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    remove(id: string): Promise<{
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
