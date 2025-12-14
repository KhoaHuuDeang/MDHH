'use client';

import { useEffect, useState } from 'react';
import { useSessionContext } from '@/contexts/SessionContext';
import { csrAxiosClient } from '@/utils/axiosClient';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  souvenirs: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_ref: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await csrAxiosClient.get('/payment/orders');
        if (res.data.status === 'success') {
          setOrders(res.data.result.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#386641]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('sidebar.adminOrders')}</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500">{t('moderation.noDocuments')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Order #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-3">
                      <img
                        src={item.souvenirs.image_url || '/placeholder.png'}
                        alt={item.souvenirs.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.souvenirs.name}</p>
                        <p className="text-sm text-gray-500">
                          {t('common.delete')} {item.quantity} x{' '}
                          {Number(item.price).toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      <div className="text-right font-semibold text-gray-800">
                        {(item.quantity * Number(item.price)).toLocaleString('vi-VN')} VND
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Payment Ref: {order.payment_ref || 'N/A'}
                  </p>
                  <p className="text-xl font-bold text-[#386641]">
                    {Number(order.total_amount).toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
