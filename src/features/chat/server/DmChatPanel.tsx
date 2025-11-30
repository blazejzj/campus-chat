import dmChatService from "../service/dmChatService";
import type { DmChatMessage } from "../hooks/useDmChat";
import DmChatScreen from "../screens/DmChatScreen";

/*
  server wrapper that fetches initial dm messages
*/

type Props = {
    friendId: number;
    currentUserId: number;
};

export default async function DmChatPanel({ friendId, currentUserId }: Props) {
    const result = await dmChatService.getMessagesWithFriend(
        currentUserId,
        friendId,
        50
    );

    if (!result.ok) {
        return (
            <div className="flex h-full items-center justify-center px-4 py-3 text-sm text-red-600">
                Failed to load direct messages.
            </div>
        );
    }

    const messages: DmChatMessage[] = result.data.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        threadId: m.threadId,
        authorId: m.authorId,
        body: m.body,
        createdAt: m.createdAt ? m.createdAt.toISOString() : null,
    }));

    return (
        <DmChatScreen
            friendId={friendId}
            realtimeVersion={0}
            initialMessages={messages}
        />
    );
}
