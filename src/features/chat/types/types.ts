export type ChatMessageDto = {
    id: number;
    authorId: number | null;
    authorName: string;
    body: string | null;
    createdAt: string | null;
};
