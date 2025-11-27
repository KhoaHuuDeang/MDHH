'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { csrAxiosClient } from '@/utils/axiosClient';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all query parameters from VNPay callback
        const params: any = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Send to backend for verification
        const res = await csrAxiosClient.get('/payment/callback', { params });

        if (res.data.status === 200) {
          setStatus('success');
          setMessage('Payment successful! Redirecting to orders...');

          setTimeout(() => {
            router.push('/orders');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(res.data.message || 'Payment verification failed');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment verification error');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/cart')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Return to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
