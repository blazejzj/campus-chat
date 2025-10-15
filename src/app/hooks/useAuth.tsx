"use client";

import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth has to be inside AuthProvider!");
    return context;
}
