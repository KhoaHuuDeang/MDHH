"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import UploadHeader from '@/components/layout/user/uploads/UploadHeader';
import UploadStepper from '@/components/layout/user/uploads/UploadStepper';
import FileUploadArea from '@/components/upload/stage1/FileUploadArea';
import UploadedFilesList from '@/components/upload/stage1/UploadedFilesList';
import { useUploadStore } from '@/store/uploadStore';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/services/userService';
const UploadPage = () => {
  const { data: session } = useSession();
  const files = useUploadStore(state => state.files);
  const isSubmitting = useUploadStore(state => state.isSubmitting);
  const removeFile = useUploadStore(state => state.removeFile);
  const resetUpload = useUploadStore(state => state.resetUpload);
  const setCurrentStep = useUploadStore(state => state.setCurrentStep);
  const nextStep = useUploadStore(state => state.nextStep)
  const router = useRouter();
  // Set auth token when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [session?.accessToken]);

  // Debug: Track files array changes
  useEffect(() => {
    setCurrentStep(1);
  }, [files]);
  const nextButtonState = useMemo(() => {

    // lọc ra file có status thành công
    const successFiles = files.filter(f => f.status === 'completed');
    // Kiểm tra có file hay chưa, nếu có -> true, chưa -> false
    const isDisabled = successFiles.length === 0 || isSubmitting;
    // xử lý trạng thái || className
    return {
      disabled: isDisabled,
      text: isSubmitting ? 'is processing...' : 'next',
      ariaLabel: isDisabled
        ? 'At least one file must be successfully uploaded to continue'
        : 'Submit files and continue to next step'
    };
  }, [files, isSubmitting]);

  const handleNext = useCallback(async () => {
    nextStep();
    router.push('/uploads/metadata');

  }, [router]);

  const handleReset = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả file đã upload?')) {
      resetUpload();
    }
  }, [resetUpload]);

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-12" role="main">
        <UploadHeader />

        <nav aria-label="Upload progress" className="mb-8">
          <UploadStepper />
        </nav>

        <section aria-labelledby="upload-section-title">
          <h2 id="upload-section-title" className="sr-only">
            File Upload Section
          </h2>
          <FileUploadArea />
        </section>
        {files.length > 0 && (
          <section aria-labelledby="files-list-title" className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 id="files-list-title" className="text-lg font-semibold text-gray-800">
                File uploaded({files.length})
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                type="button"
              >
                Xóa tất cả
              </button>
            </div>
            <UploadedFilesList files={files} onRemoveFile={removeFile} />
          </section>
        )}

        <footer className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {files.filter(f => f.status === 'completed').length} / {files.length} succeed in uploading files
          </div>

          <button
            onClick={handleNext}
            disabled={nextButtonState.disabled}
            className="bg-[#386641] text-white font-semibold px-10 py-3 rounded-lg hover:bg-[#2d4f31] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#386641] focus:ring-offset-2"
            type="button"
            aria-label={nextButtonState.ariaLabel}
          >
            {isSubmitting && (
              <span className="mr-2" aria-hidden="true">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
              </span>
            )}
            {nextButtonState.text}
          </button>
        </footer>
        <aside className="text-center text-xs text-gray-500 mt-12 max-w-2xl mx-auto" role="note">
          By uploading resources, you confirm that you own the copyright or have the right to use these materials. Your contribution will help the learning community grow.
        </aside>
      </main>
    </>
  );
};

export default UploadPage;

