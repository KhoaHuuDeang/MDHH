import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, ViettelPayCallbackDto } from './payment.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto, ipAddr: string) {
    const cartItems = await this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: { souvenirs: true },
    });

    if (cartItems.length === 0) {
      return {
        message: 'Cart is empty',
        status: 400,
        result: null,
      };
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.souvenirs.stock < item.quantity) {
        return {
          message: `Insufficient stock for ${item.souvenirs.name}`,
          status: 400,
          result: null,
        };
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.souvenirs.price) * item.quantity,
      0
    );

    // Create order with transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          user_id: userId,
          total_amount: totalAmount,
          payment_method: dto.payment_method,
          status: 'PENDING',
        },
      });

      // Create order items
      await Promise.all(
        cartItems.map((item) =>
          tx.order_items.create({
            data: {
              order_id: newOrder.id,
              souvenir_id: item.souvenir_id,
              quantity: item.quantity,
              price: item.souvenirs.price,
            },
          })
        )
      );

      // Clear cart
      await tx.cart_items.deleteMany({
        where: { user_id: userId },
      });

      return newOrder;
    });

    // Initialize VNPay
    const { VNPay } = await import('vnpay');
    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      secureSecret: process.env.VNPAY_SECRET_KEY || '',
      vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
      testMode: process.env.VNPAY_TEST_MODE === 'true',
    });

    // Build VNPay payment URL
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalAmount,
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: `${process.env.APP_URL}/payment/success`,
      vnp_TxnRef: order.id,
      vnp_OrderInfo: `Payment for order ${order.id}`,
    });

    return {
      message: 'Order created successfully',
      status: 200,
      result: { order, paymentUrl },
    };
  }

  async handlePaymentCallback(query: any) {
    // Initialize VNPay
    const { VNPay } = await import('vnpay');
    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      secureSecret: process.env.VNPAY_SECRET_KEY || '',
      vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
      testMode: process.env.VNPAY_TEST_MODE === 'true',
    });

    // Verify return URL
    const verification = vnpay.verifyReturnUrl(query);

    if (!verification.isVerified) {
      return {
        message: 'Invalid signature',
        status: 400,
        result: null,
      };
    }

    if (!verification.isSuccess) {
      return {
        message: 'Payment failed',
        status: 400,
        result: { verification },
      };
    }

    const orderId = verification.vnp_TxnRef;

    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: { users: true },
    });

    if (!order) {
      return {
        message: 'Order not found',
        status: 404,
        result: null,
      };
    }

    // Update order and stock
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.orders.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          payment_ref: String(verification.vnp_TransactionNo || ''),
          updated_at: new Date(),
        },
        include: {
          order_items: {
            include: { souvenirs: true },
          },
          users: true,
        },
      });

      // Decrement stock
      await Promise.all(
        updated.order_items.map((item) =>
          tx.souvenirs.update({
            where: { id: item.souvenir_id },
            data: {
              stock: { decrement: item.quantity },
            },
          })
        )
      );

      return updated;
    });

    // Send order confirmation email
    if (updatedOrder.users.email) {
      try {
        await this.emailService.sendOrderConfirmationEmail(
          updatedOrder.users.email,
          updatedOrder.id,
          Number(updatedOrder.total_amount),
          updatedOrder.order_items,
          updatedOrder.users.displayname || updatedOrder.users.username || 'Customer'
        );
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
      }
    }

    return {
      message: 'Payment processed successfully',
      status: 200,
      result: { order: updatedOrder, verification },
    };
  }

  async getOrders(userId: string) {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: { souvenirs: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      message: 'Orders retrieved successfully',
      status: 'success',
      result: { orders, count: orders.length },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: {
        order_items: {
          include: { souvenirs: true },
        },
      },
    });

    if (!order) {
      return {
        message: 'Order not found',
        status: 'error',
        result: null,
      };
    }

    return {
      message: 'Order retrieved successfully',
      status: 'success',
      result: { order },
    };
  }
}
