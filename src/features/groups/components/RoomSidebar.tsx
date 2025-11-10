'use client';

import React, { useState, useEffect } from 'react';
import RoomCard from './RoomCard';
import { useAuth } from '@/app/hooks/useAuth';
import { useFetch } from '@/app/hooks/useFetch';

interface RoomsSidebarProps {
  selectedRoomId: string | number | null;
  onSelectRoom: (roomId: string | number) => void;
}

export interface Room {
  id: string | number;
  name: string;
  visibility: 'public' | 'private';
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

const API_BASE_PATH = '/api/v1/groups';

export default function RoomsSidebar({ selectedRoomId, onSelectRoom }: RoomsSidebarProps) {
  const { user } = useAuth();
  const { request, loading: fetchLoading, error: creationError, setError } = useFetch();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomVisibility, setNewRoomVisibility] = useState<'public' | 'private'>('public');

  // load rooms
  const loadRooms = async () => {
    if (!user) return;

    try {
      const data = await request<Room[]>(API_BASE_PATH, {
        method: 'GET',
        credentials: 'include',
      });
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setRooms([]); 
    }
  };

  // create room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Du må være logget inn for å opprette et rom.');
      return;
    }

    try {
      const data = await request<ApiResult>(API_BASE_PATH + "/create", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName.trim(),
          visibility: newRoomVisibility,
        }),
      });

      // debugggsss: scenario 1 useFetch returns the error object without throwing
      if (!('id' in data)) {
        const errorData = data as ErrorResponse;
        if (errorData.details?.issues?.length) {
          setError(errorData.details.issues.map(i => i.message).join('; '));
        } else {
          setError(errorData.error || 'Kunne ikke opprette rom. Vennligst prøv igjen.');
        }
        return;
      }

      // successee: add new room
      setRooms(prev => [data as Room, ...prev]);
      setIsModalOpen(false);
      setNewRoomName('');
      setNewRoomVisibility('public');
      setError('');
    } catch (err: any) {
      // FIX scenario 2 useFetch throws an Error
      console.error('Error creating room:', err);
      
      const errorData = err.body || err.responseJson || {};
      
      if (errorData.details?.issues?.length) {
        const validationMessages = errorData.details.issues.map((i: { message: string }) => i.message).join('; ');
        setError(`Valideringsfeil: ${validationMessages}`);
      } else if (err.message && (err.message.includes('ValidationError') || err.message.includes('Bad Request'))) {
        setError('Valideringsfeil: Sjekk at romnavnet er gyldig (f.eks. ikke tomt, eller for kort).');
      } else {
        setError(err.message || 'En ukjent nettverksfeil oppstod.');
      }
    }
  };

  useEffect(() => {
    if (user) loadRooms();
  }, [user]);

  const ErrorDisplay = () =>
    creationError ? (
      <div className="p-3 bg-red-800 text-sm text-red-200 rounded-lg m-2 shadow-lg">{creationError}</div>
    ) : null;

  const RoomCreationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-gray-600">
        <h2 className="text-xl font-bold mb-4 text-white">Crate new room</h2>
        {creationError && <p className="text-red-400 mb-3 text-sm font-medium">{creationError}</p>}
        <form onSubmit={handleCreateRoom}>
          <input
            type="text"
            placeholder="Romnavn (f.eks. Prosjekt Beta)"
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg mb-4 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">Synlighet:</label>
            <select
              value={newRoomVisibility}
              onChange={e => setNewRoomVisibility(e.target.value as 'public' | 'private')}
              className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition"
            >
              <option value="public">Public (Everyone can see)</option>
              <option value="private">Privte (only invited)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setNewRoomName('');
                setNewRoomVisibility('public');
                setError('');
              }}
              className="px-4 py-2 text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newRoomName.trim()}
              className={`px-4 py-2 text-white font-semibold rounded-lg transition shadow-md ${
                !newRoomName.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!user) return <div className="p-4 text-gray-400">You have to be logg inn</div>;

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="p-4 flex justify-between items-center border-b border-gray-700 bg-gray-900 shadow-md">
        <h2 className="text-xl font-extrabold text-blue-300">CampusChat Groups</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setError(''); 
          }}
          className="p-2 w-10 h-10 flex items-center justify-center bg-green-600 rounded-xl text-2xl hover:bg-green-700 transition shadow-lg font-bold leading-none transform hover:scale-105"
          title="Opprett Nytt Rom"
        >
          +
        </button>
      </div>

      <ErrorDisplay />

      <nav className="grow overflow-y-auto p-3 space-y-2">
        {rooms.map(room => (
          <RoomCard key={room.id} room={room} isSelected={selectedRoomId === room.id} onSelect={onSelectRoom} />
        ))}
        {rooms.length === 0 && !fetchLoading && !creationError && (
          <div className="p-4 text-center text-gray-400 text-sm italic">
             + Create group
          </div>
        )}
      </nav>

      {isModalOpen && <RoomCreationModal />}
    </div>
  );
}