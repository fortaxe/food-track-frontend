"use client";

import { motion } from "motion/react";

type VoiceWaveformState = "idle" | "listening" | "thinking" | "speaking";

interface AnimatedWaveformProps {
    state: VoiceWaveformState;
    size?: number;
    className?: string;
}

export function AnimatedWaveform({ state, size = 80, className = "" }: AnimatedWaveformProps) {
    const isActive = state !== "idle";
    const isListening = state === "listening";
    const isSpeaking = state === "speaking";
    const isThinking = state === "thinking";

    // Different animation configs for different states
    const getBarAnimation = (index: number) => {
        if (isThinking) {
            return {
                scaleY: [1, 0.3, 1],
                transition: {
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: "easeInOut" as const
                }
            };
        }

        if (isListening || isSpeaking) {
            const baseDelay = index * 0.12;
            const duration = isSpeaking ? 0.8 : 1.0;
            const minScale = isSpeaking ? 0.4 : 0.5;

            return {
                scaleY: [1, minScale, 1, 0.6, 1],
                transition: {
                    duration,
                    repeat: Infinity,
                    delay: baseDelay,
                    ease: "easeInOut" as const
                }
            };
        }

        return {};
    };

    // Colors based on state
    const getColor = () => {
        switch (state) {
            case "listening":
                return "#10b981"; // emerald-500
            case "speaking":
                return "#06b6d4"; // cyan-500
            case "thinking":
                return "#f59e0b"; // amber-500
            default:
                return "#71717a"; // zinc-500
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Glow effect */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ backgroundColor: getColor() }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}

            {/* Main container */}
            <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: isActive ? `${getColor()}20` : "rgba(39, 39, 42, 0.8)",
                    border: `2px solid ${isActive ? getColor() : "#52525b"}`
                }}
                whileHover={!isActive ? { scale: 1.05, borderColor: "#10b981" } : {}}
                whileTap={!isActive ? { scale: 0.95 } : {}}
                animate={{
                    borderColor: isActive ? getColor() : "#52525b",
                    backgroundColor: isActive ? `${getColor()}20` : "rgba(39, 39, 42, 0.8)"
                }}
                transition={{ duration: 0.3 }}
            >
                {/* Waveform SVG */}
                <svg
                    width={size * 0.45}
                    height={size * 0.45}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g clipPath="url(#waveform-clip)">
                        {/* Bar 1 - Left most (shortest) */}
                        <motion.path
                            d="M0.00349495 8.98381C0.00349495 8.79612 -0.00423762 8.60843 0.00349495 8.42144C0.0102621 8.22059 0.090269 8.02915 0.228433 7.88322C0.366598 7.73729 0.553375 7.64693 0.753553 7.6292C1.16549 7.58351 1.57672 7.83657 1.62452 8.26186C1.67784 8.75973 1.67454 9.26205 1.61468 9.75917C1.56547 10.1725 1.17252 10.4031 0.758474 10.3616C0.563701 10.3493 0.380067 10.2665 0.241807 10.1287C0.103547 9.991 0.0200957 9.80768 0.00700996 9.61295C-0.00986108 9.40207 0.00700996 9.19118 0.00700996 8.98029L0.00349495 8.98381Z"
                            fill={getColor()}
                            style={{ originY: 0.5, originX: 0.5 }}
                            animate={getBarAnimation(0)}
                        />

                        {/* Bar 2 */}
                        <motion.path
                            d="M3.6625 8.99644C3.6625 7.82531 3.6625 6.65418 3.6625 5.48164C3.6625 4.93755 3.98797 4.57974 4.46949 4.56779C4.96157 4.55584 5.30953 4.91927 5.31305 5.48164C5.31773 7.82484 5.31773 10.1669 5.31305 12.5077C5.31305 13.0272 5.05225 13.3414 4.61009 13.4103C4.42356 13.4399 4.23256 13.4034 4.07008 13.3071C3.90759 13.2109 3.78382 13.0609 3.72014 12.8831C3.6777 12.7256 3.65945 12.5625 3.66601 12.3995C3.66039 11.2691 3.6625 10.1338 3.6625 8.99644Z"
                            fill={getColor()}
                            style={{ originY: 0.5, originX: 0.5 }}
                            animate={getBarAnimation(1)}
                        />

                        {/* Bar 3 - Center (tallest) */}
                        <motion.path
                            d="M8.98499 9.0373C8.98499 11.7184 8.98499 14.3992 8.98499 17.0799C8.98499 17.7653 8.42262 18.1927 7.84831 17.9136C7.64515 17.8152 7.48769 17.5726 7.3724 17.3618C7.29648 17.2212 7.32038 17.0194 7.31968 16.8451C7.31968 11.6122 7.31968 6.37941 7.31968 1.14657C7.31968 1.04113 7.31546 0.935686 7.3246 0.830945C7.37029 0.324813 7.7281 -0.0126074 8.18994 0.000748893C8.65179 0.0141051 8.98499 0.375426 8.9864 0.889993C8.99062 2.37675 8.9864 3.86281 8.9864 5.34957C8.98593 6.57929 8.98546 7.80853 8.98499 9.0373Z"
                            fill={getColor()}
                            style={{ originY: 0.5, originX: 0.5 }}
                            animate={getBarAnimation(2)}
                        />

                        {/* Bar 4 */}
                        <motion.path
                            d="M10.9904 8.9964C10.9904 7.32265 10.9904 5.6489 10.9904 3.97445C10.9904 3.3214 11.4923 2.92001 12.0722 3.09013C12.4385 3.19839 12.6641 3.5119 12.6677 3.94282C12.674 4.63383 12.6677 5.32414 12.6677 6.01515C12.6677 8.67234 12.6677 11.3298 12.6677 13.9874C12.6677 14.6749 12.191 15.0714 11.5851 14.9013C11.1942 14.793 10.989 14.4844 10.9883 13.9811C10.9883 12.3207 10.989 10.6591 10.9904 8.9964Z"
                            fill={getColor()}
                            style={{ originY: 0.5, originX: 0.5 }}
                            animate={getBarAnimation(3)}
                        />

                        {/* Bar 5 - Right most (shortest) */}
                        <motion.path
                            d="M16.3385 8.99645C16.3385 9.65091 16.3463 10.3061 16.3385 10.9598C16.3308 11.4674 16.0827 11.8034 15.6869 11.8737C15.1147 11.9819 14.6774 11.6206 14.6753 11.0182C14.6688 9.6741 14.6688 8.32981 14.6753 6.98528C14.6753 6.46298 14.9945 6.11923 15.4704 6.10728C15.9625 6.09463 16.3203 6.42713 16.3357 6.96068C16.3554 7.63833 16.3406 8.31669 16.3406 8.99434L16.3385 8.99645Z"
                            fill={getColor()}
                            style={{ originY: 0.5, originX: 0.5 }}
                            animate={getBarAnimation(4)}
                        />
                    </g>
                    <defs>
                        <clipPath id="waveform-clip">
                            <rect width="18" height="18" fill="white" />
                        </clipPath>
                    </defs>
                </svg>

                {/* Pulse rings when active */}
                {isActive && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ border: `2px solid ${getColor()}` }}
                            initial={{ opacity: 0.6, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ border: `1px solid ${getColor()}` }}
                            initial={{ opacity: 0.4, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.8 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                        />
                    </>
                )}
            </motion.div>
        </div>
    );
}
