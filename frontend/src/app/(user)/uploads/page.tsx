"use client";

import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import UploadHeader from '@/components/layout/user/uploads/UploadHeader';
import UploadStepper from '@/components/layout/user/uploads/UploadStepper';
import FileUploadArea from '@/components/upload/stage1/FileUploadArea';
import UploadedFilesList from '@/components/upload/stage1/UploadedFilesList';
import { useUploadStore } from '@/store/uploadStore';
import { useRouter } from 'next/navigation';

const UploadPage = () => {
  const files = useUploadStore(state => state.files);
  const isSubmitting = useUploadStore(state => state.isSubmitting);
  const removeFile = useUploadStore(state => state.removeFile);
  const resetUpload = useUploadStore(state => state.resetUpload);
  const setCurrentStep = useUploadStore(state => state.setCurrentStep);
  const nextStep = useUploadStore(state => state.nextStep)
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const nextButtonState = useMemo(() => {
    const successFiles = files.filter(f => f.status === 'completed');
    const isDisabled = successFiles.length === 0 || isSubmitting;
    return {
      disabled: isDisabled,
      text: isSubmitting ? t('common.loading') : t('upload.next'),
      ariaLabel: isDisabled
        ? t('upload.step1Desc')
        : t('upload.step2Desc')
    };
  }, [files, isSubmitting, t]);

  const handleNext = useCallback(async () => {
    nextStep();
    router.push('/uploads/metadata');
  }, [router, nextStep]);

  const handleReset = useCallback(() => {
    if (window.confirm(t('upload.uploadComplete'))) {
      resetUpload();
    }
  }, [resetUpload, t]);

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-12" role="main">
        <UploadHeader />

        <nav aria-label={t('upload.inProgress')} className="mb-8">
          <UploadStepper />
        </nav>

        <section aria-labelledby="upload-section-title">
          <h2 id="upload-section-title" className="sr-only">
            {t('upload.step1')}
          </h2>
          <FileUploadArea />
        </section>
        {files.length > 0 && (
          <section aria-labelledby="files-list-title" className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 id="files-list-title" className="text-lg font-semibold text-gray-800">
                {t('upload.step1')} ({files.length})
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                type="button"
              >
                {t('common.delete')}
              </button>
            </div>
            <UploadedFilesList files={files} onRemoveFile={removeFile} />
          </section>
        )}

        <footer className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {files.filter(f => f.status === 'completed').length} / {files.length} {t('upload.uploadComplete')}
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
          {t('upload.shareInfo')}
        </aside>
      </main>
    </>
  );
};

export default UploadPage;
