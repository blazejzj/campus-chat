import globalChatService from "../services/globalChatService";
import GlobalChatScreen from "../screens/GlobalChatScreen";
import type { GlobalChatMessage } from "../hooks/useGlobalChat";

export default async function GlobalChatPanel() {
    const result = await globalChatService.getMessages();

    if (!result.ok) {
        return (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Failed to load global chat messages.
            </div>
        );
    }

    const messages: GlobalChatMessage[] = result.data.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        threadId: m.threadId,
        authorId: m.authorId,
        body: m.body,
        createdAt: m.createdAt ? m.createdAt.toISOString() : null,
    }));

    return <GlobalChatScreen initialMessages={messages} />;
}
