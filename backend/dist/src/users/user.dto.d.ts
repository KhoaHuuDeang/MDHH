export declare class CreateUserDto {
    email: string;
    username: string;
    fullname: string;
    password: string;
}
export declare class UpdateUserDto {
    fullname: string;
    email: string;
    password: string;
    roleId: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
