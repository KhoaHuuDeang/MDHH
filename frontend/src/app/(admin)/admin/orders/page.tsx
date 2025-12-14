'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminOrderService, Order, OrdersResponse, OrderStatsResponse } from '@/services/adminOrderService';
import { shopService, CreateSouvenirDto } from '@/services/shopService';
import useNotifications from '@/hooks/useNotifications';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const toast = useNotifications();

  // Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'souvenirs'>('orders');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Souvenirs state
  const [souvenirs, setSouvenirs] = useState<any[]>([]);
  const [souvenirLoading, setSouvenirLoading] = useState(false);
  const [showSouvenirModal, setShowSouvenirModal] = useState(false);
  const [editingSouvenir, setEditingSouvenir] = useState<any | null>(null);
  const [souvenirForm, setSouvenirForm] = useState<CreateSouvenirDto>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const statusOptions = ['PENDING', 'PROCESSING', 'COMPLETED', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED'];

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [page, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminOrderService.getOrders({
        page,
        limit: 10,
        status: selectedStatus || undefined,
      });
      setOrders(response.result.orders);
      setTotalPages(response.result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminOrderService.getOrderStats();
      setStats(response.result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      await loadStats();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const viewOrderDetails = async (orderId: string) => {
    try {
      const response = await adminOrderService.getOrderById(orderId);
      setSelectedOrder(response.result);
    } catch (error) {
      console.error('Failed to load order details:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Souvenir Management Functions
  const loadSouvenirs = async () => {
    try {
      setSouvenirLoading(true);
      const response = await shopService.getAllSouvenirs();
      setSouvenirs(response.result.souvenirs);
    } catch (error) {
      console.error('Failed to load souvenirs:', error);
      toast.error(t('common.error'));
    } finally {
      setSouvenirLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'souvenirs') {
      loadSouvenirs();
    }
  }, [activeTab]);

  const handleCreateOrUpdateSouvenir = async () => {
    try {
      setUploading(true);
      let imageUrl = souvenirForm.image_url;

      // Upload image to S3 if selected
      if (selectedImage) {
        imageUrl = await shopService.uploadSouvenirImage(selectedImage);
      }

      if (editingSouvenir) {
        // Update existing
        await shopService.updateSouvenir(editingSouvenir.id, { ...souvenirForm, image_url: imageUrl });
        toast.success(t('souvenir.updated'));
      } else {
        // Create new
        await shopService.createSouvenir({ ...souvenirForm, image_url: imageUrl });
        toast.success(t('souvenir.created'));
      }

      setShowSouvenirModal(false);
      setSouvenirForm({ name: '', description: '', price: 0, stock: 0, image_url: '' });
      setEditingSouvenir(null);
      setSelectedImage(null);
      setImagePreview('');
      loadSouvenirs();
    } catch (error) {
      console.error('Failed to save souvenir:', error);
      toast.error(t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const handleEditSouvenir = (souvenir: any) => {
    setEditingSouvenir(souvenir);
    setSouvenirForm({
      name: souvenir.name,
      description: souvenir.description || '',
      price: souvenir.price,
      stock: souvenir.stock,
      image_url: souvenir.image_url || '',
    });
    setImagePreview(souvenir.image_url || '');
    setShowSouvenirModal(true);
  };

  const handleDeleteSouvenir = (id: string) => {
    setDeleteDialog({ isOpen: true, id });
  };

  const confirmDeleteSouvenir = async () => {
    if (!deleteDialog.id) return;
    try {
      await shopService.deleteSouvenir(deleteDialog.id);
      toast.success(t('souvenir.deleted'));
      loadSouvenirs();
      setDeleteDialog({ isOpen: false, id: null });
    } catch (error) {
      console.error('Failed to delete souvenir:', error);
      toast.error(t('common.error'));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Refactored for Seller Center Style: Light bg + Border + Dark text
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-200',
      COMPLETED: 'bg-[#F0F8F2] text-[#386641] border border-[#6A994E]', // Brand Success
      PAID: 'bg-[#F0F8F2] text-[#386641] border border-[#6A994E]',       // Brand Success
      CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
      FAILED: 'bg-red-50 text-red-700 border border-red-200',
      REFUNDED: 'bg-purple-50 text-purple-700 border border-purple-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-[#386641]">
        <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-[#F0F8F2] border-t-[#386641] rounded-full animate-spin"></div>
             <span className="text-sm font-medium">{t('common.loading')}</span>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-sm">
      <div className="max-w-[1400px] mx-auto">

        {/* Header Section */}
        <div className="mb-6">
            <h1 className="text-xl font-bold text-[#386641] uppercase tracking-wide mb-4">{t('admin.orderManagement')}</h1>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-[#386641] border-b-2 border-[#386641]'
                    : 'text-gray-600 hover:text-[#386641]'
                }`}
              >
                {t('admin.orders')}
              </button>
              <button
                onClick={() => setActiveTab('souvenirs')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'souvenirs'
                    ? 'text-[#386641] border-b-2 border-[#386641]'
                    : 'text-gray-600 hover:text-[#386641]'
                }`}
              >
                {t('souvenir.management')}
              </button>
            </div>
        </div>

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <>
        {/* Statistics Cards */}
        {stats && (
          <div className="mb-6 space-y-4">
            {/* First row: First 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Orders */}
              <div className="bg-white p-4 rounded-sm shadow-sm border-t-4 border-[#386641] hover:shadow-md transition-shadow">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('admin.orders')}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white p-4 rounded-sm shadow-sm border-t-4 border-[#6A994E] hover:shadow-md transition-shadow">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('admin.export')}</h3>
                <p className="text-2xl font-bold text-[#386641] mt-2">{formatCurrency(stats.totalRevenue)}</p>
              </div>

              {/* Recent Orders */}
              <div className="bg-white p-4 rounded-sm shadow-sm border-t-4 border-blue-400 hover:shadow-md transition-shadow">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('admin.recentActivity')}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.recentOrders}</p>
              </div>
            </div>

            {/* Second row: Order Status card (full width) */}
            <div className="grid grid-cols-1">
              <div className="bg-white p-3 rounded-sm shadow-sm border-t-4 border-gray-400 hover:shadow-md transition-shadow">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('admin.status')}</h3>
                <div className="space-y-1 h-[60px] overflow-y-auto pr-1 custom-scrollbar">
                  {stats.ordersByStatus.map((s) => (
                    <div key={s.status} className="flex justify-between items-center text-xs">
                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-medium ${getStatusColor(s.status)} border-0`}>{t(`orderStatus.${s.status}`)}</span>
                      <span className="font-bold text-gray-700">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-sm shadow-sm mb-4 border border-gray-200 flex items-center gap-4">
             <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                <label className="font-bold text-gray-700 text-xs uppercase tracking-wider">{t('admin.filterByStatus')}</label>
             </div>
             <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white cursor-pointer transition-colors min-w-[200px]"
              >
                <option value="">{t('common.all')}</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {t(`orderStatus.${status}`)}
                  </option>
                ))}
             </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead className="bg-[#386641] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[12%]">{t('admin.orders')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[20%]">{t('admin.user')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[15%]">{t('upload.description')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[15%]">{t('admin.status')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-[#4a7a53] w-[18%]">{t('admin.createdAt')}</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-[20%]">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 bg-white">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                        {t('admin.noData')}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#F0F8F2] transition-colors group">
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600 border-r border-gray-100">
                                        #{order.id.substring(0, 8)}...
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">{order.username || t('common.user')}</span>
                                            <span className="text-xs text-gray-500">{order.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100">
                                        <span className="font-bold text-[#386641]">{formatCurrency(order.total_amount)}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100">
                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                            {t(`orderStatus.${order.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 border-r border-gray-100">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => viewOrderDetails(order.id)}
                                                className="p-1.5 rounded-sm text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                                                title={t('admin.view')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            </button>
                                            
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                className="border border-gray-300 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] bg-white cursor-pointer max-w-[100px]"
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                    {t(`orderStatus.${status}`)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                    {t('admin.pageInfo', { current: page, total: totalPages })}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-sm text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-[#386641] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('upload.previous')}
                    </button>
                    <div className="px-3 py-1 bg-[#386641] text-white text-xs font-bold rounded-sm border border-[#386641]">
                        {page}
                    </div>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-sm text-xs bg-white text-gray-600 hover:bg-gray-50 hover:text-[#386641] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('upload.next')}
                    </button>
                </div>
            </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-sm shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                             <div className="bg-[#F0F8F2] p-2 rounded-full text-[#386641]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                             </div>
                             <div>
                                <h2 className="text-lg font-bold text-gray-900">{t('admin.orderDetails')}</h2>
                                <p className="text-xs text-gray-500 font-mono">#{selectedOrder.id}</p>
                             </div>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    
                    {/* Modal Content - Scrollable */}
                    <div className="overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Customer Info Card */}
                            <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('admin.user')}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">{t('profile.displayName')}:</span>
                                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.username || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">{t('admin.email')}:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedOrder.user_email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info Card */}
                            <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('admin.orders')}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">{t('admin.status')}:</span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${getStatusColor(selectedOrder.status)}`}>
                                            {t(`orderStatus.${selectedOrder.status}`)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">{t('admin.joined')}:</span>
                                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedOrder.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">{t('resources.manage')}:</span>
                                        <span className="text-base font-bold text-[#386641]">{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             {/* Payment Info */}
                             <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('admin.orders')}</h3>
                                <p className="text-sm"><span className="text-gray-500">{t('auth.confirmRequired')}:</span> <span className="font-medium">{selectedOrder.payment_method || 'N/A'}</span></p>
                                <p className="text-sm mt-1"><span className="text-gray-500">{t('admin.reason')}:</span> <span className="font-mono text-xs bg-gray-100 px-1 rounded">{selectedOrder.payment_ref || 'N/A'}</span></p>
                             </div>
                             <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('admin.recentActivity')}</h3>
                                <p className="text-sm"><span className="text-gray-500">{t('admin.disabledUntil')}:</span> <span className="font-medium">{formatDate(selectedOrder.updated_at)}</span></p>
                             </div>
                         </div>

                        {/* Order Items Table */}
                        {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('resources.manage')}</h3>
                                <div className="border border-gray-200 rounded-sm overflow-hidden">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-[#386641] text-white">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wider">{t('common.view')}</th>
                                                <th className="px-4 py-2 text-center font-medium text-xs uppercase tracking-wider">{t('common.confirm')}</th>
                                                <th className="px-4 py-2 text-right font-medium text-xs uppercase tracking-wider">{t('upload.description')}</th>
                                                <th className="px-4 py-2 text-right font-medium text-xs uppercase tracking-wider">{t('admin.orderManagement')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedOrder.order_items.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-900">{item.souvenir_name}</td>
                                                    <td className="px-4 py-2 text-center text-gray-600">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.price)}</td>
                                                    <td className="px-4 py-2 text-right font-bold text-[#386641]">{formatCurrency(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right font-bold text-gray-600 text-xs uppercase">{t('common.all')}</td>
                                                <td className="px-4 py-2 text-right font-bold text-[#386641] text-lg">{formatCurrency(selectedOrder.total_amount)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
          </>
        )}

        {/* Souvenirs Tab Content */}
        {activeTab === 'souvenirs' && (
          <>
            <div className="bg-white p-4 rounded-sm shadow-sm mb-4 border border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{t('souvenir.list')}</h2>
              <button
                onClick={() => {
                  setEditingSouvenir(null);
                  setSouvenirForm({ name: '', description: '', price: 0, stock: 0, image_url: '' });
                  setImagePreview('');
                  setShowSouvenirModal(true);
                }}
                className="px-4 py-2 bg-[#386641] text-white text-sm font-medium rounded-sm hover:bg-[#2d5133] transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {t('souvenir.create')}
              </button>
            </div>

            {souvenirLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#386641]"></div>
              </div>
            ) : (
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-[#386641] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('souvenir.image')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('souvenir.name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('souvenir.description')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('souvenir.price')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('souvenir.stock')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">{t('admin.status')}</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {souvenirs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                          {t('shop.noSouvenirs')}
                        </td>
                      </tr>
                    ) : (
                      souvenirs.map((souvenir) => (
                        <tr key={souvenir.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {souvenir.image_url ? (
                              <img src={souvenir.image_url} alt={souvenir.name} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                {t('souvenir.noImage')}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{souvenir.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{souvenir.description || '-'}</td>
                          <td className="px-4 py-3 font-bold text-[#386641]">{formatCurrency(souvenir.price)}</td>
                          <td className="px-4 py-3 text-sm">{souvenir.stock}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded ${souvenir.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {souvenir.is_active ? t('souvenir.active') : t('souvenir.inactive')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center space-x-2">
                            <button
                              onClick={() => handleEditSouvenir(souvenir)}
                              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              onClick={() => handleDeleteSouvenir(souvenir.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              {t('common.delete')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Souvenir Create/Edit Modal */}
        {showSouvenirModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#F0F8F2] p-2 rounded-full text-[#386641]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{editingSouvenir ? t('souvenir.edit') : t('souvenir.create')}</h2>
                            </div>
                        </div>
                        <button onClick={() => setShowSouvenirModal(false)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="overflow-y-auto p-6">
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('souvenir.name')} *</label>
                                <input
                                    type="text"
                                    value={souvenirForm.name}
                                    onChange={(e) => setSouvenirForm({ ...souvenirForm, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641]"
                                    placeholder={t('souvenir.namePlaceholder')}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('souvenir.description')}</label>
                                <textarea
                                    value={souvenirForm.description}
                                    onChange={(e) => setSouvenirForm({ ...souvenirForm, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] min-h-[80px]"
                                    placeholder={t('souvenir.descriptionPlaceholder')}
                                />
                            </div>

                            {/* Price and Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('souvenir.price')} *</label>
                                    <input
                                        type="number"
                                        value={souvenirForm.price}
                                        onChange={(e) => setSouvenirForm({ ...souvenirForm, price: parseInt(e.target.value) || 0 })}
                                        className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641]"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('souvenir.stock')} *</label>
                                    <input
                                        type="number"
                                        value={souvenirForm.stock}
                                        onChange={(e) => setSouvenirForm({ ...souvenirForm, stock: parseInt(e.target.value) || 0 })}
                                        className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641]"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('souvenir.image')}</label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641]"
                                    />
                                    {imagePreview && (
                                        <div className="relative w-32 h-32 border border-gray-300 rounded-sm overflow-hidden">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={() => setShowSouvenirModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-sm text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleCreateOrUpdateSouvenir}
                            disabled={!souvenirForm.name || souvenirForm.price <= 0 || souvenirForm.stock < 0 || uploading}
                            className="px-4 py-2 bg-[#386641] text-white text-sm font-medium rounded-sm hover:bg-[#2d5133] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? t('common.loading') : (editingSouvenir ? t('common.update') : t('common.create'))}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title={t('souvenir.deleteConfirm')}
          message={t('souvenir.deleteMessage')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={confirmDeleteSouvenir}
          onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
        />
      </div>
    </div>
  );
}