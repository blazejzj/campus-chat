import { defineApp } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";

export default defineApp([render(Document, [route("/", Home)])]);
