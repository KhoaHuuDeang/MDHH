import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
        console.log("loginDto", loginDto);
        const user = await this.validateUser(loginDto.email, loginDto.password);
        console.log("asdasdasd",user);
        if (!user) {
            throw new NotFoundError('Invalid credentials');
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
        return this.usersService.create(createUserDto);
    }
}
