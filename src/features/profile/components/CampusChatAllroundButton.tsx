type Props = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
};

export default function CampusChatAllroundButton({
    children,
    type = "button",
    onClick,
    disabled = false,
    className = "",
}: Props) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full rounded-xl theme-bg-color text-white py-2.5 font-semibold hover:opacity-90 transition disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}
