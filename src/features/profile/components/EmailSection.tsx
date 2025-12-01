import FormField from "@/app/components/FormField";
import PrimaryButton from "@/app/components/PrimaryButton";

const chipButtonClass =
    "cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-full theme-text-color border-current hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]";

type EmailSectionProps = {
    email: string;
    isEditingEmail: boolean;
    setIsEditingEmail: (value: boolean) => void;
    newEmail: string;
    setNewEmail: (value: string) => void;
    emailPassword: string;
    setEmailPassword: (value: string) => void;
    emailError: string | null;
    setEmailError: (value: string | null) => void;
    emailPasswordError: string | null;
    setEmailPasswordError: (value: string | null) => void;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
};

export default function EmailSection({
    email,
    isEditingEmail,
    setIsEditingEmail,
    newEmail,
    setNewEmail,
    emailPassword,
    setEmailPassword,
    emailError,
    setEmailError,
    emailPasswordError,
    setEmailPasswordError,
    loading,
    onSubmit,
}: EmailSectionProps) {
    return (
        <>
            {!isEditingEmail ? (
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Current email
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                            {email}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsEditingEmail(true)}
                        className={chipButtonClass}
                    >
                        Change email
                    </button>
                </div>
            ) : (
                <form className="space-y-3" onSubmit={onSubmit}>
                    <FormField
                        label="New email"
                        name="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                            setNewEmail(e.target.value);
                            setEmailError(null);
                        }}
                        placeholder="Enter your new email"
                    />
                    {emailError && (
                        <p className="mt-1 text-xs text-red-500">
                            {emailError}
                        </p>
                    )}

                    <FormField
                        label="Confirm with password"
                        name="emailPassword"
                        type="password"
                        value={emailPassword}
                        onChange={(e) => {
                            setEmailPassword(e.target.value);
                            setEmailPasswordError(null);
                        }}
                        placeholder="Current password"
                    />
                    {emailPasswordError && (
                        <p className="mt-1 text-xs text-red-500">
                            {emailPasswordError}
                        </p>
                    )}

                    <p className="text-xs text-red-500">
                        Note: in a real production app you would also send a
                        verification email and only update the address once it
                        has been confirmed.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-1">
                        <PrimaryButton disabled={loading}>
                            {loading ? "Saving..." : "Save email"}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditingEmail(false);
                                setNewEmail(email);
                                setEmailPassword("");
                                setEmailError(null);
                                setEmailPasswordError(null);
                            }}
                            className="cursor-pointer text-sm font-medium text-gray-600 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}
