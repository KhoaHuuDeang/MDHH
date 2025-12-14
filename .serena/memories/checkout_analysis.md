# Checkout Analysis

## Current Flow
- FE: Cart page calls `/payment/orders` POST with `payment_method: 'VNPAY'`
- BE: PaymentService.createOrder() creates order + payment URL
- BE: Redirects to VNPay payment gateway
- BE: PaymentService.handlePaymentCallback() processes payment response
- BE: Updates order status (success/fail)

## Key Methods
- **PaymentService.createOrder()**: Creates order, returns paymentUrl
- **PaymentService.handlePaymentCallback()**: Handles VNPay webhook response
- **CartService**: Has getCart, addToCart, removeFromCart, updateCartItem, clearCart

## Laziest Checkout Implementation
1. Create order endpoint (exists)
2. Move cart items to order_items on checkout
3. Clear cart after successful payment callback
4. Return order status to FE
