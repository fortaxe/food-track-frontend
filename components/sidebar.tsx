"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, UtensilsCrossed, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    onLogout: () => void;
    userName?: string | null;
}

export default function Sidebar({ onLogout, userName }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const pathname = usePathname();

    const navItems = [
        {
            href: "/",
            label: "Chat",
            icon: MessageCircle,
        },
        {
            href: "/food-logs",
            label: "Food Logs",
            icon: UtensilsCrossed,
        },
    ];

    return (
        <aside
            className={cn(
                "flex flex-col h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-300",
                isExpanded ? "w-64" : "w-16"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                {isExpanded && (
                    <h1 className="text-lg font-bold text-white">🍽️ Food Track</h1>
                )}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-emerald-600 text-white"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                        >
                            <item.icon size={20} />
                            {isExpanded && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                {isExpanded && userName && (
                    <div className="mb-3 text-sm text-zinc-400 truncate">
                        👋 {userName}
                    </div>
                )}
                <button
                    onClick={onLogout}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full",
                        !isExpanded && "justify-center"
                    )}
                >
                    <LogOut size={20} />
                    {isExpanded && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
