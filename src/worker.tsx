import { defineApp } from "rwsdk/worker";
import { route, render, layout, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import LandingPage from "./app/pages/LandingPage";
import LoginPage from "./app/pages/LoginPage";
import RegisterPage from "./app/pages/RegisterPage";
import DashboardPage from "./app/pages/DashboardPage";
import { AuthLayout } from "./features/auth/screens/AuthLayout";
import { authMiddleware } from "./app/middleware/authMiddleware";
import NotFoundPage from "./app/pages/NotFoundPage";
import { User } from "../types/User";
import { setCommonHeaders } from "./app/headers";
import { apiV1Routes } from "./server/api/v1";

// magic context, extending global context
export type AppContext = {
    user: User | null;
};

export default defineApp([
    setCommonHeaders(),
    authMiddleware,
    prefix("/api", [prefix("/v1", [...apiV1Routes])]),

    render(Document, [
        layout(AuthLayout, [
            route("/", () => <LandingPage />),
            route("/login", () => <LoginPage />),
            route("/register", () => <RegisterPage />),
            route("/dashboard", () => <DashboardPage />),
            route("/*", () => <NotFoundPage />),
        ]),
    ]),
]);
