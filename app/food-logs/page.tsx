"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import FoodLogsTable from "@/components/food-logs-table";

interface User {
    id: string;
    name?: string | null;
    email: string;
}

export default function FoodLogsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user");
                router.push("/");
            }
        } else {
            router.push("/");
        }
        setIsLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
    };

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <div className="animate-pulse text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-zinc-950">
            <Sidebar onLogout={handleLogout} userName={user.name || user.email} />
            <main className="flex-1">
                <FoodLogsTable userId={user.id} />
            </main>
        </div>
    );
}
