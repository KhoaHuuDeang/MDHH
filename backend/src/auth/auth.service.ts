import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginDto } from '../users/user.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
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
    }    async register(createUserDto: CreateUserDto) {
        const existstingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email }
        })
        if (existstingUser) {
            throw new BadRequestException('User already exists');
        }

        const defaultRole = await this.prisma.role.findUnique({
            where: { name: 'user' }
        });

        if (!defaultRole) {
            throw new BadRequestException('Default user role not found');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                role: { connect: { id: defaultRole.id } }
            }, 
            include: { role: true }
        })
        const { password, ...result } = user
        return result;
    }
}
