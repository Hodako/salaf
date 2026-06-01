"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

/**
 * Property definitions for the NoticeMarquee component.
 */
interface NoticeMarqueeProps {
    /** Indicates whether the parent container has been scrolled, allowing the marquee height to transition to zero */
    isScrolled?: boolean;
}

/**
 * A global announcement ticker bar.
 * Fetches and horizontally scrolls active administrator notices with support for markdown syntax and dismissal.
 */
export const NoticeMarquee = ({ isScrolled = false }: NoticeMarqueeProps) => {
    const [notices, setNotices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await api.get("/notices/active");
                setNotices(res.data);
            } catch (error) {
                console.error("Failed to fetch notices:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (isLoading || notices.length === 0 || isDismissed) return null;

    return (
        <div className={cn(
            "bg-[#E2BC59] w-full transition-all duration-500 ease-in-out overflow-hidden shrink-0 border-[#0b0907]/5",
            isScrolled ? "h-0 opacity-0 border-b-0 pointer-events-none" : "h-9 opacity-100 border-b shadow-sm"
        )}>
            <div className="flex items-center h-9 w-full">
                <div className="flex items-center h-full px-4 bg-[#E2BC59] z-10 shrink-0 border-r border-black/10">
                    <Megaphone className="w-3.5 h-3.5 text-[#0b0907] mr-2 animate-pulse" />
                    <span className="text-[#0b0907] font-bold text-[11px] uppercase tracking-widest whitespace-nowrap">ANNOUNCEMENT:</span>
                </div>

                <div className="relative flex-1 flex items-center overflow-hidden bg-[#E2BC59]">
                    <div className="flex items-center gap-20 animate-marquee whitespace-nowrap py-1">
                        {notices.map((notice, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[#0b0907] text-xs md:text-sm font-bold tracking-wide">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <span>{children}</span>,
                                        strong: ({ children }) => <strong className="font-extrabold text-black">{children}</strong>,
                                        a: ({ href, children }) => (
                                            <a href={href} className="text-[#0b0907] underline decoration-solid underline-offset-4 hover:opacity-70 transition-all font-extrabold" target="_blank" rel="noopener noreferrer">
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {notice.content}
                                </ReactMarkdown>
                                {idx < (notices.length - 1) && (
                                    <span className="opacity-50 mx-4 font-bold">✦</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setIsDismissed(true)}
                    className="flex items-center justify-center w-9 h-full bg-[#E2BC59] z-10 border-l border-black/10 text-[#0b0907] hover:bg-[#0b0907] hover:text-[#E2BC59] transition-all group"
                >
                    <X className="w-4 h-4 group-active:scale-90" />
                </button>
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 15s linear infinite;
                    display: inline-flex;
                    padding-left: 2rem;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};
