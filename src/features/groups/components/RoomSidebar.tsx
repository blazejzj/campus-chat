"use client";

import { useState, useEffect, useMemo } from "react";
import RoomCard from "./RoomCard";
import { useAuth } from "@/app/hooks/useAuth";
import { useFetch } from "@/app/hooks/useFetch";

{
    /*later we have to think aobut actual DM,s should be groups? */
}

interface RoomsSidebarProps {
    selectedRoomId: string | number | null;
    onSelectRoom: (roomId: string | number) => void;
    onRoomDeleted?: (roomId: string | number) => void;
}

export interface Room {
    id: string | number;
    name: string;
    visibility: "public" | "private";
    createdBy?: string | null;
}

interface ErrorDetails {
    issues: { message: string }[];
}

interface ErrorResponse {
    error: string;
    details?: ErrorDetails;
}

type RoomCreationSuccess = Room;
type ApiResult = RoomCreationSuccess | ErrorResponse;

const API_BASE_PATH = "/api/v1/groups";

export default function RoomsSidebar({
    selectedRoomId,
    onSelectRoom,
    onRoomDeleted,
}: RoomsSidebarProps) {
    const { user } = useAuth();
    const {
        request,
        loading: fetchLoading,
        error: creationError,
        setError,
    } = useFetch();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");

    const loadRooms = async () => {
        if (!user) return;

        try {
            const data = await request<Room[]>(API_BASE_PATH, {
                method: "GET",
                credentials: "include",
            });
            setRooms(data);
        } catch (err) {
            console.error("Error loading rooms:", err);
            setRooms([]);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("You have to be log in to create a room");
            return;
        }

        try {
            const data = await request<ApiResult>(API_BASE_PATH + "/create", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newRoomName.trim(),
                }),
            });

            if (!("id" in data)) {
                const errorData = data as ErrorResponse;
                if (errorData.details?.issues?.length) {
                    setError(
                        errorData.details.issues
                            .map((i) => i.message)
                            .join("; ")
                    );
                } else {
                    setError(errorData.error || "Could not create a room");
                }
                return;
            }
            setRooms((prev) => [data as Room, ...prev]);
            setIsModalOpen(false);
            setNewRoomName("");
            setError("");
        } catch (err: any) {
            console.error("Error creating room:", err);
            const errorData = err.body || err.responseJson || {};

            if (errorData.details?.issues?.length) {
                const validationMessages = errorData.details.issues
                    .map((i: { message: string }) => i.message)
                    .join("; ");
                setError(`Validationerror: ${validationMessages}`);
            } else if (
                err.message &&
                (err.message.includes("ValidationError") ||
                    err.message.includes("Bad Request"))
            ) {
                setError("Validation error: Name is missing or too short");
            } else {
                setError(err.message || "Unknown error");
            }
        }
    };

    const handleCancelCreation = () => {
        setIsModalOpen(false);
        setNewRoomName("");
        setError("");
    };

    const handleRoomDeleted = (roomId: string | number) => {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
    };

    const handleRoomDeletedInternal = (roomId: string | number) => {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        if (onRoomDeleted) {
            onRoomDeleted(roomId);
        }
    };

    useEffect(() => {
        if (user) loadRooms();
    }, [user]);

    const ErrorDisplay = () =>
        creationError ? (
            <div className="mx-3 mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 shadow-sm border border-red-100">
                {creationError}
            </div>
        ) : null;

    const MemoizedRoomCreationModal = useMemo(() => {
        if (!isModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-1 theme-text-color">
                        Create new room
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Give your room a clear name.
                    </p>
                    <label className="block text-sm font-medium theme-text-color mb-1">
                        Name
                    </label>
                    {creationError && (
                        <p className="text-red-500 mb-2 text-xs font-medium">
                            {creationError}
                        </p>
                    )}

                    <form onSubmit={handleCreateRoom}>
                        <input
                            type="text"
                            placeholder="Your room name"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="w-full p-3 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg mb-4 focus:ring-2 focus:ring-(--primary-color) focus:border-transparent text-sm"
                            required
                        />

                        <div className="flex justify-end space-x-3 text-sm">
                            <button
                                type="button"
                                onClick={handleCancelCreation}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newRoomName.trim()}
                                className={`px-4 py-2 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer ${
                                    !newRoomName.trim()
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "theme-bg-color hover:opacity-90"
                                }`}
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [isModalOpen, creationError, newRoomName]);

    if (!user)
        return (
            <div className="p-4 text-gray-400 text-sm">
                You have to be logged in
            </div>
        );

    return (
        <div className="flex flex-col h-full bg-white/80 text-gray-900">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white">
                <h2 className="px-1 text-xs tracking-[0.18em] text-gray-400 font-semibold uppercase">
                    Groups / Rooms
                </h2>
                <button
                    onClick={() => {
                        setIsModalOpen(true);
                        setError("");
                    }}
                    className="p-2 w-9 h-9 flex items-center justify-center theme-bg-color text-white rounded-xl text-xl hover:opacity-90 transition shadow-sm font-bold leading-none cursor-pointer"
                    title="Create new room"
                >
                    +
                </button>
            </div>

            <ErrorDisplay />

            <nav className="grow overflow-y-auto p-3 space-y-2 bg-gray-50/60">
                {rooms.map((room) => {
                    const currentUserId = user?.id
                        ? String(user.id)
                        : undefined;
                    const createdBy = room.createdBy
                        ? String(room.createdBy)
                        : undefined;

                    const canDelete =
                        currentUserId && createdBy
                            ? currentUserId === createdBy
                            : false;

                    return (
                        <RoomCard
                            key={room.id}
                            room={room}
                            isSelected={selectedRoomId === room.id}
                            onSelect={onSelectRoom}
                            canDelete={canDelete}
                            onDeleted={handleRoomDeletedInternal}
                        />
                    );
                })}
                {rooms.length === 0 && !fetchLoading && !creationError && (
                    <div className="p-4 text-center text-gray-400 text-sm italic">
                        No rooms yet – click + to create one.
                    </div>
                )}
            </nav>

            {MemoizedRoomCreationModal}
        </div>
    );
}
