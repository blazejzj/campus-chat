type NotificationsSectionProps = {
    notificationsEnabled: boolean;
    onToggle: () => void;
};

export default function NotificationsSection({
    notificationsEnabled,
    onToggle,
}: NotificationsSectionProps) {
    return (
        <>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onToggle}
                        className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--primary-color) ${
                            notificationsEnabled
                                ? "theme-bg-color"
                                : "bg-gray-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                notificationsEnabled
                                    ? "translate-x-6"
                                    : "translate-x-1"
                            }`}
                        />
                    </button>

                    <span className="text-sm font-medium text-gray-800">
                        Enable notifications
                    </span>
                </div>
            </div>
            <p className="text-xs text-gray-500">
                We'll only send you important updates related to your account
                and activity.
            </p>
        </>
    );
}
