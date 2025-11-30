"use client";

import { use } from "react";
import { AuthContext } from "../providers/AuthProvider";

export function useAuth() {
    const context = use(AuthContext);
    if (!context) throw new Error("useAuth has to be inside AuthProvider!");
    return context;
}
