"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";

export default function Profile() {
    return (
        <main className="mx-auto max-w-sm p-6">
            <h1 className="mb-4 text-2xl font-bold">Profile</h1>
            <p className="theme-text-color">Le profilePage here.</p>
        </main>
    );
}
