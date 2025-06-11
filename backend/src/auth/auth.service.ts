import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginDto } from '../users/user.dto';
import { UsersService } from '../users/users.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private usersService: UsersService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        })

        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
        }
        return {
            user,
            accessToken: this.jwtService.sign(payload),
        }
    }

    async register(createUserDto: CreateUserDto) {
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
        ])

        // ✅ Boundary error handling - kiểm tra từng case

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }
        if (!RoleCheck) {
            throw new InternalServerErrorException('Role not found');
        }
        if (existingName) {
            throw new ConflictException('Username already exists');
        } try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                    role: { connect: { id: RoleCheck.id } }
                },
                include: { role: true }
            })
            const { password, ...result } = newUser;
            return {
                user: result,
                message: 'User created successfully'
            }
        } catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Error creating user');
        }
    }
}
