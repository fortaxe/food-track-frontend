"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useConversation } from "@11labs/react";
import { API_URL } from "@/lib/config";
import { AnimatedWaveform } from "@/components/ui/animated-waveform";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface User {
    id: string;
    name?: string | null;
    email: string;
}

interface ChatInterfaceProps {
    user: User;
    onLogout: () => void;
}

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export default function ChatInterface({ user, onLogout }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Hi! 👋 I'm your food tracking assistant. Tell me what you've eaten today - just say something like "I had oatmeal with berries for breakfast" or "Just finished lunch - had a chicken salad". Tap the mic to start speaking!`
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceState, setVoiceState] = useState<VoiceState>("idle");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ElevenLabs Conversation hook
    const conversation = useConversation({
        onConnect: () => {
            console.log("Connected to Voice Assistant");
            // toast.success("Voice assistant connected!");
            setVoiceState("listening");
        },
        onDisconnect: () => {
            console.log("Disconnected from Voice Assistant");
            setVoiceState("idle");
        },
        onMessage: (message: { message?: string }) => {
            console.log("Message from Voice Assistant:", message);
            setVoiceState("speaking");
            // Handle incoming messages from the AI
            if (message.message) {
                const assistantMessage: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: message.message
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        },
        onError: (error: string | Error) => {
            console.error("ElevenLabs error:", error);
            toast.error("Voice connection error");
            setVoiceState("idle");
        },
    });

    // Update voice state based on conversation
    useEffect(() => {
        if (conversation.status === "connected") {
            if (conversation.isSpeaking) {
                setVoiceState("speaking");
            } else {
                setVoiceState("listening");
            }
        } else {
            if (voiceState !== "thinking") {
                setVoiceState("idle");
            }
        }
    }, [conversation.status, conversation.isSpeaking]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        const userInput = input.trim();
        setInput("");
        setIsLoading(true);

        try {
            // Process with simple logic if not using voice
            const response = await processUserInput(userInput, user.id);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Speak the response
            await speakText(response);
        } catch (error) {
            toast.error("Failed to process your message");
        } finally {
            setIsLoading(false);
        }
    };

    const processUserInput = async (text: string, userId: string): Promise<string> => {
        const lowerText = text.toLowerCase();

        let mealType: string | null = null;
        if (lowerText.includes("breakfast") || lowerText.includes("morning")) {
            mealType = "breakfast";
        } else if (lowerText.includes("lunch") || lowerText.includes("noon") || lowerText.includes("midday")) {
            mealType = "lunch";
        } else if (lowerText.includes("dinner") || lowerText.includes("evening") || lowerText.includes("night")) {
            mealType = "dinner";
        } else if (lowerText.includes("snack")) {
            mealType = "snack";
        }

        if (!mealType) {
            return "I'd love to log that for you! Was this for breakfast, lunch, dinner, or a snack? 🍽️";
        }

        try {
            const response = await fetch(`${API_URL}/api/food-logs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                    userId,
                    mealType,
                    foodItems: [text],
                    notes: null
                })
            });

            if (response.ok) {
                const mealEmojis: Record<string, string> = {
                    breakfast: "🌅",
                    lunch: "☀️",
                    dinner: "🌙",
                    snack: "🍿"
                };
                return `Got it! I've logged your ${mealType} ${mealEmojis[mealType]}. Keep tracking to understand how food affects how you feel!`;
            }
        } catch (error) {
            console.error("Failed to save food log:", error);
        }

        return "I've noted that down for you! 💪";
    };

    const speakText = async (text: string) => {
        try {
            setIsSpeaking(true);
            const response = await fetch(`${API_URL}/api/elevenlabs/tts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    audioRef.current.play();
                    audioRef.current.onended = () => {
                        setIsSpeaking(false);
                        URL.revokeObjectURL(audioUrl);
                    };
                }
            }
        } catch (error) {
            console.error("TTS error:", error);
            setIsSpeaking(false);
        }
    };

    const startVoiceConversation = async () => {
        try {
            setVoiceState("thinking");
            // Get signed URL from backend with user ID
            const response = await fetch(`${API_URL}/api/elevenlabs/signed-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({ userId: user.id })
            });

            if (response.ok) {
                const { signedUrl } = await response.json();
                await conversation.startSession({
                    signedUrl,
                    dynamicVariables: {
                        user_id: user.id,
                    }
                });
            } else {
                setVoiceState("idle");
                // Fallback to Web Speech API
                startWebSpeechRecognition();
            }
        } catch (error) {
            console.error("Failed to start voice:", error);
            setVoiceState("idle");
            // Fallback to Web Speech API
            startWebSpeechRecognition();
        }
    };

    const startWebSpeechRecognition = () => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            toast.error("Speech recognition not supported in this browser");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            toast.success("Got it! Press send or edit your message.");
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            toast.error("Could not understand. Please try again.");
        };

        recognition.start();
        toast.info("Listening... Speak now!");
    };

    const stopVoiceConversation = async () => {
        await conversation.endSession();
        setVoiceState("idle");
    };

    const handleLogout = () => {
        onLogout();
    };

    const isVoiceActive = conversation.status === "connected";

    const handleWaveformClick = () => {
        if (isVoiceActive) {
            stopVoiceConversation();
        } else {
            startVoiceConversation();
        }
    };

    const getStatusText = () => {
        switch (voiceState) {
            case "listening":
                return "🎙️ Listening...";
            case "speaking":
                return "🗣️ Speaking...";
            case "thinking":
                return "⏳ Connecting...";
            default:
                return "Tap to start speaking";
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950">
            {/* Hidden audio element for TTS playback */}
            <audio ref={audioRef} className="hidden" />

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-white font-semibold">Food Track</h1>
                        <p className="text-zinc-500 text-sm">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSpeaking && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <Volume2 className="h-4 w-4 animate-pulse" />
                            Speaking...
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-zinc-800/80 text-zinc-100 backdrop-blur-sm"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-800/80 rounded-2xl px-4 py-3 text-zinc-400 backdrop-blur-sm">
                                    <span className="animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Voice Control Section */}
                <div className="border-t border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl">
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        <div className="flex flex-col items-center gap-4">
                            {/* Animated Waveform */}
                            <div
                                onClick={handleWaveformClick}
                                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            >
                                <AnimatedWaveform
                                    state={voiceState}
                                    size={100}
                                />
                            </div>

                            {/* Status Text */}
                            <p className={`text-sm font-medium transition-colors ${voiceState !== "idle" ? "text-emerald-400" : "text-zinc-500"
                                }`}>
                                {getStatusText()}
                            </p>

                            {/* Stop button when active */}
                            {isVoiceActive && (
                                <button
                                    onClick={stopVoiceConversation}
                                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Tap waveform to stop
                                </button>
                            )}
                        </div>

                        {/* Commented out input bar and button */}
                        {/* <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={isVoiceActive ? "Listening..." : "Tell me what you ate..."}
                            className="flex-1 bg-zinc-800 text-white rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-500"
                            disabled={isLoading || isVoiceActive}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading || isVoiceActive}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                        >
                            <Send className="h-5 w-5" />
                        </Button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
