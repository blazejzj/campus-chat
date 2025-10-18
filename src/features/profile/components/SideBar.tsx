export default function SideBar() {
    return (
        <aside className="w-64 border-r p-4">
            <div className="mb-8 bg-amber-300">
                <h1 className="text-2xl font-bold">CampusChat</h1>
            </div>

            <nav>
                <p className="text-gray-500 font-semibold text-2xl">Settings</p>
                <ul className="pl-2 space-y-3">
                    <li>Profile</li>
                    <li>Notifications</li>
                    <li>Privacy</li>
                    <li>Visibility</li>
                    <li>Security</li>
                </ul>
            </nav>
        </aside>
    );
}
