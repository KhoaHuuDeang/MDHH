import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }


  @Get('count')
  @UseGuards(JwtAuthGuard)
  async getCartCount(@Req() req) {
    return this.cartService.getCartCount(req.user.userId);
  }

  @Post()
  async addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Put(':id')
  async updateCartItem(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(req.user.userId, id, dto);
  }

  @Delete(':id')
  async removeFromCart(@Req() req, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.userId, id);
  }

  @Delete()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
