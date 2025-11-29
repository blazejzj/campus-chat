export type CreateRoomFail = {
    ok: false;
    reason: "DATABASE_ERROR" | "ROOM_CREATION_FAILED";
};

export type CreateRoomSuccess = {
    ok: true;
    id: string;
};

export type CreateRoomResult = CreateRoomSuccess | CreateRoomFail;

export type AddRoomMemberResult =
    | { ok: true }
    | {
          ok: false;
          reason: "ALREADY_MEMBER" | "ROOM_NOT_FOUND" | "DATABASE_ERROR";
      };

export type RoomResponse = {
    id: string;
    name: string;
    visibility?: "public" | "private";
    createdBy?: string | null;
};

export type RoomFromRepo = {
    id: number;
    name: string;
    visibility: string | null;
    createdBy: number | null;
    createdAt: Date | number | null;
};

// for now magic strings, but should be maybe tied to Errors util
export type InviteUserResult =
    | { ok: true }
    | {
          ok: false;
          reason:
              | "ROOM_NOT_FOUND"
              | "NOT_OWNER"
              | "USER_NOT_FOUND"
              | "ALREADY_MEMBER"
              | "DATABASE_ERROR";
      };

export type RoomMemberResponse = {
    id: string;
    email: string;
    displayName: string | null;
};
