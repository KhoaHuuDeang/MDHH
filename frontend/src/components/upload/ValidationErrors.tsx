
import { getIcon } from "@/utils/getIcon";
import React from "react";

interface ValidationErrorsProps {
  errors: Record<string, string[]>;
  className?: string;
}

function ValidationErrors({ errors, className = '' }: ValidationErrorsProps) {
  if (!errors || typeof errors !== 'object') {
    return null;
  }
  const errorEntries = Object.entries(errors).filter(([, errs]) => errs && errs.length > 0);

  if (errorEntries.length === 0) return null;

  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-2">
        {getIcon('AlertCircle', 20, 'text-red-600 mt-0.5')}
        <div className="flex-1">
          <h3 className="font-medium text-red-800 mb-2">
            Please fix the following issues:
          </h3>
          <div className="space-y-2">
            {errorEntries.map(([field, fieldErrors]) => (
              <div key={field}>
                <h4 className="text-sm font-medium text-red-700 capitalize">
                  {field}:
                </h4>
                <ul className="mt-1 text-sm text-red-600 list-disc list-inside ml-2">
                  {fieldErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ValidationErrors);