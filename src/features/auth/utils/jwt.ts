import { SignJWT, jwtVerify } from "jose";

const secretString = process.env.JWT_SECRET;

// convert to Uint8Array because jose doesnt understand :(
const secret = new TextEncoder().encode(secretString);

export async function createJwt(payload: Record<string, unknown>) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({
            alg: "HS256",
        })
        .setExpirationTime("7d")
        .sign(secret);

    return token;
}

export async function verifyJwt(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}
