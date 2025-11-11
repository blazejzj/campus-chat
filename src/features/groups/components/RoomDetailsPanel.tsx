interface RoomDetailsPanelProps {
    roomId: string | number;
}

export default function RoomDetailsPanel({ roomId }: RoomDetailsPanelProps) {
    const mockMembers = ['John Doe', 'Jane Smith'];

    return (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
            <h5 className="text-xs font-bold text-gray-700 mb-2">Room ID: {roomId}</h5>
            
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Members ({mockMembers.length})</h4>
                <button
                    onClick={() => {
                        // TODO: implement logic to open a modal/input to add a new member
                        console.log(`TODO: Add Member to Room ${roomId}`);
                    }}
                    className="px-2 py-0.5 theme-bg-color text-white rounded-md hover:opacity-90 transition text-xs font-medium"
                >
                    + Add
                </button>
            </div>
            
            <ul className="grid grid-cols-2 gap-1 text-xs text-gray-600 max-h-16 overflow-y-auto pr-1 mb-3">
                {mockMembers.map((member, index) => (
                    <li key={index} className="p-1 bg-white rounded-sm truncate border border-gray-200">
                        {member}
                    </li>
                ))}
            </ul>
            {/* TODO: implement logic to fetch and display actual room members */}

            <button 
                onClick={() => { 
                    // TODO: implement logic to securely delete the room from the database
                    console.log(`TODO: Delete Room ${roomId}`);
                }}
                className="w-full px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm text-xs font-semibold"
            >
                Delete Room
            </button>
        </div>
    );
}