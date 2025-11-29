// import { linkFor } from "rwsdk/router";

// type App = typeof import("../worker").default;

// const appLink = linkFor<App>();

// export const links = {
//     api: {
//         auth: {
//             login: appLink("/api/v1/auth/login"),
//             register: appLink("/api/v1/auth/register"),
//             logout: appLink("/api/v1/auth/logout"),
//         },git
//         // exampel how to extend
//         chat: {
//             global: appLink("/api/v1/chat/global"),
//         },
//     },
//     pages: {
//         root: appLink("/"),
//         login: appLink("/login"),
//         register: appLink("/register"),
//         dashboard: appLink("/dashboard"),

//         // example how to extend -> note you need to add your own links in feature
//         // chat: {
//         //     list: appLink("/chat"),
//         //     room: (roomId: string) => appLink("/chat/:roomId", { roomId }),
//         // },
//     },
// } as const;

// export type AppLink = typeof links;

// // example use of links
// //  // fetch list of roms
// // await request(chatLink.api.list(), { method: "GET" });

// // // fetch a single specific room
// // await request(chatLink.api.room("123"), { method: "GET" });

// // // go to ui page to a specific room
// router.push(chatLink.pages.room("123"));

export const links = {
    api: {
        auth: {
            login: "/api/v1/auth/login",
            register: "/api/v1/auth/register",
            logout: "/api/v1/auth/logout",
        },
        chat: {
            global: "/api/v1/chat/global",
        },
        profile: {
            me: "/api/v1/profile",
            avatar: "/api/v1/profile/avatar",
        },
    },
    pages: {
        root: "/",
        login: "/login",
        register: "/register",
        dashboard: "/dashboard",
        profile: "/profile",
    },
} as const;

export type AppLink = typeof links;
