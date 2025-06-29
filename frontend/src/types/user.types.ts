export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    action?: string;
    subMenu?: MenuItem[];
}

export interface MenuProps {
    items: MenuItem[]; // menu items
}

export interface UserData {
    initials: string;
    name: string;
    email: string;
}


export interface ProfileMenuProps {
    items: MenuItem[];
    mockUser: UserData;
}