import FormField from "@/app/components/FormField";
import PrimaryButton from "@/app/components/PrimaryButton";

const chipButtonClass =
    "cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-full theme-text-color border-current hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]";

type PasswordSectionProps = {
    isEditingPassword: boolean;
    setIsEditingPassword: (value: boolean) => void;
    currentPassword: string;
    setCurrentPassword: (value: string) => void;
    newPassword: string;
    setNewPassword: (value: string) => void;
    confirmNewPassword: string;
    setConfirmNewPassword: (value: string) => void;
    currentPasswordError: string | null;
    setCurrentPasswordError: (value: string | null) => void;
    newPasswordError: string | null;
    setNewPasswordError: (value: string | null) => void;
    confirmNewPasswordError: string | null;
    setConfirmNewPasswordError: (value: string | null) => void;
    passwordFormError: string | null;
    setPasswordFormError: (value: string | null) => void;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
};

export default function PasswordSection({
    isEditingPassword,
    setIsEditingPassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    currentPasswordError,
    setCurrentPasswordError,
    newPasswordError,
    setNewPasswordError,
    confirmNewPasswordError,
    setConfirmNewPasswordError,
    passwordFormError,
    setPasswordFormError,
    loading,
    onSubmit,
}: PasswordSectionProps) {
    return (
        <>
            {!isEditingPassword ? (
                <button
                    type="button"
                    onClick={() => setIsEditingPassword(true)}
                    className={chipButtonClass}
                >
                    Change password
                </button>
            ) : (
                <form className="space-y-3" onSubmit={onSubmit}>
                    <FormField
                        label="Current password"
                        name="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setCurrentPasswordError(null);
                            setPasswordFormError(null);
                        }}
                        placeholder="Enter your current password"
                    />
                    {currentPasswordError && (
                        <p className="mt-1 text-xs text-red-500">
                            {currentPasswordError}
                        </p>
                    )}

                    <FormField
                        label="New password"
                        name="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setNewPasswordError(null);
                            setPasswordFormError(null);
                        }}
                        placeholder="Enter a new password"
                    />
                    {newPasswordError && (
                        <p className="mt-1 text-xs text-red-500">
                            {newPasswordError}
                        </p>
                    )}

                    <FormField
                        label="Confirm new password"
                        name="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            setConfirmNewPasswordError(null);
                            setPasswordFormError(null);
                        }}
                        placeholder="Repeat new password"
                    />
                    {confirmNewPasswordError && (
                        <p className="mt-1 text-xs text-red-500">
                            {confirmNewPasswordError}
                        </p>
                    )}

                    {passwordFormError && (
                        <p className="mt-2 text-xs text-red-500">
                            {passwordFormError}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1">
                        <PrimaryButton disabled={loading}>
                            {loading ? "Saving..." : "Save password"}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditingPassword(false);
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmNewPassword("");
                                setCurrentPasswordError(null);
                                setNewPasswordError(null);
                                setConfirmNewPasswordError(null);
                                setPasswordFormError(null);
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
