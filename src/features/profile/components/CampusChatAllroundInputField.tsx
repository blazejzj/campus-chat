type InputProps = {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    type?: string;
    placeholder?: string;
};

export default function CampusChatAllroundInputField({
    props,
}: {
    props: InputProps;
}) {
    return (
        <>
            <label className="block mb-1 text-sm font-medium">
                {props.label}
            </label>
            <input
                name={props.name}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                type={props.type || "text"}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
            />
        </>
    );
}
