export type NotificationPayload =
    | {
          roomId: number;
          roomName: string;
          invitedByUserId: number;
          invitedByEmail: string;
      }
    | unknown;

export type NotificationResponse = {
    id: number;
    type: string;
    payload: NotificationPayload | null;
    createdAt: string | null;
    readAt: string | null;
};
