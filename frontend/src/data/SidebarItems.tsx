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
    { id: 'activities', label: 'Activities', icon: 'Clock', href: '/activities' },
    { id: 'achievements', label: 'Achievements', icon: 'Trophy', href: '/achievements' },
    { id: 'shop', label: 'Souvenir', icon: 'ShoppingBag', href: '/shop' },
];

export const AdminSidebarItems = [
    // User functions that admin needs access to
    ...SidebarItems,
    
    // Separator between user and admin functions
    { id: 'divider', label: '─────────', type: 'separator' },
    
    // Admin-only functions
    { id: 'admin-dashboard', label: 'Bảng Quản trị', icon: 'LayoutDashboard', href: '/dashboard' },
    { id: 'admin-users', label: 'Quản lý Người dùng', icon: 'Users', href: '/admin/users' },
    { 
        id: 'admin-moderation', 
        label: 'Kiểm Soát Nội dung', 
        icon: 'ShieldCheck',
        subMenu: [
            { id: 'moderation-uploads', label: 'Uploads', href: '/admin/moderation/uploads' },
            { id: 'moderation-comments', label: 'Comments', href: '/admin/moderation/comments' },
            { id: 'moderation-folders', label: 'Folders', href: '/admin/moderation/folders' },
        ],
    },
    { id: 'admin-orders', label: 'Quản lý Đơn hàng', icon: 'ShoppingCart', href: '/admin/orders' },
];;;