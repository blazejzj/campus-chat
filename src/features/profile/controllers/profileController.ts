import { getAuthContext } from "@/server/context";
import authRepository from "@/features/auth/repository/authRepository";
import { json } from "@/app/utils/responseJson";
import { RequestInfo } from "rwsdk/worker";

export async function ProfileController({
    request,
}: RequestInfo): Promise<Response> {
    const { user } = await getAuthContext(request);
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    const dbUser = await authRepository.findUserByEmail(user.email);
    if (!dbUser) return json({ error: "User not found" }, 404);

    return json({
        email: dbUser.email,
        //We are working with all the db schemas atm, waiting for those:
        //name: dbUser.name ?? "",
        //status: dbUser.status ?? "",
    });
}
