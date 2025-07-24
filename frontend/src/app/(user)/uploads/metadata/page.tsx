"use client";

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadStore } from '@/store/uploadStore';
import UploadStepper from '@/components/upload/UploadStepper';
import { getIcon } from '@/utils/getIcon';

// Constants theo pattern của codebase
const SUBJECTS = [
  { value: 'he-csdl', label: 'Hệ CSDL' },
  { value: 'giai-tich-1', label: 'Giải tích 1' },
  { value: 'lap-trinh', label: 'Lập trình' },
  { value: 'toan-cao-cap', label: 'Toán cao cấp' },
  { value: 'vat-ly', label: 'Vật lý đại cương' },
] as const;

const DOCUMENT_CATEGORIES = [
  { value: 'bai-giang', label: 'Bài giảng', icon: 'BookOpen' },
  { value: 'de-thi', label: 'Đề thi', icon: 'FileText' },
  { value: 'bai-tap', label: 'Bài tập', icon: 'PenTool' },
  { value: 'tai-lieu-tham-khao', label: 'Tài liệu tham khảo', icon: 'Book' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai', description: 'Mọi người có thể xem và tải về' },
  { value: 'private', label: 'Riêng tư', description: 'Chỉ bạn có thể xem' },
] as const;

export default function MetadataPage() {
  const router = useRouter();
  const { 
    metadata, 
    updateMetadata, 
    nextStep, 
    prevStep,
    validateCurrentStep,
    files 
  } = useUploadStore();

  // Validation state với useMemo để tối ưu performance
  const validationState = useMemo(() => {
    const isValid = validateCurrentStep();
    const missingFields = [];
    
    if (!metadata.title?.trim()) missingFields.push('Tiêu đề');
    if (!metadata.subject) missingFields.push('Môn học');
    if (!metadata.category) missingFields.push('Loại tài liệu');
    if (!metadata.description?.trim()) missingFields.push('Mô tả');

    return {
      isValid,
      missingFields,
      canProceed: isValid && files.filter(f => f.status === 'success').length > 0
    };
  }, [metadata, validateCurrentStep, files]);

  // Handlers với useCallback để tránh re-render
  const handleNext = useCallback(() => {
    if (validationState.canProceed) {
      nextStep();
      router.push('/uploads/review');
    }
  }, [validationState.canProceed, nextStep, router]);

  const handleBack = useCallback(() => {
    prevStep();
    router.push('/uploads');
  }, [prevStep, router]);

  const handleTagsChange = useCallback((value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    updateMetadata({ tags });
  }, [updateMetadata]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    updateMetadata({ [field]: value });
  }, [updateMetadata]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12" role="main">
      {/* Progress Stepper */}
      <nav aria-label="Upload progress" className="mb-8">
        <UploadStepper />
      </nav>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thông tin tài liệu
          </h1>
          <p className="text-gray-600">
            Vui lòng điền đầy đủ thông tin để tài liệu được phân loại chính xác
          </p>
        </header>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Title Field */}
          <section>
            <label 
              htmlFor="document-title"
              className="block text-sm font-semibold text-gray-700 mb-3"
            >
              Tiêu đề tài liệu *
            </label>
            <input
              id="document-title"
              type="text"
              value={metadata.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E] focus:border-transparent ${
                !metadata.title?.trim() ? 'border-red-300' : 'border-gray-300 hover:border-[#6A994E]'
              }`}
              placeholder="Ví dụ: Bài giảng Chương 1 - Giới thiệu về CSDL"
              required
              aria-describedby="title-help"
            />
            <p id="title-help" className="mt-1 text-xs text-gray-500">
              Tiêu đề ngắn gọn, mô tả chính xác nội dung tài liệu
            </p>
          </section>

          {/* Subject & Category Grid */}
          <section className="grid md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="subject-select"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Môn học *
              </label>
              <div className="relative">
                <select
                  id="subject-select"
                  value={metadata.subject || ''}
                  onChange={(e) => handleFieldChange('subject', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E] appearance-none ${
                    !metadata.subject ? 'border-red-300' : 'border-gray-300 hover:border-[#6A994E]'
                  }`}
                  required
                >
                  <option value="">Chọn môn học</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {getIcon('ChevronDown', 20, 'text-gray-400')}
                </div>
              </div>
            </div>

            <div>
              <label 
                htmlFor="category-select"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Loại tài liệu *
              </label>
              <div className="space-y-3">
                {DOCUMENT_CATEGORIES.map(category => (
                  <label 
                    key={category.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:border-[#6A994E] ${
                      metadata.category === category.value 
                        ? 'border-[#6A994E] bg-green-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={metadata.category === category.value}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      metadata.category === category.value 
                        ? 'border-[#6A994E] bg-[#6A994E]' 
                        : 'border-gray-300'
                    }`}>
                      {metadata.category === category.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getIcon(category.icon, 20, 'text-[#6A994E]')}
                      <span className="font-medium text-gray-900">{category.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <label 
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-3"
            >
              Mô tả chi tiết *
            </label>
            <textarea
              id="description"
              value={metadata.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E] resize-vertical ${
                !metadata.description?.trim() ? 'border-red-300' : 'border-gray-300 hover:border-[#6A994E]'
              }`}
              placeholder="Mô tả nội dung chính, chương trình liên quan, độ khó..."
              required
              aria-describedby="description-help"
            />
            <p id="description-help" className="mt-1 text-xs text-gray-500">
              Tối thiểu 20 ký tự. Mô tả càng chi tiết, tài liệu càng dễ tìm thấy
            </p>
          </section>

          {/* Tags */}
          <section>
            <label 
              htmlFor="tags"
              className="block text-sm font-semibold text-gray-700 mb-3"
            >
              Từ khóa (Tags)
            </label>
            <input
              id="tags"
              type="text"
              placeholder="Ví dụ: cơ sở dữ liệu, SQL, quan hệ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6A994E] hover:border-[#6A994E]"
              onChange={(e) => handleTagsChange(e.target.value)}
              aria-describedby="tags-help"
            />
            <p id="tags-help" className="mt-1 text-xs text-gray-500">
              Phân cách bằng dấu phẩy. Giúp người khác tìm tài liệu dễ dàng hơn
            </p>
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Visibility */}
          <section>
            <fieldset>
              <legend className="block text-sm font-semibold text-gray-700 mb-3">
                Quyền truy cập
              </legend>
              <div className="space-y-3">
                {VISIBILITY_OPTIONS.map(option => (
                  <label 
                    key={option.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-[#6A994E] ${
                      metadata.visibility === option.value 
                        ? 'border-[#6A994E] bg-green-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={metadata.visibility === option.value}
                      onChange={(e) => handleFieldChange('visibility', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                      metadata.visibility === option.value 
                        ? 'border-[#6A994E] bg-[#6A994E]' 
                        : 'border-gray-300'
                    }`}>
                      {metadata.visibility === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </form>

        {/* Validation Summary */}
        {validationState.missingFields.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-start gap-3">
              {getIcon('AlertCircle', 20, 'text-red-600 mt-0.5')}
              <div>
                <h3 className="font-medium text-red-800">Vui lòng hoàn thiện thông tin</h3>
                <p className="text-sm text-red-700 mt-1">
                  Còn thiếu: {validationState.missingFields.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <footer className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
          >
            {getIcon('ChevronLeft', 18)}
            Quay lại
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {files.filter(f => f.status === 'success').length} file đã sẵn sàng
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={!validationState.canProceed}
              className="flex items-center gap-2 px-6 py-3 bg-[#386641] text-white rounded-lg hover:bg-[#2d4f31] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
              aria-describedby="next-help"
            >
              Tiếp tục
              {getIcon('ChevronRight', 18)}
            </button>
            {!validationState.canProceed && (
              <p id="next-help" className="sr-only">
                Cần hoàn thiện thông tin và có ít nhất một file thành công để tiếp tục
              </p>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}