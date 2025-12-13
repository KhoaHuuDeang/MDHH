'use client';

import React from 'react';
import Image from 'next/image';
import { getIcon } from '@/utils/getIcon';
import { useFilteredResources } from '@/hooks/useFilteredResources';
import { uploadService } from '@/services/uploadService';
import useNotifications from '@/hooks/useNotifications';

interface ResourcesListSectionProps {
  userId: string;
  accessToken: string;
}

function ResourcesListSection({ userId, accessToken }: ResourcesListSectionProps) {
  const toast = useNotifications();
  const {
    resources,
    isLoading,
    error,
    activeTab,
    searchTerm,
    currentPage,
    totalPages,
    total,
    tabCounts,
    setActiveTab,
    setSearchTerm,
    setCurrentPage,
    refetch
  } = useFilteredResources({
    userId,
    accessToken,
    enabled: true
  });

  const handleDownload = async (uploadId: string, fileName: string) => {
    try {
      const { downloadUrl } = await uploadService.generateDownloadUrl(uploadId);
      window.open(downloadUrl, '_blank');
      toast.success(`Đang tải xuống ${fileName}`);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải xuống');
    }
  };

  const handleDelete = async (resourceId: string, title: string) => {
    if (!confirm(`Xác nhận xóa "${title}"?`)) return;
    try {
      await uploadService.deleteUpload(resourceId);
      toast.success('Đã xóa tài liệu');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa');
    }
  };

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    const statusConfig = {
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: 'CheckCircle', 
        text: 'Approved' 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: 'Clock', 
        text: 'Pending' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: 'XCircle', 
        text: 'Rejected' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <div className="flex flex-col">
        <span className={`inline-flex items-center gap-1.5 ${config.color} text-xs font-semibold px-2.5 py-1 rounded-full mb-1`}>
          {getIcon(config.icon, 12)}
          {config.text}
        </span>
        {status === 'rejected' && rejectionReason && (
          <p className="text-xs text-red-600 text-left md:text-right">
            Lý do: {rejectionReason}
          </p>
        )}
      </div>
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Tabs and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý tài liệu</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Tất cả', count: tabCounts.all },
                { key: 'approved', label: 'Đã duyệt', count: tabCounts.approved },
                { key: 'pending', label: 'Chờ duyệt', count: tabCounts.pending },
                { key: 'rejected', label: 'Bị từ chối', count: tabCounts.rejected }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({isLoading ? '...' : tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto disabled:opacity-50"
              />
              {getIcon('Search', 20, 'absolute left-3 top-2.5 text-gray-400')}
            </div>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="grid gap-6 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Đang tải tài liệu...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                {getIcon('AlertCircle', 32, 'text-red-500')}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        ) : resources.length > 0 ? (
          resources.map((upload) => (
            <div key={upload.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-300 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Part */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-20 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      {upload.fileType.toLowerCase() === 'pdf' ? (
                        getIcon('FileText', 32, 'text-red-500')
                      ) : upload.fileType.toLowerCase().includes('word') || upload.fileType.toLowerCase().includes('doc') ? (
                        getIcon('FileText', 32, 'text-blue-500')
                      ) : upload.fileType.toLowerCase().includes('excel') || upload.fileType.toLowerCase().includes('xls') ? (
                        getIcon('FileSpreadsheet', 32, 'text-green-500')
                      ) : upload.fileType.toLowerCase().includes('ppt') || upload.fileType.toLowerCase().includes('powerpoint') ? (
                        getIcon('Presentation', 32, 'text-orange-500')
                      ) : upload.fileType.toLowerCase().includes('zip') || upload.fileType.toLowerCase().includes('rar') ? (
                        getIcon('FileArchive', 32, 'text-yellow-600')
                      ) : (
                        getIcon('File', 32, 'text-gray-500')
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {upload.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
                        {upload.description}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 border-b border-gray-200 pb-3 mb-3">
                        <span className="flex items-center gap-1.5">
                          {getIcon('BookOpen', 14)}
                          {upload.subject || 'Chưa phân loại'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {getIcon('Tag', 14)}
                          {upload.folderTags || 'Không có tag'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {getIcon('Folder', 14)}
                          {upload.folderName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {getIcon('Calendar', 14)}
                          {upload.uploadDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {getIcon('File', 14)}
                          {upload.fileType} • {upload.fileSize}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1 font-medium">
                          {getIcon('ThumbsUp', 16, 'text-blue-500')}
                          {upload.upvotes}
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          {getIcon('Download', 16, 'text-green-500')}
                          {upload.downloads}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Part */}
                <div className="flex flex-col justify-between items-start md:items-end gap-4 md:w-48">
                  {getStatusBadge(upload.status)}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(upload.uploadId, upload.title)}
                      disabled={upload.status !== 'approved'}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {getIcon('Download', 14)}
                      Tải
                    </button>
                    <button
                      onClick={() => handleDelete(upload.id, upload.title)}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      {getIcon('Trash2', 14)}
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              {getIcon('FileText', 48, 'text-gray-400')}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy tài liệu</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!isLoading && !error && resources.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Hiển thị {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, total)} của {total} tài liệu
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getIcon('ChevronLeft', 16)}
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                {getIcon('ChevronRight', 16)}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

ResourcesListSection.displayName = 'ResourcesListSection';
export default React.memo(ResourcesListSection);