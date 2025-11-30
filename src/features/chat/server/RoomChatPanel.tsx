import roomChatService from "../service/roomChatService";
import type { RoomChatMessage } from "../hooks/useRoomChat";
import RoomChatScreen from "../screens/RoomChatScreen";

/*
  server-side wrapper that fetches initial messages
*/

type Props = {
    roomId: number;
};

export default async function RoomChatPanel({ roomId }: Props) {
    const result = await roomChatService.getMessages(roomId, 50);

    if (!result.ok) {
        return (
            <div className="flex h-full items-center justify-center px-4 py-3 text-sm text-red-600">
                Failed to load room chat messages.
            </div>
        );
    }

    const messages: RoomChatMessage[] = result.data.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        threadId: m.threadId,
        authorId: m.authorId,
        body: m.body,
        createdAt: m.createdAt ? m.createdAt.toISOString() : null,
    }));

    return (
        <RoomChatScreen
            roomId={roomId}
            realtimeVersion={0}
            initialMessages={messages}
        />
    );
}
