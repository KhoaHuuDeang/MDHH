'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, Lock, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      // LƯU Ý: Trong dự án thực tế, hãy dùng biến môi trường cho URL API
      const res = await fetch('http://localhost:3001/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đã xảy ra lỗi không xác định');
      }

      setStatus('success');
      // Thông báo bảo mật chung nếu API không trả về message cụ thể
      setMessage(data.message || `Nếu tài khoản tồn tại với email ${email}, bạn sẽ sớm nhận được hướng dẫn đặt lại mật khẩu.`);
      
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F8F2] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 space-y-8">
        
        {/* --- Header Section --- */}
        <div className="text-center">
          {status !== 'success' && (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#386641]/10 mb-6">
              <Lock className="h-8 w-8 text-[#386641]" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {status === 'success' ? 'Kiểm tra email của bạn' : 'Quên mật khẩu?'}
          </h1>
          <p className="mt-3 text-base text-gray-500">
            {status === 'success' 
              ? 'Chúng tôi đã gửi liên kết đặt lại mật khẩu đến địa chỉ email của bạn.' 
              : 'Đừng lo lắng, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.'}
          </p>
        </div>

        {/* --- Main Content Section --- */}
        {status === 'success' ? (
          // Success View
          <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                 <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <p className="text-sm text-gray-700 bg-green-50 border border-green-100 p-4 rounded-lg mb-8">
                {message}
            </p>

             <button
                type="button"
                onClick={() => router.push('/auth')}
                className="inline-flex items-center text-sm font-bold text-[#386641] hover:text-[#2b4d32] transition-colors duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại Đăng nhập
              </button>
          </div>
        ) : (
          // Form View
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 animate-in fade-in duration-300">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Địa chỉ Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-gray-300 rounded-xl focus:ring-[#386641] focus:border-[#386641] sm:text-sm transition-colors placeholder-gray-400"
                  placeholder="Nhập email đã đăng ký của bạn"
                  required
                />
              </div>
            </div>

            {status === 'error' && (
                <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-medium">{message}</p>
                        </div>
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#386641] hover:bg-[#2b4d32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#386641] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Đang gửi...
                </>
              ) : (
                'Gửi liên kết đặt lại'
              )}
            </button>

            <div className="text-center mt-4">
              <Link
                href="/auth"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#386641] transition-colors duration-200 group p-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}