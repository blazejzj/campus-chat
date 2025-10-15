import { findUserByEmail } from "@/features/auth/repository/userRepository";
import { verifyJwt } from "@/features/auth/utils/jwt";

export type AuthContext = {
    user: { id: number; email: string } | null;
};

export async function getAuthContext(req: Request): Promise<AuthContext> {
    const authHeader = req.headers.get("authorization");
    // we expect an auth header using the "bearer <token>" "scheme", which is goign to be out convention
    // if its missing or basically not "Bearer" we treat it as unauthorized for token auth
    if (!authHeader?.startsWith("Bearer ")) return { user: null };

    const token = authHeader.substring("Bearer ".length);

    const jwtPayload = (await verifyJwt(token)) as {
        email?: string;
        id?: number;
    } | null;

    if (!jwtPayload?.email) return { user: null };

    // note sure we need this...
    const user = await findUserByEmail(jwtPayload.email);
    if (!user) return { user: null };

    return { user: { id: user.id, email: user.email } };
}
