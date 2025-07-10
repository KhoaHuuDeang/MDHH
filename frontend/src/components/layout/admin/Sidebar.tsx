const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Users', path: '/admin/users' },
    ];

    return (
        <div className="w-64 bg-gray-800 text-white h-screen p-4">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <ul>
                {menuItems.map((item) => (
                    <li key={item.name} className="mb-2">
                        <a
                            href={item.path}
                            className="block p-2 rounded hover:bg-gray-700"
                        >
                            {item.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;