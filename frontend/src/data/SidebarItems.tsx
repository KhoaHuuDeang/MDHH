export const SidebarItems = [
    { id: 'upload', label: 'Upload', icon: 'CloudUpload', href: '/uploads', action: 'create' },
    {
        id: 'documents',
        label: 'Documents',
        icon: 'File',
        subMenu: [
            { id: 'manage_document', label: 'Manage Document', href: '/uploads/resources' },
        ],
    },
];

export const AdminSidebarItems = [
    // User functions that admin needs access to
    ...SidebarItems,
    
    // Separator between user and admin functions
    { id: 'divider', label: '─────────', type: 'separator' },
    
    // Admin-only functions
    { id: 'admin-dashboard', label: 'Bảng Quản trị', icon: 'LayoutDashboard', href: '/admin/dashboard' },
    { id: 'admin-users', label: 'Quản lý Người dùng', icon: 'Users', href: '/admin/users' },
    { id: 'admin-moderation', label: 'Kiểm Soát Nội dung', icon: 'ShieldCheck', href: '/admin/moderation' },
    { id: 'admin-orders', label: 'Quản lý Đơn hàng', icon: 'ShoppingCart', href: '/admin/orders' },
];