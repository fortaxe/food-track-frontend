"use client";

import { useState, useEffect } from "react";
import SignIn from "@/components/sign-in";
import ChatInterface from "@/components/chat-interface";
import Sidebar from "@/components/sidebar";

interface User {
  id: string;
  name?: string | null;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-2xl font-bold text-white">Welcome to Food Track</h1>
          <p className="text-zinc-400 text-center max-w-md">
            Track what you eat using voice. Understand how food affects your health.
          </p>
          <SignIn onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar onLogout={handleLogout} userName={user.name || user.email} />
      <main className="flex-1">
        <ChatInterface user={user} onLogout={handleLogout} />
      </main>
    </div>
  );
}
