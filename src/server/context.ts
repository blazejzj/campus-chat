import { findUserByEmail } from "@/features/auth/repository/userRepository";
import { verifyJwt } from "@/features/auth/utils/jwt";

export type AuthContext = {
    user: { id: number; email: string } | null;
};

export async function getAuthContext(req: Request): Promise<AuthContext> {
    const authHeader = req.headers.get("authorization");
    // we could potentially acll this token whatever we want, but lets make it traditional
    // and call it a Bearer. If it doesn't exist it means user is not logged in, no token
    // is available -> return null.
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
