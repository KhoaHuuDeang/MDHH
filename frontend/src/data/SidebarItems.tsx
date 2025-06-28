
const IconMessageSquare = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" > </path></svg >;
const IconCheckCircle = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" > </path><polyline points="22 4 12 14.01 9 11.01"></polyline > </svg>;
const IconFolder = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" > </path></svg >;
const IconHistory = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" > </path><path d="M3 3v5h5"></path > <path d="M12 7v5l4 2" > </path></svg >;


const SidebarItems = [
    { id: 'chat', label: 'Chat', icon: IconMessageSquare, href: '/chat' },
    { id: 'tasks', label: 'Tasks', icon: IconCheckCircle, href: '/tasks', action: 'create' },
    {
        id: 'projects',
        label: 'Projects',
        icon: IconFolder,
        subMenu: [
            { id: 'project-1', label: 'Website Redesign', href: '/projects/1' },
            { id: 'project-2', label: 'Mobile App', href: '/projects/2' },
            { id: 'project-3', label: 'API Integration', href: '/projects/3' },
        ]
    },
    {
        id: 'recent',
        label: 'Recent',
        icon: IconHistory,
        subMenu: [
            { id: 'recent-1', label: 'Yesterday', href: '/recent/yesterday' },
            { id: 'recent-2', label: 'Last 7 days', href: '/recent/7-days' },
        ]
    },
];



export default SidebarItems;