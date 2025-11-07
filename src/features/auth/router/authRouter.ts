import { route } from "rwsdk/router";
import { authController } from "../controllers/authController";

const ApiBase = "/auth";

export const authRoutes = [
    route(`${ApiBase}/register`, authController.register),
    route(`${ApiBase}/login`, authController.login),
    route(`${ApiBase}/logout`, authController.logout),
];
