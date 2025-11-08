import { route } from "rwsdk/router";
import { ProfileController } from "../controllers/profileController";

export const profileRoutes = [route("/profile", ProfileController)];
