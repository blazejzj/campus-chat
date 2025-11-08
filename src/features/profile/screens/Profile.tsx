"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";
import CampusChatAllroundButton from "@/features/profile/components/CampusChatAllroundButton";
import CampusChatAllroundInputField from "../components/CampusChatAllroundInputField";
import SideBar from "../components/SideBar";
import { useFetch } from "@/app/hooks/useFetch";
import { useEffect } from "react";
import { string } from "zod";

export default function Profile() {
    const { user } = useAuth();
    const { request, loading, error } = useFetch();

    const [name, setName] = useState("Leo");
    const [status, setStatus] = useState("online");
    const [email, setEmail] = useState("LeoD@hiof.no");

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await request<{
                    email: string;
                    displayName?: string;
                    status?: string;
                }>("/api/v1/profile", {
                    credentials: "include",
                });

                setEmail(data.email || "");
                setName(data.displayName || "");
                setStatus(data.status || "");
            } catch {}
        }

        loadProfile();
    }, [request]);

    return (
        //Sidebar componetn goes here: unsure of exact placement (within/witout main)
        <div className="flex min-h-screen">
            <SideBar />
            <main className="flex-1 p-6">
                {/* Header section here */}
                <section className=" border-b">
                    <h1 className="mb-4 text-4xl font-bold">
                        Profile Settings
                    </h1>
                    {/* Need separation line here, vert and horizontaøl. */}
                </section>

                {/* ProfilePic section here */}
                <section className="mb-6 mt-6 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-300" />
                    <button
                        type="button"
                        className="rounded border border-gray-300 px-3 py-1 text-sm font-medium"
                    >
                        Change
                    </button>
                </section>

                {/* Form section cjhange name status etc. here.  */}
                <section>
                    <form className="space-y-4">
                        <CampusChatAllroundInputField
                            props={{
                                label: "Name",
                                value: name,
                                onChange: (e) => setName(e.target.value),
                            }}
                        />
                        <CampusChatAllroundInputField
                            props={{
                                label: "Status",
                                value: status,
                                onChange: (e) => setStatus(e.target.value),
                            }}
                        />
                        <CampusChatAllroundInputField
                            props={{
                                label: "Email",
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                            }}
                        />
                        <CampusChatAllroundButton />
                    </form>
                </section>
            </main>
        </div>
    );
}
