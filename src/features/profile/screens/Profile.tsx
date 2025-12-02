"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useFetch } from "@/app/hooks/useFetch";
import { links } from "@/app/links";
import SideBar from "@/features/profile/components/SideBar";
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfilePictureSection from "@/features/profile/components/ProfilePictureSection";
import ProfileInfoSection from "@/features/profile/components/ProfileInfoSection";
import PasswordSection from "@/features/profile/components/PassWordSection";
import EmailSection from "@/features/profile/components/EmailSection";
import NotificationsSection from "@/features/profile/components/NotificationsSection";

type ProfileResponse = {
    email: string;
    displayName?: string;
    status?: string;
    avatarUrl?: string;
    notificationsEnabled?: boolean;
};

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
                    <ProfileHeader
                        displayName={displayName}
                        email={email}
                        userInitial={userInitial}
                    />

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <SettingsSection
                                title="Profile picture"
                                subtitle="A clear photo makes it easier for others to recognize you."
                            >
                                <ProfilePictureSection
                                    avatarUrl={avatarUrl}
                                    userInitial={userInitial}
                                    uploadingAvatar={uploadingAvatar}
                                    onFileChange={handleFileChange}
                                />
                            </SettingsSection>

                            <SettingsSection
                                title="Profile info"
                                subtitle="Basic public information others can see."
                            >
                                <ProfileInfoSection
                                    displayName={displayName}
                                    setDisplayName={setDisplayName}
                                    status={status}
                                    setStatus={setStatus}
                                    isEditingName={isEditingName}
                                    setIsEditingName={setIsEditingName}
                                    isEditingStatus={isEditingStatus}
                                    setIsEditingStatus={setIsEditingStatus}
                                    originalDisplayName={originalDisplayName}
                                    originalStatus={originalStatus}
                                    loading={loading}
                                    onSubmit={handleSaveProfileInfo}
                                />
                            </SettingsSection>

                            <SettingsSection
                                title="Password"
                                subtitle="Keep your account secure."
                            >
                                <PasswordSection
                                    isEditingPassword={isEditingPassword}
                                    setIsEditingPassword={setIsEditingPassword}
                                    currentPassword={currentPassword}
                                    setCurrentPassword={setCurrentPassword}
                                    newPassword={newPassword}
                                    setNewPassword={setNewPassword}
                                    confirmNewPassword={confirmNewPassword}
                                    setConfirmNewPassword={
                                        setConfirmNewPassword
                                    }
                                    currentPasswordError={currentPasswordError}
                                    setCurrentPasswordError={
                                        setCurrentPasswordError
                                    }
                                    newPasswordError={newPasswordError}
                                    setNewPasswordError={setNewPasswordError}
                                    confirmNewPasswordError={
                                        confirmNewPasswordError
                                    }
                                    setConfirmNewPasswordError={
                                        setConfirmNewPasswordError
                                    }
                                    passwordFormError={passwordFormError}
                                    setPasswordFormError={setPasswordFormError}
                                    loading={loading}
                                    onSubmit={handleSavePassword}
                                />
                            </SettingsSection>
                        </div>

                        <div className="space-y-6">
                            <SettingsSection
                                title="Email"
                                subtitle="Used for login and important updates."
                            >
                                <EmailSection
                                    email={email}
                                    isEditingEmail={isEditingEmail}
                                    setIsEditingEmail={setIsEditingEmail}
                                    newEmail={newEmail}
                                    setNewEmail={setNewEmail}
                                    emailPassword={emailPassword}
                                    setEmailPassword={setEmailPassword}
                                    emailError={emailError}
                                    setEmailError={setEmailError}
                                    emailPasswordError={emailPasswordError}
                                    setEmailPasswordError={
                                        setEmailPasswordError
                                    }
                                    loading={loading}
                                    onSubmit={handleSaveEmail}
                                />
                            </SettingsSection>

                            <SettingsSection
                                title="Notifications"
                                subtitle="Control when we bother you."
                            >
                                <NotificationsSection
                                    notificationsEnabled={notificationsEnabled}
                                    onToggle={handleToggleNotifications}
                                />
                            </SettingsSection>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
