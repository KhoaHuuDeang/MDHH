export default function SpinnerLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#386641]"></div>
                <p className="text-lg text-gray-600">Đang tải thông tin...</p>
            </div>
        </div>
    )
}