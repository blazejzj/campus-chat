import { links } from "@/app/links";

export const authLink = {
    api: {
        login: () => links.api.auth.login,
        register: () => links.api.auth.register,
        logout: () => links.api.auth.logout,
    },
    pages: {
        login: () => links.pages.login,
        register: () => links.pages.register,
        dashboard: () => links.pages.dashboard,
    },
} as const;
