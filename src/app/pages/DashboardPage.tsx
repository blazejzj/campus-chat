import DashboardScreen from "@/features/dashboard/screens/DashboardScreen";
import globalChatService from "@/features/globalChat/services/globalChatService";
import type { GlobalChatMessage } from "@/features/globalChat/hooks/useGlobalChat";

export default async function DashboardPage() {
    const result = await globalChatService.getMessages();

    let initialMessages: GlobalChatMessage[] = [];

    if (result.ok) {
        initialMessages = result.data.map((m) => ({
            id: m.id,
            roomId: m.roomId,
            threadId: m.threadId,
            authorId: m.authorId,
            body: m.body,
            createdAt: m.createdAt ? m.createdAt.toISOString() : null,
            authorDisplayName: (m as any).authorDisplayName ?? null,
            authorAvatarUrl: (m as any).authorAvatarUrl ?? null,
            authorEmail: (m as any).authorEmail ?? null,
        }));
    }

    const realtimeVersion = Date.now();

    return (
        <DashboardScreen
            initialGlobalMessages={initialMessages}
            realtimeVersion={realtimeVersion}
        />
    );
}
