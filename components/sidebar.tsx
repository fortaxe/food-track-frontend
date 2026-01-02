"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, UtensilsCrossed, ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    onLogout: () => void;
    userName?: string | null;
}

export default function Sidebar({ onLogout, userName }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileOpen]);

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

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                {(isExpanded || isMobile) && (
                    <h1 className="text-lg font-bold text-white">🍽️ Food Track</h1>
                )}
                {isMobile ? (
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
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
                            {(isExpanded || isMobile) && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                {(isExpanded || isMobile) && userName && (
                    <div className="mb-3 text-sm text-zinc-400 truncate">
                        👋 {userName}
                    </div>
                )}
                <button
                    onClick={onLogout}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full",
                        !isExpanded && !isMobile && "justify-center"
                    )}
                >
                    <LogOut size={20} />
                    {(isExpanded || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button - Fixed in top right */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-4 right-4 z-40 p-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors shadow-lg"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "md:hidden fixed top-0 right-0 h-screen w-72 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-in-out",
                    isMobileOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <SidebarContent isMobile={true} />
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-300",
                    isExpanded ? "w-64" : "w-16"
                )}
            >
                <SidebarContent isMobile={false} />
            </aside>
        </>
    );
}
