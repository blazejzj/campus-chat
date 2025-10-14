"use client";

import { createContext, useEffect, useState } from "react";
import { User as CoreUser } from "../../../types/User";

type AuthUser = CoreUser | null;

type AuthContextType = {
    user: AuthUser;
    login: (token: string, user: CoreUser) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser>(null);

    useEffect(() => {
        // TODO: Change to cookie? Better for security
        const storedToken = localStorage.getItem("auth");
        if (storedToken) {
            const parsed = JSON.parse(storedToken);
            setUser(parsed.user);
        }
    }, []);

    const login = (token: string, nextUser: CoreUser) => {
        localStorage.setItem("auth", JSON.stringify({ token, user: nextUser }));
        setUser(nextUser);
    };

    const logout = () => {
        localStorage.removeItem("auth");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
