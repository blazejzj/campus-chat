import { links } from "@/app/links";

type ProfileHeaderProps = {
    displayName: string;
    email: string;
    userInitial: string;
};

export default function ProfileHeader({
    displayName,
    email,
    userInitial,
}: ProfileHeaderProps) {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <a
                href={links.pages.dashboard}
                className="lg:hidden inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm w-fit mb-2"
            >
                <span aria-hidden>←</span>
                <span>Back</span>
            </a>

            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Account
                </p>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                    Profile Settings
                </h1>
                <p className="mt-2 text-sm text-gray-500 max-w-xl">
                    Update your personal details, security settings, and how we
                    contact you.
                </p>
            </div>

            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold theme-text-color">
                    {userInitial}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-40 md:max-w-[220px]">
                        {displayName || email}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-40 md:max-w-[220px]">
                        {email}
                    </span>
                </div>
            </div>
        </header>
    );
}
