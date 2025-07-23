// components/upload/UploadStepper.tsx
import React from 'react';

export default function UploadStepper() {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex items-center">
        {/* Step 1: Upload */}
        <div className="flex items-center text-blue-600 relative">
          <div className="rounded-full h-8 w-8 flex items-center justify-center bg-blue-600 text-white font-bold">1</div>
        <div className="absolute top-0 -ml-12 text-center mt-12 w-32 text-xs font-medium uppercase text-blue-600">Upload</div>
      </div>
      <div className="flex-auto border-t-2 border-blue-600"></div>
      {/* Step 2: Details */}
      <div className="flex items-center text-gray-500 relative">
        <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-300">2</div>
        <div className="absolute top-0 -ml-12 text-center mt-12 w-32 text-xs font-medium uppercase text-gray-500">Details</div>
      </div>
      <div className="flex-auto border-t-2 border-gray-300"></div>
      {/* Step 3: Done */}
      <div className="flex items-center text-gray-500 relative">
        <div className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-300">3</div>
        <div className="absolute top-0 -ml-11 text-center mt-12 w-32 text-xs font-medium uppercase text-gray-500">Done</div>
      </div>
    </div>
  </div>
);
}