export declare class CreateUserDto {
    email: string;
    username: string;
    fullname: string;
    password: string;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    username: string;
    password?: string;
    roleId?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
