import { useRef } from "react";
import CampusChatAllroundButton from "./CampusChatAllroundButton";
import { React } from "rwsdk/client";

type ProfilePictureSectionProps = {
    avatarUrl: string;
    userInitial: string;
    uploadingAvatar: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ProfilePictureSection({
    avatarUrl,
    userInitial,
    uploadingAvatar,
    onFileChange,
}: ProfilePictureSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
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
                <p className="text-sm text-gray-600">JPG or PNG, max 5MB</p>
                <div className="flex flex-wrap itemscenter gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={onFileChange}
                    />

                    <CampusChatAllroundButton
                        size="small"
                        onClick={handleAvatarClick}
                        disabled={uploadingAvatar}
                        className="cursor-pointer"
                    >
                        {uploadingAvatar ? "Uploading..." : "Change picture"}
                    </CampusChatAllroundButton>
                    {avatarUrl && (
                        <span className="text-xs text-gray-400">
                            Click to replace your current photo
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
