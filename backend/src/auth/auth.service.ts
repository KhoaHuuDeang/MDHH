import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { SessionService } from './session.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginDto } from '../users/user.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private sessionService: SessionService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        })
        if (user && user.password && await bcrypt.compare(password, user.password)) {
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        console.log('User found:', user);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Create session for NextAuth database strategy [30 days]
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const session = await this.sessionService.createSession(user.id, expiresAt);
        console.log('Session created:', session);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
            displayname: user.displayname,
        }

        return {
            accessToken: this.jwtService.sign(payload),
            sessionToken: session.sessionToken,
            expires: session.expires,
            user : {
                id: user.id,
                email: user.email,
                displayname: user.displayname,
                username: user.username,
                role: user.role.name,
                birth: user.birth,
                avatar: user.avatar ,
                emailVerified: user.emailVerified || false
            }
        }
    }

    async register(createUserDto: CreateUserDto) {
        const [existingUser, RoleCheck] = await Promise.all([
            this.prisma.user.findUnique({
                where: { email: createUserDto.email },
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
        } try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                    birth: createUserDto.birth || '2000-01-01',
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
