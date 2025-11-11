import { Room } from '../components/RoomSidebar';
import RoomDetailsPanel from './RoomDetailsPanel';

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (roomId: string | number) => void;
}

export default function RoomCard({ room, isSelected, onSelect }: RoomCardProps) {
  const bgColor = isSelected ? 'bg-gray-800' : 'bg-white hover:bg-gray-100';
  const textColor = isSelected ? 'text-white' : 'text-gray-800';
  const visibilityColor = room.visibility === 'public' ? 'bg-green-600' : 'bg-red-600';
  const visibilityText = room.visibility === 'public' ? 'Public' : 'Privte';

  return (
    <div className={`rounded-xl transition shadow-md cursor-pointer ${isSelected ? 'p-1' : 'p-0'}`}>
      <div 
        onClick={() => onSelect(room.id)}
        className={`flex items-center p-3 rounded-xl transition ${bgColor} ${textColor}`}
      >
        <span 
          className={`px-2 py-1 text-xs font-bold rounded-lg mr-3 text-white ${visibilityColor}`}
        >
          {visibilityText}
        </span>
        <span className="font-semibold truncate">{room.name}</span>
      </div>

      {isSelected && <RoomDetailsPanel roomId={room.id} />}
    </div>
  );
}