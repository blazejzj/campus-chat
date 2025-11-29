import { links } from "@/app/links";
import { navigate } from "rwsdk/client";

export default function SideBar() {
    return (
        <aside className="w-64 border-r p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold theme-text-color">
                    CampusChat
                </h1>
            </div>

            <nav>
                <p className="text-gray-500 font-semibold text-2xl mb-3">
                    Settings
                </p>
                <ul className="pl-2 space-y-3">
                    <li>Profile</li>
                    <li>Notifications</li>
                    <li>Privacy</li>
                    <li>Visibility</li>
                    <li>Security</li>
                </ul>
            </nav>
            <div className="p-3 bg-linear-to-br from-gray-50 via-slate-50">
                <button
                    type="button"
                    onClick={() => navigate(links.pages.dashboard)}
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
                >
                    <span aria-hidden>←</span>
                    <span>Back to dashboard</span>
                </button>
            </div>
        </aside>
    );
}
