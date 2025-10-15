import { defineApp } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { Document } from "@/app/Document";
import LandingPage from "./app/pages/LandingPage";
import LoginPage from "./app/pages/LoginPage";
import RegisterPage from "./app/pages/RegisterPage";
import DashboardPage from "./app/pages/DashboardPage";
import { apiV1 } from "./server/api/v1";

import { AppWrapped } from "./app/AppWrapped";
const withApp = (node: React.ReactNode) => <AppWrapped>{node}</AppWrapped>;

export default defineApp([
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
        route("/", () => withApp(<LandingPage />)),
        route("/login", () => withApp(<LoginPage />)),
        route("/register", () => withApp(<RegisterPage />)),
        route("/dashboard", () => withApp(<DashboardPage />)),
    ]),
]);
