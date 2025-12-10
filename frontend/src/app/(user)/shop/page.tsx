'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { csrAxiosClient } from '@/utils/axiosClient';

export default function ShopPage() {
  const [souvenirs, setSouvenirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchSouvenirs();
  }, []);

  const fetchSouvenirs = async () => {
    try {
      const res = await csrAxiosClient.get('/shop/souvenirs?active=true');
      setSouvenirs(res.data.result.souvenirs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (souvenirId: string) => {
    try {
      const res = await csrAxiosClient.post('/cart', {
        souvenir_id: souvenirId,
        quantity: 1,
      });

      if (res.data.status === 200) {
        alert(t('common.success'));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F8F2]">
        <div className="w-10 h-10 border-4 border-white border-t-[#386641] rounded-full animate-spin mb-4"></div>
        <span className="font-medium text-[#386641]">{t('common.loading')}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[1200px] mx-auto px-4">

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center border-l-4 border-[#386641]">
            <div>
                <h1 className="text-2xl font-bold text-[#386641]">{t('sidebar.souvenir')}</h1>
                <p className="text-gray-500 text-sm mt-1">{t('resources.manage')}</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2 text-sm">
                <span className="bg-[#386641] text-white px-3 py-1 rounded-full cursor-pointer shadow-sm">{t('common.all')}</span>
                <span className="bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200 cursor-pointer hover:border-[#386641] hover:text-[#386641] transition-colors">{t('home.popularFiles')}</span>
                <span className="bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200 cursor-pointer hover:border-[#386641] hover:text-[#386641] transition-colors">{t('upload.next')}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {souvenirs.map((item) => (
            <div
                key={item.id}
                className="group bg-white rounded-sm shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] transition-all duration-200 border border-transparent hover:border-[#386641] flex flex-col overflow-hidden relative"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}

                {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">{t('common.delete')}</span>
                    </div>
                )}
              </div>

              <div className="p-3 flex flex-col flex-1">
                <h2 className="text-sm text-gray-800 line-clamp-2 min-h-[40px] mb-1 font-medium group-hover:text-[#386641] transition-colors" title={item.name}>
                    {item.name}
                </h2>

                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{item.description}</p>

                <div className="mt-auto flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                         <p className="text-xs text-gray-400 line-through decoration-gray-400">₫{(item.price * 1.2).toLocaleString()}</p>
                         <p className="text-base font-bold text-[#386641]">₫{item.price.toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 mb-1">{t('resources.manage')}: {item.stock}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item.id);
                  }}
                  disabled={item.stock === 0}
                  className="mt-3 w-full border border-[#386641] text-[#386641] hover:bg-[#386641] hover:text-white text-sm py-1.5 rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#386641]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  {item.stock > 0 ? t('sidebar.cart') : t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {souvenirs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-lg shadow-sm">
             <div className="w-20 h-20 bg-[#F0F8F2] rounded-full flex items-center justify-center mb-4 text-[#386641]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
             <p>{t('resources.noDocuments')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
