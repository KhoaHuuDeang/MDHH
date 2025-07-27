
"use client";
import UploadStepper from '@/components/upload/UploadStepper';
import { useUploadStore } from '@/store/uploadStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const [agreement, setAgreement] = useState(false);
  const { files, metadata, submitFiles, prevStep } = useUploadStore();

  const handleSubmit = async () => {
    if (agreement) {
      await submitFiles();
      router.push('/uploads/success');
    }
  };

  const handleBack = () => {
    prevStep();
    router.push('/uploads/metadata');
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <UploadStepper />
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Xem lại thông tin
        </h1>

        {/* Files Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Files đã tải lên</h2>
          <div className="space-y-3">
            {files.filter(f => f.status === 'success').map(file => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Metadata Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Thông tin tài liệu</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700">Tiêu đề</h3>
              <p className="text-gray-900">{metadata.title}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Môn học</h3>
              <p className="text-gray-900">{metadata.subject}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Loại tài liệu</h3>
              <p className="text-gray-900">{metadata.category}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Quyền truy cập</h3>
              <p className="text-gray-900">
                {metadata.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-700">Mô tả</h3>
              <p className="text-gray-900">{metadata.description}</p>
            </div>
          </div>
        </section>

        {/* Agreement */}
        <div className="mb-8">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreement}
              onChange={(e) => setAgreement(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              Tôi xác nhận rằng tôi sở hữu bản quyền hoặc có quyền sử dụng các tài liệu này. 
              Tôi hiểu rằng việc tải lên tài liệu vi phạm bản quyền có thể dẫn đến việc tài khoản bị khóa.
            </span>
          </label>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Quay lại
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!agreement}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Hoàn thành tải lên
          </button>
        </div>
      </div>
    </main>
  );
}