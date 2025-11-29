"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import RoomsSidebar from "@/features/groups/components/RoomSidebar";
import GlobalChatScreen from "@/features/globalChat/screens/GlobalChatScreen";
import type { GlobalChatMessage } from "@/features/globalChat/hooks/useGlobalChat";
import { links } from "@/app/links";

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
            <div className="flex h-screen items-center justify-center bg-linear-to-br from-gray-50 via-slate-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-md px-8 py-6 text-center max-w-md">
                    <h1 className="text-xl font-semibold mb-2 theme-text-color">
                        Please log in
                    </h1>
                    <p className="text-sm text-gray-500">
                        You need an account to access your dashboard.
                    </p>
                </div>
            </div>
        );
    }

    const userName = user.email.split("@")[0];
    const userInitial = userName.charAt(0).toUpperCase();

    const handleSelectRoom = (roomId: string | number) => {
        setSelectedRoomId(roomId);
        setActiveChat("room");
    };

    const showRoomChat = activeChat === "room" && selectedRoomId != null;

    return (
        <div className="flex h-screen bg-linear-to-br from-gray-50 via-slate-50 to-gray-100">
            <div
                className={`${
                    isSidebarOpen ? "flex" : "hidden"
                } sm:flex w-72 shrink-0 bg-white/90 border-r border-gray-200 flex-col shadow-md absolute inset-y-0 left-0 z-20 sm:relative`}
            >
                <header className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div>
                            <h1 className="text-lg font-bold tracking-tight theme-text-color">
                                CampusChat
                            </h1>
                            <p className="text-[11px] text-gray-500">
                                Groups, rooms & chat
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <RoomsSidebar
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={handleSelectRoom}
                    />
                </div>

                <div className="border-t border-gray-100 p-3 bg-white/80">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold theme-text-color shadow-sm">
                                {userInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {userName}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <a
                                href={links.pages.profile}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-medium theme-text-color hover:bg-gray-50 transition text-center"
                            >
                                Profile
                            </a>
                            <button
                                onClick={logout}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-[11px] font-semibold text-white hover:bg-red-600 transition shadow-sm text-center cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative">
                <header className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white/90 backdrop-blur shadow-sm">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="sm:hidden p-2 mr-3 rounded-lg hover:bg-gray-100 transition"
                            aria-label="Toggle rooms sidebar"
                        >
                            {/*found a little icon, should be changed, maybe FontAwesome later? */}
                            ☰
                        </button>

                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-gray-100 mr-3 border border-gray-200 items-center justify-center text-xs font-semibold theme-text-color">
                            {userInitial}
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                Dashboard
                            </p>
                            <h2 className="text-lg font-semibold theme-text-color">
                                {showRoomChat
                                    ? `Room #${selectedRoomId}`
                                    : "Global chat"}
                            </h2>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-1 border border-green-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                        </span>
                        <span className="border-l border-gray-200 pl-3">
                            Logged in as{" "}
                            <span className="font-medium text-gray-800">
                                {userName}
                            </span>
                        </span>
                    </div>
                </header>

                <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 border-b border-gray-200">
                    <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
                        <button
                            className={`px-3 py-1.5 rounded-full transition ${
                                activeChat === "global"
                                    ? "theme-bg-color text-white shadow-sm"
                                    : "text-gray-600 hover:bg-white"
                            }`}
                            onClick={() => setActiveChat("global")}
                        >
                            Global chat
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-full transition ${
                                activeChat === "room"
                                    ? "theme-bg-color text-white shadow-sm"
                                    : "text-gray-600 hover:bg-white"
                            } ${
                                !selectedRoomId
                                    ? "opacity-40 cursor-not-allowed hover:bg-gray-100"
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
                        <p className="text-[11px] text-gray-500 ml-4">
                            Selected room:{" "}
                            <span className="font-medium theme-text-color">
                                {selectedRoomId}
                            </span>
                        </p>
                    )}
                </div>

                <main className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="h-full max-w-5xl mx-auto">
                        <div className="h-full bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            {activeChat === "global" && (
                                <GlobalChatScreen
                                    initialMessages={initialGlobalMessages}
                                />
                            )}

                            {activeChat === "room" && selectedRoomId && (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                    Room chat for room{" "}
                                    <span className="font-semibold ml-1 theme-text-color">
                                        {selectedRoomId}
                                    </span>{" "}
                                    will live here.
                                </div>
                            )}

                            {activeChat === "room" && !selectedRoomId && (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Select a room from the sidebar to start
                                    chatting.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="sm:hidden absolute inset-0 bg-black/20 z-10"
                />
            )}
        </div>
    );
}
