"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import RoomsSidebar from "@/features/groups/components/RoomSidebar";
import GlobalChatScreen from "@/features/globalChat/screens/GlobalChatScreen";
import type { GlobalChatMessage } from "@/features/globalChat/hooks/useGlobalChat";

type DashboardScreenProps = {
    initialGlobalMessages: GlobalChatMessage[];
};

type ActiveChat = "global" | "room";

export default function DashboardScreen({
    initialGlobalMessages,
}: DashboardScreenProps) {
    const { user, logout } = useAuth();
    const [selectedRoomId, setSelectedRoomId] = useState<
        string | number | null
    >(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<ActiveChat>("global");

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg text-gray-600">
                    You are not logged in. Please log in to access the
                    dashboard.
                </p>
            </div>
        );
    }

    const userName = user.email.split("@")[0];

    const handleSelectRoom = (roomId: string | number) => {
        setSelectedRoomId(roomId);
        setActiveChat("room");
    };

    const showRoomChat = activeChat === "room" && selectedRoomId != null;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
            <div
                className={`${
                    isSidebarOpen ? "flex" : "hidden"
                } sm:flex w-64 shrink-0 bg-white border-r border-gray-200 flex-col shadow-lg absolute inset-y-0 left-0 z-20 sm:relative`}
            >
                <header className="px-4 py-4 border-gray-200 border-b">
                    <h1 className="text-2xl font-extrabold theme-text-color">
                        CampusChat
                    </h1>
                    <p className="text-xs text-gray-500">Groups &amp; rooms</p>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <RoomsSidebar
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={handleSelectRoom}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col relative">
                <header className="flex justify-between items-center p-4 border-gray-200 border-b bg-white shadow-sm">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="sm:hidden p-2 mr-3 rounded-lg hover:bg-gray-100 transition"
                            aria-label="Toggle rooms sidebar"
                        >
                            ☰
                        </button>

                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 border border-gray-300" />

                        <div>
                            <h2 className="text-lg font-semibold">
                                {showRoomChat
                                    ? `Room #${selectedRoomId}`
                                    : "Global chat"}
                            </h2>
                            <p className="text-sm theme-text-color">
                                {showRoomChat
                                    ? "Room conversation"
                                    : "Everyone on campus"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <p className="hidden sm:block text-sm text-gray-500">
                            Logged in as{" "}
                            <span className="font-medium">{userName}</span>
                        </p>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition cursor-pointer text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="flex items-center justify-between px-4 pt-3 bg-white border-b border-gray-200">
                    <div className="inline-flex rounded-xl bg-gray-100 p-1 text-sm">
                        <button
                            className={`px-3 py-1 rounded-lg transition ${
                                activeChat === "global"
                                    ? "theme-bg-color text-white"
                                    : "text-gray-600"
                            }`}
                            onClick={() => setActiveChat("global")}
                        >
                            Global chat
                        </button>
                        <button
                            className={`px-3 py-1 rounded-lg transition ${
                                activeChat === "room"
                                    ? "theme-bg-color text-white"
                                    : "text-gray-600"
                            } ${
                                !selectedRoomId
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            onClick={() =>
                                selectedRoomId && setActiveChat("room")
                            }
                            disabled={!selectedRoomId}
                        >
                            Room chat
                        </button>
                    </div>

                    {selectedRoomId && (
                        <p className="text-xs text-gray-500 ml-4">
                            Selected room:{" "}
                            <span className="font-medium">
                                {selectedRoomId}
                            </span>
                        </p>
                    )}
                </div>

                <main className="flex-1 overflow-y-auto bg-gray-100">
                    {activeChat === "global" && (
                        <GlobalChatScreen
                            initialMessages={initialGlobalMessages}
                        />
                    )}

                    {activeChat === "room" && selectedRoomId && (
                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                            {/* TODO: roomchats here*/}
                            Room chat for room{" "}
                            <span className="font-semibold ml-1">
                                {selectedRoomId}
                            </span>{" "}
                            will live here.
                        </div>
                    )}

                    {activeChat === "room" && !selectedRoomId && (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            Select a room from the sidebar to start chatting.
                        </div>
                    )}
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="sm:hidden absolute inset-0 bg-black opacity-50 z-10"
                />
            )}
        </div>
    );
}
