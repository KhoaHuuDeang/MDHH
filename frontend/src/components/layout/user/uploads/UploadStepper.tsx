"use client";

import React, { useMemo } from "react";
import { useUploadStore } from "@/store/uploadStore";
import { getIcon } from "@/utils/getIcon";

/**
 * UploadStepper (UI Pass)
 * - Follows DesignUI Convention colors & interaction patterns
 * - Animations: Tailwind-only (transition, ring, subtle pulse on current step)
 * - A11y: aria-current, aria-orientation, screen-reader texts
 */

function UploadStepper() {
  // Performance: single-field selector
  const currentStep = useUploadStore((s) => s.currentStep);

  // Steps (stable reference for i18n later)
  const steps = useMemo(
    () => [
      { id: 1, title: "Upload Files", description: "Chọn và tải lên tài liệu", icon: "Upload" },
      { id: 2, title: "Add Details", description: "Điền thông tin chi tiết", icon: "FileText" },
      { id: 3, title: "Review & Submit", description: "Xem lại và hoàn thành", icon: "CheckCircle" },
    ],
    []
  );

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed" as const;
    if (stepId === currentStep) return "current" as const;
    return "upcoming" as const;
  };

  const dotBase =
    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-sm transition-all duration-200";
  const labelBase = "text-sm font-medium tracking-tight";
  const descBase = "mt-1 text-xs leading-snug text-gray-500";
  const connectorBase = "h-0.5 mx-2 lg:mx-4 transition-all duration-200";

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-4" aria-label="Upload progress" role="navigation">
      {/* Desktop */}
      <ol className="hidden md:flex items-center justify-between" aria-orientation="horizontal">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isCurrent = status === "current";
          const isCompleted = status === "completed";
          return (
            <li key={step.id} className="flex items-center" aria-current={isCurrent ? "step" : undefined}>
              <div className="flex flex-col items-center">
                <div
                  className={[
                    dotBase,
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-blue-500 text-white ring-4 ring-blue-200/40",
                    status === "upcoming" && "bg-gray-200 text-gray-600",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`Step ${step.id}: ${step.title} (${status})`}
                >
                  {isCompleted ? getIcon("Check", 18) : step.id}
                </div>
                <div className="mt-3 text-center">
                  <div
                    className={[
                      labelBase,
                      isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-600",
                      "transition-colors duration-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {step.title}
                  </div>
                  <p className={descBase}>{step.description}</p>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    connectorBase,
                    step.id < currentStep
                      ? "bg-gradient-to-r from-green-500 to-green-500 w-20 lg:w-28"
                      : "bg-gray-300 w-14 lg:w-20",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <ol className="md:hidden space-y-4" aria-orientation="vertical">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const isCurrent = status === "current";
          const isCompleted = status === "completed";
          return (
            <li key={step.id} className="flex items-center gap-4" aria-current={isCurrent ? "step" : undefined}>
              <div
                className={[
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm transition-all duration-200",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-blue-500 text-white ring-4 ring-blue-200/40",
                  status === "upcoming" && "bg-gray-200 text-gray-600",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Step ${step.id}: ${step.title} (${status})`}
              >
                {isCompleted ? getIcon("Check", 14) : step.id}
              </div>

              <div className="flex-1 min-w-0">
                <div className={[labelBase, isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-600"].join(" ")}>{
                  step.title
                }</div>
                <p className={descBase}>{step.description}</p>
              </div>

              <div className="flex-shrink-0 text-xs font-medium">
                {isCompleted && <span className="text-green-600">✓ Done</span>}
                {isCurrent && <span className="text-blue-600 animate-pulse">In progress</span>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1]?.title}`}
      </p>
    </div>
  );
}

UploadStepper.displayName = "UploadStepper";
export default React.memo(UploadStepper);
