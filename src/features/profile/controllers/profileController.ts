import { getAuthContext } from "@/server/context";
import { findUserByEmail } from "@/features/auth/repository/userRepository";
import { json } from "@/app/utils/responseJson";

export async function ProfileController(req: Request): Promise<Response> {
    const { user } = await getAuthContext(req);
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    const dbUser = await findUserByEmail(user.email);
    if (!dbUser) return json({ error: "User not found" }, 404);

    return json({
        email: dbUser.email,
        //We are working with all the db schemas atm, waiting for those:
        //name: dbUser.name ?? "",
        //status: dbUser.status ?? "",
    });
}
