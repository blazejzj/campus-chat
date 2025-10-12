import { defineApp } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { Document } from "@/app/Document";
import LandingPage from "./app/pages/LandingPage";
import LoginPage from "./app/pages/LoginPage";
import RegisterPage from "./app/pages/RegisterPage";

export default defineApp([
    render(Document, [
        route("/", () => <LandingPage />),
        route("/login", () => <LoginPage />),
        route("/register", () => <RegisterPage />),
    ]),
]);
