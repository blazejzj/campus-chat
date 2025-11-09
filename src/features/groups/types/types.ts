export type CreateRoomFail = {
    ok: false;
    reason: "DATABASE_ERROR" | "ROOM_CREATION_FAILED";
};

export type CreateRoomSuccess = {
    ok: true;
    id: string; 
};

export type CreateRoomResult = CreateRoomSuccess | CreateRoomFail;

export type AddRoomMemberResult = { ok: true } | { ok: false, reason: "ALREADY_MEMBER" | "ROOM_NOT_FOUND" | "DATABASE_ERROR" };