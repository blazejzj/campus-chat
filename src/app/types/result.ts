import { ErrorCode } from "./errors";

export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; reason: ErrorCode; message?: string };

export type AsyncResult<T> = Promise<Result<T>>;
