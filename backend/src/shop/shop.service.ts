import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSouvenirDto, UpdateSouvenirDto } from './shop.dto';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async getAllSouvenirs(isActive?: boolean) {
    const where = isActive !== undefined ? { is_active: isActive } : {};

    const souvenirs = await this.prisma.souvenirs.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const souvenirDtos = souvenirs.map((s) => ({
      ...s,
      price: Number(s.price),
    }));

    return {
      message: 'Souvenirs retrieved successfully',
      status: 'success',
      result: { souvenirs: souvenirDtos, count: souvenirDtos.length },
    };
  }

  async getSouvenirById(id: string) {
    const souvenir = await this.prisma.souvenirs.findUnique({
      where: { id },
    });

    if (!souvenir) {
      return {
        message: 'Souvenir not found',
        status: 'error',
        result: null,
      };
    }

    return {
      message: 'Souvenir retrieved successfully',
      status: 'success',
      result: { souvenir: { ...souvenir, price: Number(souvenir.price) } },
    };
  }

  async createSouvenir(dto: CreateSouvenirDto) {
    const souvenir = await this.prisma.souvenirs.create({
      data: dto,
    });

    return {
      message: 'Souvenir created successfully',
      status: 'success',
      result: { souvenir: { ...souvenir, price: Number(souvenir.price) } },
    };
  }

  async updateSouvenir(id: string, dto: UpdateSouvenirDto) {
    const souvenir = await this.prisma.souvenirs.update({
      where: { id },
      data: { ...dto, updated_at: new Date() },
    });

    return {
      message: 'Souvenir updated successfully',
      status: 'success',
      result: { souvenir: { ...souvenir, price: Number(souvenir.price) } },
    };
  }

  async deleteSouvenir(id: string) {
    await this.prisma.souvenirs.delete({
      where: { id },
    });

    return {
      message: 'Souvenir deleted successfully',
      status: 'success',
      result: null,
    };
  }
}
