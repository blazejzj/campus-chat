import { getAuthContext } from "@/server/context";
import authRepository from "@/features/auth/repository/authRepository";
import { json } from "@/app/utils/responseJson";
import { RequestInfo } from "rwsdk/worker";
import profileRepository from "@/features/profile/repository/profileRepository";

export async function ProfileController({
    request,
}: RequestInfo): Promise<Response> {
    const { user } = await getAuthContext(request);
    if (!user?.id) return json({ error: "Unauthorized" }, 401);

    if (request.method === "PATCH") {
        try {
            const body = (await request.json()) as {
                displayName?: string;
                status?: string;
                avatarUrl?: string;
            };

            await profileRepository.updateProfileByUserId(user.id, body);
            return json({ success: true });
        } catch {
            return json({ error: "FAiled to update profile" }, 400);
        }
    }

    const profile = await profileRepository.findProfileByUserId(user.id);
    if (!profile) return json({ error: "Profile not found" }, 404);

    return json({
        displayName: profile.displayName ?? "",
        status: profile.status ?? "",
        avatarUrl: profile.avatarUrl ?? "",
    });
}
