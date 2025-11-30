export const SidebarItems = [
    { id: 'upload', labelKey: 'sidebar.upload', icon: 'CloudUpload', href: '/uploads', action: 'create' },
    {
        id: 'documents',
        labelKey: 'sidebar.documents',
        icon: 'File',
        subMenu: [
            { id: 'manage_document', labelKey: 'sidebar.manageDocuments', href: '/uploads/resources' },
        ],
    },
    { id: 'activities', labelKey: 'sidebar.activities', icon: 'Clock', href: '/activities' },
    { id: 'achievements', labelKey: 'sidebar.achievements', icon: 'Trophy', href: '/achievements' },
    { id: 'shop', labelKey: 'sidebar.souvenir', icon: 'ShoppingBag', href: '/shop' },
];

export const AdminSidebarItems = [
    // User functions that admin needs access to
    ...SidebarItems,

    // Separator between user and admin functions
    { id: 'divider', label: '─────────', type: 'separator' },

    // Admin-only functions
    { id: 'admin-dashboard', labelKey: 'sidebar.adminDashboard', icon: 'LayoutDashboard', href: '/dashboard' },
    { id: 'admin-users', labelKey: 'sidebar.adminUsers', icon: 'Users', href: '/admin/users' },
    {
        id: 'admin-moderation',
        labelKey: 'sidebar.adminModeration',
        icon: 'ShieldCheck',
        subMenu: [
            { id: 'moderation-uploads', labelKey: 'sidebar.moderationUploads', href: '/admin/moderation/uploads' },
            { id: 'moderation-comments', labelKey: 'sidebar.moderationComments', href: '/admin/moderation/comments' },
            { id: 'moderation-folders', labelKey: 'sidebar.moderationFolders', href: '/admin/moderation/folders' },
        ],
    },
    { id: 'admin-orders', labelKey: 'sidebar.adminOrders', icon: 'ShoppingCart', href: '/admin/orders' },
];