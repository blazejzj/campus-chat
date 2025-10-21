type Props = {
    title: string;
    backHref?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export default function AuthCard({
    title,
    backHref = "/",
    children,
    footer,
}: Props) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <a
                    href={backHref}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Go back
                </a>

                <h2 className="mt-4 text-2xl font-semibold theme-text-color">
                    {title}
                </h2>

                <div className="mt-6">{children}</div>

                {footer ? (
                    <div className="mt-4 text-sm text-gray-600">{footer}</div>
                ) : null}
            </div>
        </main>
    );
}
