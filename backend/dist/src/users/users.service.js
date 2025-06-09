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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                fullname: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                fullname: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email }
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists with this email');
        }
        if (createUserDto.username) {
            const existingUsername = await this.prisma.user.findUnique({
                where: { username: createUserDto.username }
            });
            if (existingUsername) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        const defaultRole = await this.prisma.role.findUnique({
            where: { name: 'user' }
        });
        if (!defaultRole) {
            throw new common_1.BadRequestException('Default user role not found');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                role: { connect: { id: defaultRole.id } }
            },
            select: {
                id: true,
                email: true,
                username: true,
                fullname: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async update(id, updateUserDto) {
        const [existingUser, emailCheck, usernameCheck, roleCheck] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true, email: true, username: true, password: true
                }
            }),
            updateUserDto.email ? this.prisma.user.findUnique({
                where: {
                    email: updateUserDto.email,
                    NOT: { id }
                },
                select: {
                    id: true,
                }
            }) : null,
            updateUserDto.username ? this.prisma.user.findUnique({
                where: {
                    username: updateUserDto.username,
                    NOT: { id }
                },
                select: {
                    id: true,
                }
            }) : null,
            updateUserDto.roleId ? this.prisma.role.findUnique({
                where: { id: updateUserDto.roleId },
                select: { id: true }
            }) : null
        ]);
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (emailCheck && updateUserDto.email) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (usernameCheck && updateUserDto.username) {
            throw new common_1.ConflictException('Username already exists');
        }
        if (!roleCheck && updateUserDto.roleId) {
            throw new common_1.NotFoundException(`Role with ID ${updateUserDto.roleId} not found`);
        }
        const updateUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateUserDto,
                password: updateUserDto.password ? await bcrypt.hash(updateUserDto.password, 10) : existingUser.password,
            },
            include: { role: true }
        });
        const { password, ...result } = updateUser;
        return result;
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.user.delete({
            where: { id }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map