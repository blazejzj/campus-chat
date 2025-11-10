interface Room {
    id: string | number;
    name: string;
    visibility: 'public' | 'private';
}

interface RoomCardProps {
    room: Room;
    isSelected: boolean;
    onSelect: (roomId: string | number) => void;
}

export default function RoomCard({ room, isSelected, onSelect }: RoomCardProps) {
    const visibilityText = room.visibility === 'private' ? 'Låst' : 'Åpen';
    const visibilityColor = room.visibility === 'private' ? 'bg-red-700' : 'bg-green-700';
    
    return (
        <button
            onClick={() => onSelect(room.id)}
            className={`w-full text-left p-3 rounded-xl transition duration-150 ease-in-out flex items-center space-x-3 border border-transparent 
                ${isSelected 
                    ? 'bg-blue-600 text-white font-semibold shadow-xl border-blue-400' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 shadow-md'}`
            }
        >
            <span className={`text-xs font-mono px-2 py-1 rounded-full shrink-0 ${visibilityColor} text-white`}>
                {visibilityText}
            </span>
            <span className="truncate text-base grow">{room.name}</span>
        </button>
    );
}