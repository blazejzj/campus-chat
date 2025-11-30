import { Room } from "../components/RoomSidebar";
import RoomDetailsPanel from "./RoomDetailsPanel";

interface RoomCardProps {
    room: Room;
    isSelected: boolean;
    onSelect: (roomId: string | number) => void;
    canDelete: boolean;
    onDeleted: (roomId: string | number) => void;
}

export default function RoomCard({
    room,
    isSelected,
    onSelect,
    canDelete,
    onDeleted,
}: RoomCardProps) {
    return (
        <article
            className={`rounded-xl transition shadow-sm border bg-white ${
                isSelected
                    ? "border-(--primary-color)"
                    : "border-gray-200 hover:border-gray-300"
            }`}
        >
            <header
                onClick={() => onSelect(room.id)}
                className="flex items-center p-3 rounded-xl transition cursor-pointer"
            >
                <h3 className="font-medium truncate text-sm theme-text-color">
                    {room.name}
                </h3>
            </header>

            {isSelected && (
                <RoomDetailsPanel
                    roomId={room.id}
                    canDelete={canDelete}
                    onDeleted={onDeleted}
                />
            )}
        </article>
    );
}
