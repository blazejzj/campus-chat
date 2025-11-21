import { type Result } from "../types/result";

export function jsonResult<T>(
    result: Result<T>,
    status = result.ok ? 200 : 400,
    headers: Record<string, string> = {}
) {
    return new Response(JSON.stringify(result), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });
}
