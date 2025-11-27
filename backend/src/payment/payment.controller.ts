import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto, ViettelPayCallbackDto } from './payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '127.0.0.1';
    return this.paymentService.createOrder(req.user.userId, dto, ipAddr);
  }

  @Get('callback')
  async handlePaymentCallback(@Query() query: any) {
    return this.paymentService.handlePaymentCallback(query);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Req() req) {
    return this.paymentService.getOrders(req.user.userId);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Req() req, @Param('id') id: string) {
    return this.paymentService.getOrderById(req.user.userId, id);
  }
}
