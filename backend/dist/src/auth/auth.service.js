"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService {
    prisma;
    jwtService;
    usersService;
    constructor(prisma, jwtService, usersService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        console.log("loginDto", loginDto);
        const user = await this.validateUser(loginDto.email, loginDto.password);
        console.log("asdasdasd", user);
        if (!user) {
            throw new rxjs_1.NotFoundError('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
        };
        return {
            user,
            accessToken: this.jwtService.sign(payload),
        };
    }
    async register(createUserDto) {
<<<<<<< HEAD
        const [existingUser, existingName, RoleCheck] = await Promise.all([
            this.prisma.user.findUnique({
                where: { email: createUserDto.email },
                select: { id: true }
            }),
            this.prisma.user.findUnique({
                where: { username: createUserDto.username },
                select: { id: true }
            }),
            this.prisma.role.findUnique({
                where: { name: 'user' },
                select: { id: true }
            })
        ]);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (!RoleCheck) {
            throw new common_1.InternalServerErrorException('Role not found');
        }
        if (existingName) {
            throw new common_1.ConflictException('Username already exists');
        }
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                    role: { connect: { id: RoleCheck.id } }
                },
                include: { role: true }
            });
            const { password, ...result } = newUser;
            return {
                user: result,
                message: 'User created successfully'
            };
        }
        catch (err) {
            console.error(err);
            throw new common_1.InternalServerErrorException('Error creating user');
        }
=======
        return this.usersService.create(createUserDto);
>>>>>>> d73092f12b9ee543ede2ade796d0fa198606cfc6
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map