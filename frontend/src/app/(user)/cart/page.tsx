'use client';

import { useEffect, useState } from 'react';
import { csrAxiosClient } from '@/utils/axiosClient';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState<any>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const fetchCart = async () => {
    try {
      const res = await csrAxiosClient.get('/cart');
      setCart(res.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await csrAxiosClient.put(`/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await csrAxiosClient.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const checkout = async () => {
    try {
      const res = await csrAxiosClient.post('/payment/orders', {
        payment_method: 'VNPAY',
      });
      
      const { paymentUrl } = res.data.result;
      
      // Redirect to VNPay payment gateway
      window.location.href = paymentUrl;
      
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#386641]">
        <div className="w-10 h-10 border-4 border-[#F0F8F2] border-t-[#386641] rounded-full animate-spin mb-4"></div>
        <span className="font-medium">Loading your cart...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans text-gray-900">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Header Title */}
        <div className="flex items-center gap-4 mb-6 text-[#386641]">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
           <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center flex flex-col items-center border border-gray-100">
            <div className="w-24 h-24 bg-[#F0F8F2] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#386641" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <p className="text-gray-500 text-lg mb-6">Your cart is currently empty.</p>
            <button onClick={() => router.push('/')} className="bg-[#386641] text-white px-8 py-2.5 rounded hover:bg-[#2b4d32] transition-colors font-medium">
                Go Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Table Header (Shopee Style) */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-white p-4 rounded-sm shadow-sm mb-3 text-sm text-gray-500 font-medium">
                <div className="col-span-6 pl-4">Product</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-1 text-center">Total Price</div>
                <div className="col-span-1 text-center">Actions</div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-24"> 
              {cart.items.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-sm shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center border border-transparent hover:border-[#F0F8F2] transition-colors">
                  
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                    {/* Placeholder for Product Image if you had one */}
                    <div className="w-20 h-20 bg-[#F0F8F2] rounded-sm shrink-0 flex items-center justify-center text-[#6A994E]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 15-9-15-9 15a2 2 0 0 0 1.7 3h14.6a2 2 0 0 0 1.7-3Z"/></svg>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{item.souvenirs.name}</h3>
                        <span className="md:hidden text-[#386641] font-semibold mt-1">₫{item.souvenirs.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Unit Price (Desktop) */}
                  <div className="hidden md:block col-span-2 text-center text-gray-600">
                    ₫{item.souvenirs.price.toLocaleString()}
                  </div>

                  {/* Quantity Input */}
                  <div className="col-span-1 md:col-span-2 flex justify-center items-center">
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden h-9">
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 text-center focus:outline-none focus:ring-1 focus:ring-[#386641] py-1 text-gray-900"
                        />
                    </div>
                  </div>

                  {/* Total Price (Desktop) */}
                  <div className="hidden md:block col-span-1 text-center text-[#386641] font-bold">
                    ₫{(item.souvenirs.price * item.quantity).toLocaleString()}
                  </div>

                  {/* Remove Action */}
                  <div className="col-span-1 md:col-span-1 flex justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      title="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Footer Checkout Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-40">
                <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-end items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Total ({cart.items.length} items):</span>
                        <span className="text-2xl font-bold text-[#386641]">₫{cart.total.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={checkout}
                        className="w-full sm:w-auto bg-[#386641] text-white px-10 py-3 rounded hover:bg-[#2b4d32] transition-colors shadow-lg shadow-[#386641]/20 font-semibold"
                    >
                        Checkout with ViettelPay
                    </button>
                </div>
            </div>
            
            {/* Spacer for sticky footer */}
            <div className="h-24"></div> 
          </>
        )}
      </div>
    </div>
  );
}