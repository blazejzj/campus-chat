import FormField from "@/app/components/FormField";
import PrimaryButton from "@/app/components/PrimaryButton";

const chipButtonClass =
    "cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-full theme-text-color border-current hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]";

type ProfileInfoSectionProps = {
    displayName: string;
    setDisplayName: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
    isEditingName: boolean;
    setIsEditingName: (value: boolean) => void;
    isEditingStatus: boolean;
    setIsEditingStatus: (value: boolean) => void;
    originalDisplayName: string;
    originalStatus: string;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
};

export default function ProfileInfoSection({
    displayName,
    setDisplayName,
    status,
    setStatus,
    isEditingName,
    setIsEditingName,
    isEditingStatus,
    setIsEditingStatus,
    originalDisplayName,
    originalStatus,
    loading,
    onSubmit,
}: ProfileInfoSectionProps) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                    {!isEditingName ? (
                        <>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Name
                            </p>
                            <p className="mt-1 textsm text-gray-900">
                                {displayName || "No name set"}
                            </p>
                        </>
                    ) : (
                        <>
                            <FormField
                                label="New name"
                                name="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (isEditingName) {
                            setDisplayName(originalDisplayName);
                        }
                        setIsEditingName(!isEditingName);
                    }}
                    className={chipButtonClass}
                >
                    {isEditingName ? "Cancel" : "Change name"}
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
                                {status || "No status set"}
                            </p>
                        </>
                    ) : (
                        <FormField
                            label="New status"
                            name="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
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
                        setIsEditingStatus(!isEditingStatus);
                    }}
                    className={chipButtonClass}
                >
                    {isEditingStatus ? "Cancel" : "Change status"}
                </button>
            </div>

            {(isEditingName || isEditingStatus) && (
                <div className="pt-2">
                    <PrimaryButton disabled={loading}>
                        {loading ? "Saving..." : "Save changes"}
                    </PrimaryButton>
                </div>
            )}
        </form>
    );
}
