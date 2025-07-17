import {  BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto,CreateUserDto } from './user.dto';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        birth: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
  }
  async findOne(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        birth: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  async create(createUserDto: CreateUserDto) {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    })

    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }


    // Tìm role 'user' mặc định
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'user' }
    });

    if (!defaultRole) {
      throw new BadRequestException('Default user role not found');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        roles: { connect: { id: defaultRole.id } }
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        birth: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
  }
  async update(id: bigint, updateUserDto: UpdateUserDto) {
    // ✅ 1. Parallel validation - chạy song song để tối ưu tốc độ
    const [existingUser, emailCheck, roleCheck] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true, email: true, username: true, password: true
        }
      }),

      updateUserDto.email ? this.prisma.user.findUnique({
        where: {
          email: updateUserDto.email,
          NOT: { id } // ngoại trừ người dùng hiện tại
        },
        select: {
          id: true, // id của người dùng nếu tồn tại
        }
      }) : null, // trả về null nếu không có email bị duplicate

      updateUserDto.role_id ? this.prisma.role.findUnique({
        where: { id: updateUserDto.role_id },
        select: { id: true }
      }) : null // trả về null nếu không có roleId 
    ])

    // ✅ 2.Validate 
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (emailCheck && updateUserDto.email) {
      throw new ConflictException('Email already exists');
    }
    if (!roleCheck && updateUserDto.role_id) {
      throw new NotFoundException(`Role with ID ${updateUserDto.role_id} not found`);
    }
    // ✅ 3.update user 
    const updateUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: updateUserDto.password ? await bcrypt.hash(updateUserDto.password, 10) : existingUser.password,
      },
      include: { roles: true }
    })
    const { password, ...result } = updateUser;
    return result;
  }

  async delete(id: bigint) {
    await this.findOne(id)
    return this.prisma.user.delete({
      where: { id }
    });
  }
}
