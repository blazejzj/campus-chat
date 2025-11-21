import { Result } from "../types/result";
import { jsonResult } from "./responseJson";
import { Errors, ErrorCode } from "@/app/types/errors";

export function codeToStatus(code: ErrorCode): number {
    switch (code) {
        case Errors.METHOD_NOT_ALLOWED:
            return 405;
        case Errors.VALIDATION_ERROR:
            return 400;
        case Errors.WRONG_CREDENTIALS:
            return 401;
        case Errors.EMAIL_IN_USE:
            return 409;
        case Errors.DATABASE_ERROR:
        case Errors.INTERNAL_SERVER_ERROR:
        default:
            return 500;
    }
}

export function errorResponse(
    code: ErrorCode,
    message: string,
    status?: number,
    headers: Record<string, string> = {}
) {
    const result: Result<never> = {
        ok: false,
        reason: code,
        message,
    };

    return jsonResult(result, status ?? codeToStatus(code), headers);
}

export function methodNotAllowed(allowedMethods: string[]) {
    return errorResponse(
        Errors.METHOD_NOT_ALLOWED,
        "Method not allowed for this endpoint",
        405,
        { Allow: allowedMethods.join(", ") }
    );
}
