'use client';
import { useState } from 'react';
import { useAuth } from "../hooks/useAuth";
import RoomsSidebar from '@/features/groups/components/RoomSidebar';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [selectedRoomId, setSelectedRoomId] = useState<string | number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!user) {
        return <h1>youre not logged in dammit</h1>;
    }
    
    const userName = user.email.split('@')[0];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
            
            {/* Groups/Rooms Sidebar */}
            <div 
                className={`
                    ${isSidebarOpen ? 'flex' : 'hidden'} 
                    sm:flex 
                    w-64 shrink-0 bg-white border-r border-gray-200 
                    flex-col shadow-lg 
                    absolute inset-y-0 left-0 z-20
                    sm:relative 
                `}
            >
                <header className="px-4 py-4 border-gray-200 border-b">
                    <h1 className="text-2xl font-extrabold theme-text-color">CampusChat</h1>
                </header>
                        <RoomsSidebar 
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={setSelectedRoomId}
                    />
            </div>

            {/* Chat Area - just for display purpose for now*/}
            <div className="grow flex flex-col relative">
                
                <header className="flex justify-between items-center p-4 border-gray-200 border-b bg-white shadow-lg">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="sm:hidden p-2 mr-3 rounded-lg hover:bg-gray-100 transition"
                        >
                            "x" 
                        </button>

                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 border border-gray-300"></div>
                        <div>
                            <h2 className="text-lg font-semibold">Active Room</h2> 
                            <p className="text-sm theme-text-color">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <p className="hidden sm:block text-sm text-gray-500">Logged in as **{userName}**</p>
                        <button 
                            onClick={logout} 
                            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition cursor-pointer text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="grow overflow-y-auto p-6 bg-gray-100"> 
                    <p className="text-center text-gray-400 text-sm mt-10">
                        {selectedRoomId 
                            ? `Room ID: ${selectedRoomId}` 
                            : 'Please select a chat from the sidebar to start.'}
                    </p>
                    <p className="text-red-600 text-sm text-center pt-4">
                         (Error): Could not load rooms. Please try again.
                    </p>

                    <div className="mb-4 flex justify-end">
                        <div className="theme-bg-color text-white p-3 rounded-2xl max-w-xs text-sm shadow-md">
                            What's uuup??
                            <p className="text-xs text-white opacity-80 mt-1">10:00 AM</p>
                        </div>
                    </div>
                    <div className="mb-4 flex justify-start">
                        <div className="bg-white p-3 rounded-2xl max-w-xs text-sm border border-gray-200 shadow-sm">
                            Whaaaatsssuuup!
                            <p className="text-xs text-gray-500 mt-1">10:01 AM</p>
                        </div>
                    </div>
                </main>
                
                <div className="p-4 border-gray-200 border-t bg-white flex items-center">
                    <input 
                        type="text"
                        placeholder="Message..."
                        className="grow p-3 bg-gray-50 text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <button 
                        className="ml-3 px-6 py-3 rounded-xl font-semibold text-white theme-bg-color hover:opacity-90 transition"
                    >
                        Send
                    </button>
                </div>

            </div>
            
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="sm:hidden absolute inset-0 bg-black opacity-50 z-10"
                ></div>
            )}
        </div>
    );
}