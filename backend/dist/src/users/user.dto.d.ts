export declare class CreateUserDto {
    email: string;
    name: string;
    password: string;
    roleId: string;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    roleId?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
