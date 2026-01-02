"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, UtensilsCrossed } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FoodLog {
    id: string;
    userId: string;
    mealType: string;
    foodItems: string;
    notes: string | null;
    loggedAt: string;
    createdAt: string;
}

interface FoodLogsTableProps {
    userId: string;
}

export default function FoodLogsTable({ userId }: FoodLogsTableProps) {
    const [logs, setLogs] = useState<FoodLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [userId]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_URL}/api/food-logs?userId=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch food logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const parseFoodItems = (foodItems: string): string[] => {
        try {
            return JSON.parse(foodItems);
        } catch {
            return [foodItems];
        }
    };

    const getMealEmoji = (mealType: string): string => {
        const emojis: Record<string, string> = {
            breakfast: "🌅",
            lunch: "☀️",
            dinner: "🌙",
            snack: "🍿",
        };
        return emojis[mealType.toLowerCase()] || "🍽️";
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "-";
        }
    };

    const formatTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return "-";
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UtensilsCrossed className="text-emerald-500" />
                    Food Logs
                </h1>
                <p className="text-zinc-400 mt-1">All your logged meals</p>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            ) : logs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        No meals logged yet
                    </h2>
                    <p className="text-zinc-400 max-w-md">
                        Use the chat to log what you eat!
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto rounded-lg border border-zinc-800">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
                                <TableHead className="text-zinc-400">Date</TableHead>

                                <TableHead className="text-zinc-400">Meal</TableHead>
                                <TableHead className="text-zinc-400">Food Items</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className="border-zinc-800 hover:bg-zinc-900/50"
                                >
                                    <TableCell className="text-zinc-300">
                                        {formatDate(log.loggedAt)}
                                    </TableCell>

                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">
                                                {getMealEmoji(log.mealType)}
                                            </span>
                                            <span className="capitalize">{log.mealType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {parseFoodItems(log.foodItems).map((item, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
