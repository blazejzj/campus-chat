import { linkFor } from "rwsdk/router";

type App = typeof import("../worker").default;

const appLink = linkFor<App>();

export const links = {
    api: {
        auth: {
            login: appLink("/api/v1/auth/login"),
            register: appLink("/api/v1/auth/register"),
            logout: appLink("/api/v1/auth/logout"),
        },
        // exampel how to extend
        // chat: {
        //     list all rooms
        //     list: appLink("/api/v1/chat"),
        //     specific rooms with ids
        //     room: (roomId: string) =>
        //         appLink("/api/v1/chat/:roomId", { roomId }),
        // },
    },
    pages: {
        root: appLink("/"),
        login: appLink("/login"),
        register: appLink("/register"),
        dashboard: appLink("/dashboard"),

        // example how to extend -> note you need to add your own links in feature
        // chat: {
        //     list: appLink("/chat"),
        //     room: (roomId: string) => appLink("/chat/:roomId", { roomId }),
        // },
    },
} as const;

export type AppLink = typeof links;

// example use of links
//  // fetch list of roms
// await request(chatLink.api.list(), { method: "GET" });

// // fetch a single specific room
// await request(chatLink.api.room("123"), { method: "GET" });

// // go to ui page to a specific room
// router.push(chatLink.pages.room("123"));
