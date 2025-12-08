import React from "react";

export default function UploadHeader() {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        <span>Chia sẻ </span>
        <span className="text-blue-600">tài liệu học tập và video</span>
        <span> để hỗ trợ cộng đồng học sinh</span>
      </h1>
      <p className="mt-2 text-gray-600">
        <span>Bằng cách tải lên tài liệu học tập và video</span>
        <br />
        <span className="font-semibold text-gray-800">
          Đóng góp của bạn sẽ giúp nhiều người học tốt hơn!
        </span>
      </p>
    </div>
  );
}
