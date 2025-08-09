import React from 'react';

export default function UploadHeader() {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        <span>Share </span>
        <span className="text-blue-600">study documents and videos</span>
        <span> to support the student community</span>
      </h1>
      <p className="mt-2 text-gray-600">
        <span>You can upload PDF, Word documents, or videos related to learning.</span>
        <br />
        <span className="font-semibold text-gray-800">Your contribution will help many others learn better!</span>
      </p>
    </div>
  );
}