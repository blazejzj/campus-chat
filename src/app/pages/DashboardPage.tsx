"use client";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
    const { user, logout } = useAuth();

    if (!user) {
        return <h1>youre not logged in dammit</h1>;
    }

    return (
        <div>
            <h1>you are on dashboard page!</h1>
            <p>logged in as {user.email}</p>
            <button onClick={logout}>Logout here man</button>
        </div>
    );
}
