import { csrAxiosClient } from '@/utils/axiosClient';

export interface OrderItem {
  id: string;
  souvenir_id: string;
  quantity: number;
  price: number;
  souvenir_name?: string;
}

export interface Order {
  id: string;
  user_id: string;
  username?: string;
  user_email?: string;
  total_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
  payment_method?: string;
  payment_ref?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderStatsResponse {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    status: string;
    count: number;
    totalAmount: number;
  }[];
  recentOrders: number;
}

export const adminOrderService = {
  // Get all orders with pagination and filters
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await csrAxiosClient.get<{
      message: string;
      status: number;
      result: OrdersResponse;
    }>('/admin/orders', { params });
    return response.data;
  },

  // Get order by ID
  async getOrderById(orderId: string) {
    const response = await csrAxiosClient.get<{
      message: string;
      status: number;
      result: Order;
    }>(`/admin/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']) {
    const response = await csrAxiosClient.patch<{
      message: string;
      status: number;
      result: Order;
    }>(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get order statistics
  async getOrderStats() {
    const response = await csrAxiosClient.get<{
      message: string;
      status: number;
      result: OrderStatsResponse;
    }>('/admin/orders/stats');
    return response.data;
  },
};
