export const SidebarItems = [
    { id: 'videos', label: 'Videos', icon: 'Youtube', href: '/videos' },
    { id: 'upload', label: 'Upload', icon: 'CloudUpload', href: '/upload', action: 'create' },
    {
        id: 'documents',
        label: 'Documents',
        icon: 'File',
        subMenu: [
            { id: 'project-1', label: 'Website Redesign', href: '/projects/1' },
            { id: 'project-2', label: 'Mobile App', href: '/projects/2' },
            { id: 'project-3', label: 'API Integration', href: '/projects/3' },
        ],
    },
    {
        id: 'recent',
        label: 'Recent',
        icon: 'History',
        subMenu: [
            { id: 'recent-1', label: 'Yesterday', href: '/recent/yesterday' },
            { id: 'recent-2', label: 'Last 7 days', href: '/recent/7-days' },
        ],
    },
];

export const AdminSidebarItems = [
    { id: 'admin-dashboard', label: 'Bảng Quản trị', icon: 'LayoutDashboard', href: '/admin/dashboard' },
    { id: 'admin-moderation', label: 'Kiểm Soát Nội dung', icon: 'ShieldCheck', href: '/admin/moderation' },
    { id: 'admin-users', label: 'Quản lý Người dùng', icon: 'Users', href: '/admin/users' },
    { id: 'admin-orders', label: 'Quản lý Đơn hàng', icon: 'ShoppingCart', href: '/admin/orders' },
];