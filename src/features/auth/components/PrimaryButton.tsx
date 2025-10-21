type Props = {
    disabled?: boolean;
    children: React.ReactNode;
};

export default function PrimaryButton({ disabled, children }: Props) {
    return (
        <button
            disabled={disabled}
            className="w-full rounded-xl theme-bg-color text-white py-2.5 font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
            {children}
        </button>
    );
}
