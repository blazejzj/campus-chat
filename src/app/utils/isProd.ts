import { env } from "cloudflare:workers";

export function isProd() {
    return env?.NODE_ENV === "production";
}
