import { route } from "rwsdk/router";
import { ProfileController } from "../controllers/profileController";
import { AvatarController } from "../controllers/avatarController";

export const profileRoutes = [
    route("/profile", ProfileController),
    route("/profile/avatar", AvatarController),
];
