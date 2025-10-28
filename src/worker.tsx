import { defineApp } from "rwsdk/worker";
import { route, render, layout } from "rwsdk/router";
import { Document } from "@/app/Document";
import LandingPage from "./app/pages/LandingPage";
import LoginPage from "./app/pages/LoginPage";
import RegisterPage from "./app/pages/RegisterPage";
import DashboardPage from "./app/pages/DashboardPage";
import { apiV1 } from "./server/api/v1";
import { AuthLayout } from "./features/auth/screens/AuthLayout";
import { authMiddleware } from "./app/middleware/authMiddleware";

export default defineApp([
    authMiddleware(),
    route("/api/*", async ({ request }) => {
        const res = await apiV1(request);
        return (
            res ??
            new Response(JSON.stringify({ error: "Not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            })
        );
    }),

    render(Document, [
        layout(AuthLayout, [
            route("/", () => <LandingPage />),
            route("/login", () => <LoginPage />),
            route("/register", () => <RegisterPage />),
            route("/dashboard", () => <DashboardPage />),
        ]),
    ]),
]);
