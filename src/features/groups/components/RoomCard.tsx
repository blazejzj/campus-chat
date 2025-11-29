import { Room } from "../components/RoomSidebar";
import RoomDetailsPanel from "./RoomDetailsPanel";

interface RoomCardProps {
    room: Room;
    isSelected: boolean;
    onSelect: (roomId: string | number) => void;
}

export default function RoomCard({
    room,
    isSelected,
    onSelect,
}: RoomCardProps) {
    const visibilityColor =
        room.visibility === "public"
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-red-100 text-red-800 border-red-200";
    const visibilityText = room.visibility === "public" ? "Public" : "Private";

    return (
        <div
            className={`rounded-xl transition shadow-sm cursor-pointer border ${
                isSelected
                    ? "border-(--primary-color) bg-white"
                    : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
            <div
                onClick={() => onSelect(room.id)}
                className="flex items-center p-3 rounded-xl transition"
            >
                <span
                    className={`px-2 py-1 text-[10px] font-semibold rounded-full mr-3 border ${visibilityColor}`}
                >
                    {visibilityText}
                </span>
                <span className="font-medium truncate text-sm theme-text-color">
                    {room.name}
                </span>
            </div>

            {isSelected && <RoomDetailsPanel roomId={room.id} />}
        </div>
    );
}
