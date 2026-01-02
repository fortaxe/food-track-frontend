"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";

interface SignInProps {
    onSuccess: (user: { id: string; name?: string | null; email: string }, token: string) => void;
}

export default function SignIn({ onSuccess }: SignInProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store token in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                toast.success("Login successful!");
                onSuccess(data.user, data.token);
            } else {
                toast.error(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-72">
            <h2 className="text-lg font-bold text-white">Get Started</h2>
            <p className="text-sm text-zinc-400">Enter your email and password to continue.</p>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isLoading}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
            <Button onClick={handleAuth} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                    </>
                ) : (
                    "Continue"
                )}
            </Button>
        </div>
    );
}
