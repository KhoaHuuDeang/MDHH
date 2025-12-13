import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cartItems = await this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: {
        souvenirs: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const total = cartItems.reduce(
      (sum, item) => sum + item.souvenirs.price * item.quantity,
      0
    );

    return {
      message: 'Cart retrieved successfully',
      status: 200,
      result: { items: cartItems, total, count: cartItems.length },
    };
  }


  async getCartCount(userId: string) {
    const count = await this.prisma.cart_items.count({
      where: { user_id: userId },
    });

    return {
      message: 'Cart count retrieved successfully',
      status: 200,
      result: { count },
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const souvenir = await this.prisma.souvenirs.findUnique({
      where: { id: dto.souvenir_id },
    });

    if (!souvenir) {
      return {
        message: 'Souvenir not found',
        status: 404,
        result: null,
      };
    }

    if (souvenir.stock < dto.quantity) {
      return {
        message: 'Insufficient stock',
        status: 400,
        result: null,
      };
    }

    const existing = await this.prisma.cart_items.findUnique({
      where: {
        user_id_souvenir_id: {
          user_id: userId,
          souvenir_id: dto.souvenir_id,
        },
      },
    });

    let cartItem;
    if (existing) {
      cartItem = await this.prisma.cart_items.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + dto.quantity,
          updated_at: new Date(),
        },
        include: { souvenirs: true },
      });
    } else {
      cartItem = await this.prisma.cart_items.create({
        data: {
          user_id: userId,
          souvenir_id: dto.souvenir_id,
          quantity: dto.quantity,
        },
        include: { souvenirs: true },
      });
    }

    return {
      message: 'Item added to cart successfully',
      status: 200,
      result: { cartItem },
    };
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cartItem = await this.prisma.cart_items.findFirst({
      where: { id: itemId, user_id: userId },
      include: { souvenirs: true },
    });

    if (!cartItem) {
      return {
        message: 'Cart item not found',
        status: 404,
        result: null,
      };
    }

    if (cartItem.souvenirs.stock < dto.quantity) {
      return {
        message: 'Insufficient stock',
        status: 400,
        result: null,
      };
    }

    const updated = await this.prisma.cart_items.update({
      where: { id: itemId },
      data: { quantity: dto.quantity, updated_at: new Date() },
      include: { souvenirs: true },
    });

    return {
      message: 'Cart item updated successfully',
      status: 200,
      result: { cartItem: updated },
    };
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await this.prisma.cart_items.findFirst({
      where: { id: itemId, user_id: userId },
    });

    if (!cartItem) {
      return {
        message: 'Cart item not found',
        status: 404,
        result: null,
      };
    }

    await this.prisma.cart_items.delete({
      where: { id: itemId },
    });

    return {
      message: 'Item removed from cart successfully',
      status: 200,
      result: null,
    };
  }

  async clearCart(userId: string) {
    await this.prisma.cart_items.deleteMany({
      where: { user_id: userId },
    });

    return {
      message: 'Cart cleared successfully',
      status: 200,
      result: null,
    };
  }
}
