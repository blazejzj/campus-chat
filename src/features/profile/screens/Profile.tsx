"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useFetch } from "@/app/hooks/useFetch";
import { links } from "@/app/links";
import FormField from "@/app/components/FormField";
import PrimaryButton from "@/app/components/PrimaryButton";
import CampusChatAllroundButton from "@/features/profile/components/CampusChatAllroundButton";
import SideBar from "@/features/profile/components/SideBar";

type ProfileResponse = {
    email: string;
    displayName?: string;
    status?: string;
    avatarUrl?: string;
    notificationsEnabled?: boolean;
};

const chipButtonClass =
    "cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-full theme-text-color border-current hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]";

type SettingsSectionProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

function SettingsSection({ title, subtitle, children }: SettingsSectionProps) {
    return (
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4 md:p-7 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
                <div>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { request, loading } = useFetch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState("");
    const [status, setStatus] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");

    const [originalDisplayName, setOriginalDisplayName] = useState("");
    const [originalStatus, setOriginalStatus] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailPasswordError, setEmailPasswordError] = useState<string | null>(
        null
    );

    const [currentPasswordError, setCurrentPasswordError] = useState<
        string | null
    >(null);
    const [newPasswordError, setNewPasswordError] = useState<string | null>(
        null
    );
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState<
        string | null
    >(null);
    const [passwordFormError, setPasswordFormError] = useState<string | null>(
        null
    );

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await request<ProfileResponse>(
                    links.api.profile.me,
                    {
                        credentials: "include",
                    }
                );

                setEmail(data.email || "");
                setNewEmail(data.email || "");
                setDisplayName(data.displayName || "");
                setOriginalDisplayName(data.displayName || "");
                setStatus(data.status || "");
                setOriginalStatus(data.status || "");
                setAvatarUrl(data.avatarUrl || "");
                setNotificationsEnabled(data.notificationsEnabled ?? true);
                updateUser({
                    email: data.email,
                    displayName: data.displayName,
                });
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast.error("Failed to load profile");
            }
        }

        if (user?.id) {
            loadProfile();
        }
    }, [user?.id]);

    const handleSaveProfileInfo = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const updated = await request<ProfileResponse>(
                links.api.profile.me,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        displayName,
                        status,
                    }),
                    credentials: "include",
                }
            );

            if (updated.displayName !== undefined) {
                setDisplayName(updated.displayName);
                setOriginalDisplayName(updated.displayName);
                updateUser({ displayName: updated.displayName });
            }
            if (updated.status !== undefined) {
                setStatus(updated.status);
                setOriginalStatus(updated.status);
            }

            setIsEditingName(false);
            setIsEditingStatus(false);
            toast.success("Profile updated");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        }
    };

    const handleSaveEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        setEmailError(null);
        setEmailPasswordError(null);

        if (!newEmail || newEmail === email) {
            setEmailError("Please enter a different email.");
            return;
        }

        if (!emailPassword) {
            setEmailPasswordError("Please enter your current password.");
            return;
        }

        try {
            const updated = await request<ProfileResponse>(
                links.api.profile.me,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: newEmail,
                        currentPassword: emailPassword,
                    }),
                    credentials: "include",
                }
            );

            if (updated.email !== undefined) {
                setEmail(updated.email);
                setNewEmail(updated.email);
                updateUser({ email: updated.email });
            }

            setEmailPassword("");
            setIsEditingEmail(false);
            toast.success("Email updated");
        } catch (error: any) {
            console.error("Failed to update email:", error);

            const reason =
                error?.reason ??
                error?.data?.reason ??
                error?.response?.data?.reason;
            const message =
                error?.message ??
                error?.data?.message ??
                error?.response?.data?.message;

            if (reason === "WRONG_CREDENTIALS") {
                setEmailPasswordError("Wrong password.");
            } else if (reason === "EMAIL_IN_USE") {
                setEmailError("That email is already in use.");
            } else {
                setEmailError(message || "Failed to update email.");
                toast.error("Failed to update email");
            }
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        setCurrentPasswordError(null);
        setNewPasswordError(null);
        setConfirmNewPasswordError(null);
        setPasswordFormError(null);

        let hasError = false;

        if (!currentPassword) {
            setCurrentPasswordError("Please enter your current password.");
            hasError = true;
        }
        if (!newPassword) {
            setNewPasswordError("Please enter a new password.");
            hasError = true;
        }
        if (!confirmNewPassword) {
            setConfirmNewPasswordError("Please confirm your new password.");
            hasError = true;
        }

        if (hasError) return;

        if (newPassword !== confirmNewPassword) {
            setConfirmNewPasswordError("Passwords do not match.");
            return;
        }

        try {
            await request<ProfileResponse>(links.api.profile.me, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }),
                credentials: "include",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setIsEditingPassword(false);
            toast.success("Password changed");
        } catch (error: any) {
            console.error("Failed to change password:", error);

            const reason =
                error?.reason ??
                error?.data?.reason ??
                error?.response?.data?.reason;
            const message =
                error?.message ??
                error?.data?.message ??
                error?.response?.data?.message;

            if (reason === "WRONG_CREDENTIALS") {
                setCurrentPasswordError("Wrong current password.");
            } else {
                setPasswordFormError(message || "Failed to change password.");
                toast.error("Failed to change password");
            }
        }
    };

    const handleToggleNotifications = async () => {
        const next = !notificationsEnabled;
        setNotificationsEnabled(next);

        try {
            await request<ProfileResponse>(links.api.profile.me, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationsEnabled: next }),
                credentials: "include",
            });

            toast.success(
                next ? "Notifications enabled" : "Notifications disabled"
            );
        } catch (error) {
            console.error("Failed to update notifications:", error);
            setNotificationsEnabled(!next);
            toast.error("Failed to update notifications setting");
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        const ALLOWED_TYPES = ["image/jpeg", "image/png"];

        const isValidType = ALLOWED_TYPES.includes(file.type);
        const isValidSize = file.size <= MAX_FILE_SIZE;

        if (!isValidType) {
            toast.error(
                "Invalid file type. Please select a JPEG or a PNG image."
            );
            return;
        }

        if (!isValidSize) {
            toast.error(
                "File size larger than the 5MB limit. Please select a smaller image/avatar."
            );
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const response = await request<{ avatarUrl: string }>(
                links.api.profile.avatar,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            setAvatarUrl(response.avatarUrl);
            toast.success("Avatar updated");
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            toast.error("Failed to upload avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-slate-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-md px-8 py-6 text-center max-w-md">
                    <h1 className="text-xl font-semibold mb-2 theme-text-color">
                        Please log in
                    </h1>
                    <p className="text-sm text-gray-500">
                        You need an account to access your profile settings.
                    </p>
                </div>
            </div>
        );
    }

    const userInitial =
        (displayName && displayName[0]?.toUpperCase()) ||
        user.email[0]?.toUpperCase() ||
        "U";

    return (
        <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-slate-50 to-gray-100">
            <div className="hidden lg:block">
                <SideBar />
            </div>

            <main className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                Account
                            </p>
                            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                                Profile Settings
                            </h1>
                            <p className="mt-2 text-sm text-gray-500 max-w-xl">
                                Update your personal details, security settings,
                                and how we contact you.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold theme-text-color">
                                {userInitial}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 truncate max-w-40 md:max-w-[220px]">
                                    {displayName || user.email}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-40 md:max-w-[220px]">
                                    {email}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <SettingsSection
                                title="Profile picture"
                                subtitle="A clear photo makes it easier for others to recognize you."
                            >
                                <div className="flex items-center gap-5">
                                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-lg md:text-2xl font-semibold text-gray-500 ring-2 ring-white shadow-sm">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Profile avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{userInitial}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-gray-600">
                                            JPG or PNG, max 5MB
                                        </p>
                                        <div className="flex flex-wrap itemscenter gap-3">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />

                                            <CampusChatAllroundButton
                                                size="small"
                                                onClick={handleAvatarClick}
                                                disabled={uploadingAvatar}
                                                className="cursor-pointer"
                                            >
                                                {uploadingAvatar
                                                    ? "Uploading..."
                                                    : "Change picture"}
                                            </CampusChatAllroundButton>
                                            {avatarUrl && (
                                                <span className="text-xs text-gray-400">
                                                    Click to replace your
                                                    current photo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection
                                title="Profile info"
                                subtitle="Basic public information others can see."
                            >
                                <form
                                    className="space-y-4"
                                    onSubmit={handleSaveProfileInfo}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex-1">
                                            {!isEditingName ? (
                                                <>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Name
                                                    </p>
                                                    <p className="mt-1 textsm text-gray-900">
                                                        {displayName ||
                                                            "No name set"}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <FormField
                                                        label="New name"
                                                        name="displayName"
                                                        value={displayName}
                                                        onChange={(e) =>
                                                            setDisplayName(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter your name"
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isEditingName) {
                                                    setDisplayName(
                                                        originalDisplayName
                                                    );
                                                }
                                                setIsEditingName(
                                                    (prev) => !prev
                                                );
                                            }}
                                            className={chipButtonClass}
                                        >
                                            {isEditingName
                                                ? "Cancel"
                                                : "Change name"}
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex-1">
                                            {!isEditingStatus ? (
                                                <>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Status
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {status ||
                                                            "No status set"}
                                                    </p>
                                                </>
                                            ) : (
                                                <FormField
                                                    label="New status"
                                                    name="status"
                                                    value={status}
                                                    onChange={(e) =>
                                                        setStatus(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Share how you feel or what you do"
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isEditingStatus) {
                                                    setStatus(originalStatus);
                                                }
                                                setIsEditingStatus(
                                                    (prev) => !prev
                                                );
                                            }}
                                            className={chipButtonClass}
                                        >
                                            {isEditingStatus
                                                ? "Cancel"
                                                : "Change status"}
                                        </button>
                                    </div>

                                    {(isEditingName || isEditingStatus) && (
                                        <div className="pt-2">
                                            <PrimaryButton disabled={loading}>
                                                {loading
                                                    ? "Saving..."
                                                    : "Save changes"}
                                            </PrimaryButton>
                                        </div>
                                    )}
                                </form>
                            </SettingsSection>

                            <SettingsSection
                                title="Password"
                                subtitle="Keep your account secure."
                            >
                                {!isEditingPassword ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditingPassword(true)
                                        }
                                        className={chipButtonClass}
                                    >
                                        Change password
                                    </button>
                                ) : (
                                    <form
                                        className="space-y-3"
                                        onSubmit={handleSavePassword}
                                    >
                                        <FormField
                                            label="Current password"
                                            name="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => {
                                                setCurrentPassword(
                                                    e.target.value
                                                );
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
                                                setConfirmNewPassword(
                                                    e.target.value
                                                );
                                                setConfirmNewPasswordError(
                                                    null
                                                );
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
                                                {loading
                                                    ? "Saving..."
                                                    : "Save password"}
                                            </PrimaryButton>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingPassword(false);
                                                    setCurrentPassword("");
                                                    setNewPassword("");
                                                    setConfirmNewPassword("");
                                                    setCurrentPasswordError(
                                                        null
                                                    );
                                                    setNewPasswordError(null);
                                                    setConfirmNewPasswordError(
                                                        null
                                                    );
                                                    setPasswordFormError(null);
                                                }}
                                                className="cursor-pointer text-sm font-medium text-gray-600 hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </SettingsSection>
                        </div>

                        <div className="space-y-6">
                            <SettingsSection
                                title="Email"
                                subtitle="Used for login and important updates."
                            >
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
                                            onClick={() =>
                                                setIsEditingEmail(true)
                                            }
                                            className={chipButtonClass}
                                        >
                                            Change email
                                        </button>
                                    </div>
                                ) : (
                                    <form
                                        className="space-y-3"
                                        onSubmit={handleSaveEmail}
                                    >
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
                                                setEmailPassword(
                                                    e.target.value
                                                );
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
                                            Note: in a real production app you
                                            would also send a verification email
                                            and only update the address once it
                                            has been confirmed.
                                        </p>

                                        <div className="flex flex-wrap gap-3 pt-1">
                                            <PrimaryButton disabled={loading}>
                                                {loading
                                                    ? "Saving..."
                                                    : "Save email"}
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
                            </SettingsSection>

                            <SettingsSection
                                title="Notifications"
                                subtitle="Control when we bother you."
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleToggleNotifications}
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
                                    We'll only send you important updates
                                    related to your account and activity.
                                </p>
                            </SettingsSection>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
