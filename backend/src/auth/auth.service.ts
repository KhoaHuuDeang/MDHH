import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
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
        const user = await this.prisma.users.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                displayname: true,
                birth: true,
                password: true,
                avatar: true,
                email_verified: true,
                roles: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                created_at: true,
                updated_at: true,
            }

        })
        if (user && user.password && await bcrypt.compare(password, user.password)) {
            const { password: _, ...result } = user;
            return result;
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Create session for NextAuth database strategy [30 days]
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const session = await this.sessionService.createSession(user.id, expiresAt);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.roles.name ,
            displayname: user.displayname,
            sessionToken: session.session_token, // ← Add sessionToken to JWT
        }

        return {
            accessToken: this.jwtService.sign(payload),
            sessionToken: session.session_token,
            expires: session.expires,
            user: {
                id: user.id,
                email: user.email,
                displayname: user.displayname,
                username: user.username,
                role: user.roles.name,
                birth: user.birth,
                avatar: user.avatar,
                emailVerified: user.email_verified 
            }
        }
    }

    async register(createUserDto: CreateUserDto) {
        const [existingUser, RoleCheck] = await Promise.all([
            this.prisma.users.findUnique({
                where: { email: createUserDto.email },
                select: { id: true }
            }),
            this.prisma.roles.findUnique({
                where: { name: 'USER' },
                select: { id: true }
            })
        ])

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }
        if (!RoleCheck) {
            throw new InternalServerErrorException('Role not found');
        } try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = await this.prisma.users.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                    birth: createUserDto.birth || '2000-01-01',
                    roles: { connect: { id: RoleCheck.id } }
                },
                include: { roles: true }
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
