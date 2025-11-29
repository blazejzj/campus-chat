interface RoomDetailsPanelProps {
    roomId: string | number;
}

export default function RoomDetailsPanel({ roomId }: RoomDetailsPanelProps) {
    const mockMembers = ["John Doe", "Jane Smith"];

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

            <button
                onClick={() => {
                    console.log(`TODO: Delete Room ${roomId}`);
                }}
                className="w-full px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm text-[11px] font-semibold"
            >
                Delete Room
            </button>
        </div>
    );
}
