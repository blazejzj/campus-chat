type Props = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    size?: "small" | "medium" | "large";
};

export default function CampusChatAllroundButton({
    children,
    type = "button",
    onClick,
    disabled = false,
    className = "",
    size = "medium",
}: Props) {
    const sizeClasses = {
        small: "w-auto px-4 py-1.5 text-sm",
        medium: "w-auto px-6 py-2 text-base",
        large: "w-full py-2.5",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-xl theme-bg-color text-white font-semibold hover:opacity-90 transition disabled:opacity-60 ${sizeClasses[size]} ${className}`}
        >
            {children}
        </button>
    );
}
