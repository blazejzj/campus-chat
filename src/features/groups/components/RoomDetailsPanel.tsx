"use client";

import { useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";

interface RoomDetailsPanelProps {
    roomId: string | number;
    canDelete: boolean;
    onDeleted: (roomId: string | number) => void;
}

const API_BASE_PATH = "/api/v1/groups";

export default function RoomDetailsPanel({
    roomId,
    canDelete,
    onDeleted,
}: RoomDetailsPanelProps) {
    const mockMembers = ["John Doe", "Jane Smith"];

    const { request, error, setError, loading } = useFetch();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!canDelete || deleting) return;

        setError("");
        try {
            setDeleting(true);
            await request(`${API_BASE_PATH}/${roomId}`, {
                method: "DELETE",
                credentials: "include",
            });

            onDeleted(roomId);
        } catch (err: any) {
            console.error("Error deleting room:", err);
            setError(err.message || "Could not delete room");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mt-1 mx-2 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800">
            <h5 className="text-[11px] font-semibold text-gray-500 mb-2">
                Room ID: {roomId}
            </h5>

            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold theme-text-color">
                    Members ({mockMembers.length})
                </h4>
                <button
                    onClick={() => {
                        console.log(`TODO: Add Member to Room ${roomId}`);
                    }}
                    className="px-2 py-0.5 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition text-[11px] font-medium"
                >
                    + Add
                </button>
            </div>

            <ul className="grid grid-cols-2 gap-1 text-[11px] text-gray-700 max-h-16 overflow-y-auto pr-1 mb-3">
                {mockMembers.map((member, index) => (
                    <li
                        key={index}
                        className="p-1 bg-white rounded border border-gray-200 truncate"
                    >
                        {member}
                    </li>
                ))}
            </ul>

            {error && (
                <p className="text-[11px] text-red-600 mb-2 font-medium">
                    {error}
                </p>
            )}

            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={deleting || loading}
                    className={`w-full px-2 py-1 rounded-lg transition shadow-sm text-[11px] font-semibold ${
                        deleting || loading
                            ? "bg-red-300 cursor-not-allowed text-white"
                            : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    }`}
                >
                    {deleting || loading ? "Deleting..." : "Delete Room"}
                </button>
            )}
        </div>
    );
}
