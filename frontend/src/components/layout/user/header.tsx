

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">
                    Welcome back, Khoa
                </h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        admin
                    </span>
                </div>
            </div>
        </header>
    )
}