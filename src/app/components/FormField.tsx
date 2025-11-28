type Props = {
    label: string;
    name: string;
    type?: "text" | "email" | "password";
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minLength?: number;
    autoComplete?: string;
};

export default function FormField({
    label,
    name,
    type = "text",
    placeholder = "",
    value,
    onChange,
    minLength,
    autoComplete,
}: Props) {
    return (
        <div className="flex flex-col text-left">
            <label
                htmlFor={name}
                className="text-sm font-medium text-gray-700 mb-1"
            >
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                minLength={minLength}
                autoComplete={autoComplete}
                required
                className="border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
            />
        </div>
    );
}
