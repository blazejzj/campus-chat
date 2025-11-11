import { json } from "@/app/utils/responseJson";
import { RequestInfo } from "rwsdk/worker";
import profileRepository from "@/features/profile/repository/profileRepository";

const maxSize = 5 * 1024 * 1024; // 5MBytes

export async function AvatarController({
    request,
    ctx,
}: RequestInfo): Promise<Response> {
    const user = ctx.user as { id: number; email: string } | undefined;

    if (!user?.id) {
        return json({ error: "Unauthorized" }, 401);
    }

    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    try {
        const formData = await request.formData();
        const file = formData.get("avatar") as File | null;

        if (!file) {
            return json({ error: "No file uploaded" }, 400);
        }

        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            return json({ error: "Invalid file type" }, 400);
        }

        if (file.size > maxSize) {
            return json({ error: "File is too large" }, 400);
        }

        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const filename = `avatar_${user.id}_${timestamp}.${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        {
            /* TODO: localstorage not working at all locally...cannot uplaod file. fsWriteFile error. Need to ask Blazej for cloudflare R2 storage..Cloudflare not supportin local storage (fs)  */
        }

        const avatarUrl = "";
        await profileRepository.updateProfileByUserId(user.id, { avatarUrl });

        return json({ avatarUrl });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return json({ error: "Failed to upload avatar" }, 500);
    }
}
