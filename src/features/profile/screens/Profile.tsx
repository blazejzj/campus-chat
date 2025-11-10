"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";
import CampusChatAllroundButton from "@/features/profile/components/CampusChatAllroundButton";
import CampusChatAllroundInputField from "../components/CampusChatAllroundInputField";
import SideBar from "../components/SideBar";
import { useFetch } from "@/app/hooks/useFetch";
import { useEffect } from "react";

export default function Profile() {
    const { user } = useAuth();
    const { request, loading, error } = useFetch();

    console.log(user);
    if (!user) {
        return <div>Please log in to access your profile.</div>;
    }

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

                console.log("Profile data loaded:", data);
                setEmail(data.email || "");
                setName(data.displayName || "");
                setStatus(data.status || "");
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        }

        loadProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await request<{
                email: string;
                displayName?: string;
                status?: string;
                avatarUrl?: string;
            }>("/api/v1/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: name,
                    status: status,
                    //email: email, (email update not supported yet - perhaps later..we are not sure here ??
                }),
                credentials: "include",
            });

            if (updated.displayName !== undefined) setName(updated.displayName);
            if (updated.status !== undefined) setStatus(updated.status);
            if (updated.email !== undefined) setEmail(updated.email);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    return (
        //Sidebar componetn goes here: unsure of exact placement (within/witout main)
        <div className="flex min-h-screen">
            <SideBar />
            <main className="flex-1 p-6">
                {/* Header section here */}
                <section className=" border-b">
                    <h1 className="mb-4 text-4xl font-bold theme-text-color">
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
                    <form className="space-y-4" onSubmit={handleSubmit}>
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
                        <CampusChatAllroundButton
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </CampusChatAllroundButton>
                    </form>
                </section>
            </main>
        </div>
    );
}
