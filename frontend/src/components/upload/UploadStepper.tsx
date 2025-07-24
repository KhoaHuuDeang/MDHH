// components/upload/UploadStepper.tsx
"use client";
import { useUploadStore } from '@/store/uploadStore';
import { getIcon } from '@/utils/getIcon';

export default function UploadStepper() {
  const { currentStep, validateCurrentStep } = useUploadStore();

  const steps = [
    {
      id: 1,
      title: 'Upload Files',
      description: 'Chọn và tải lên tài liệu',
      icon: 'Upload'
    },
    {
      id: 2,
      title: 'Add Details',
      description: 'Điền thông tin chi tiết',
      icon: 'FileText'
    },
    {
      id: 3,
      title: 'Review & Submit',
      description: 'Xem lại và hoàn thành',
      icon: 'CheckCircle'
    }
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${status === 'current' ? 'bg-blue-500 text-white' : ''}
                  ${status === 'upcoming' ? 'bg-gray-300 text-gray-600' : ''}
                `}>
                  {status === 'completed' ?
                    getIcon('Check', 20) :
                    step.id
                  }
                </div>

                {/* Step Info */}
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${status === 'current' ? 'text-blue-600' :
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-16 lg:w-24 h-0.5 mx-2 lg:mx-4 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-center space-x-4">
              {/* Step Circle */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0
                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${status === 'current' ? 'bg-blue-500 text-white' : ''}
                ${status === 'upcoming' ? 'bg-gray-300 text-gray-600' : ''}
              `}>
                {status === 'completed' ?
                  getIcon('Check', 16) :
                  step.id
                }
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className={`text-sm font-medium ${status === 'current' ? 'text-blue-600' :
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {status === 'completed' && (
                  <div className="text-green-500 text-xs font-medium">✓ Completed</div>
                )}
                {status === 'current' && (
                  <div className="text-blue-500 text-xs font-medium">Current</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}