"use client";

import { useUploadStore } from "@/store/uploadStore";
import { getIcon } from "@/utils/getIcon";
import { useRouter } from "next/navigation";
import { useCallback } from "react";


export default function SuccessPage() {
  const router = useRouter();
  const { resetUpload } = useUploadStore();

  const handleReturnHome = useCallback(() => {
    resetUpload();
    router.push('/');
  }, [resetUpload, router]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          {getIcon('CheckCircle', 32, 'text-green-600')}
        </div>
        
        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tải lên thành công!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          File của bạn đã tải lên hoàn tất, hãy đợi file được duyệt
        </p>
        
        {/* Approval Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            Thời gian duyệt file thường từ 1-3 ngày làm việc. 
            Bạn sẽ nhận được thông báo khi file được phê duyệt.
          </p>
        </div>
        
        {/* Navigation Button */}
        <button
          onClick={handleReturnHome}
          className="px-8 py-3 bg-[#386641] text-white rounded-lg hover:bg-[#2d4f31] transition-all duration-200 font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
        >
          Quay về trang chủ
        </button>
      </div>
    </main>
  );
}