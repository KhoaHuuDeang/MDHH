

//~~~~~~~~sidebar~~~~~~~~~~
export interface SidebarMenuProps {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    action?: string;
    subMenu?: SidebarMenuProps[];
}

export interface SidebarMenuItems {
    items: SidebarMenuProps[]; // menu items
}
//~~~~~~~~sidebar-footer~~~~~~~~~~
export interface SidebarFooterProps{
    initials: string;
    name: string;
    email: string;
    avatar? : string;
}

export interface SidebarProfileMenuProps {
    items: SidebarMenuProps[];
    mockUser: SidebarFooterProps;
}
//~~~~~~~~-Header-~~~~~~~~~~
