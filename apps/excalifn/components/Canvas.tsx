"use client"

import intindraw from "@/draw/draw";
import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'
import { LuCircle, LuRectangleHorizontal } from "react-icons/lu";
import { FaRegHand } from "react-icons/fa6";
import { RxEraser, RxExit } from "react-icons/rx";
import { RiText } from "react-icons/ri";
import { BiSolidArrowFromBottom } from "react-icons/bi";

type TextOverlay = { x: number; y: number; canvasX: number; canvasY: number } | null;

export function Canvaspage({ roomid, WebSocket, slug }: {
    roomid: string;
    WebSocket: WebSocket;
    slug: string;
}) {
    const router    = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tool      = useRef<string>("rec");
    const addTextFn = useRef<((x: number, y: number, text: string, fontSize: number) => void) | null>(null);

    const [highlight,    setHighlight]    = useState("rec");
    const [textOverlay,  setTextOverlay]  = useState<TextOverlay>(null);
    const [textValue,    setTextValue]    = useState("");
    const [fontSize,     setFontSize]     = useState(20);

    // ── Init draw engine ──
    useEffect(() => {
        if (!canvasRef.current) return;
        let cleanup: (() => void) | undefined;

        intindraw(canvasRef.current, roomid, WebSocket, tool).then(({ cleanup: c, addText }) => {
            cleanup = c;
            addTextFn.current = addText;
        });

        return () => { cleanup?.(); };
    }, [roomid, WebSocket]);

    // ── Handle canvas click for text tool ──
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool.current !== "text") return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        // screen position for the React overlay
        setTextValue("");
        setTextOverlay({ x: e.clientX, y: e.clientY, canvasX, canvasY });
    };

    const commitText = () => {
        if (textOverlay && textValue.trim() && addTextFn.current) {
            addTextFn.current(textOverlay.canvasX, textOverlay.canvasY, textValue, fontSize);
        }
        setTextOverlay(null);
        setTextValue("");
    };

    const cancelText = () => { setTextOverlay(null); setTextValue(""); };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); }
        if (e.key === "Escape") { cancelText(); }
    };

    // ── Tool change ──
    const toolchange = (t: string) => {
        setHighlight(t);
        tool.current = t;
        if (textOverlay) cancelText();
    };

    const leave = () => {
        WebSocket.send(JSON.stringify({ type: "leave_room", roomId: roomid }));
        WebSocket.close();
        router.push("/Dashboard");
    };

    const tools = [
        { id: "rec",    icon: <LuRectangleHorizontal className="w-[18px] h-[18px]" />, label: "Rectangle" },
        { id: "circle", icon: <LuCircle className="w-[18px] h-[18px]" />,              label: "Circle" },
        { id: "arrow",  icon: <BiSolidArrowFromBottom className="w-[18px] h-[18px]" />, label: "Arrow" },
        { id: "text",   icon: <RiText className="w-[18px] h-[18px]" />,                label: "Text — click canvas to place" },
        { id: "select", icon: <FaRegHand className="w-[18px] h-[18px]" />,             label: "Move / Resize" },
        { id: "erase",  icon: <RxEraser className="w-[18px] h-[18px]" />,              label: "Erase — click a shape" },
    ];

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
            {/* Dark dot-grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }}
            />

            {/* ── Toolbar ── */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                <div className="relative flex items-center gap-0.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-3 py-2 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

                    <span className="font-serif text-sm text-white/50 pr-3 border-r border-white/10 mr-1 tracking-tight select-none">
                        Doodle<span className="italic" style={{ color: "#a855f7" }}>Board</span>
                    </span>

                    <span className="text-xs text-white/25 font-mono px-2 border-r border-white/10 mr-1 select-none">
                        {slug || roomid}
                    </span>

                    <span className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/25 rounded-full px-2 py-0.5 mr-2 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
                        <span className="text-[10px] text-purple-300 font-sans">Live</span>
                    </span>

                    <div className="w-px h-5 bg-white/10 mx-1" />

                    {tools.map(t => (
                        <button
                            key={t.id}
                            title={t.label}
                            onClick={() => toolchange(t.id)}
                            className={`p-2 rounded-xl transition-all duration-150 cursor-pointer
                                ${highlight === t.id
                                    ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                                    : "text-white/40 hover:bg-white/5 hover:text-white/80"}`}
                        >
                            {t.icon}
                        </button>
                    ))}

                    <div className="w-px h-5 bg-white/10 mx-1" />

                    <button
                        title="Leave room"
                        onClick={leave}
                        className="p-2 rounded-xl text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 cursor-pointer"
                    >
                        <RxExit className="w-[18px] h-[18px]" />
                    </button>
                </div>

                {/* Font-size row — only shown when text tool active */}
                {highlight === "text" && !textOverlay && (
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] px-4 py-2">
                        <span className="text-[11px] text-white/30 font-sans select-none">Font size</span>
                        <input
                            type="range" min={10} max={96} step={2}
                            value={fontSize}
                            onChange={e => setFontSize(Number(e.target.value))}
                            className="w-28 accent-purple-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-purple-400 w-7 select-none">{fontSize}</span>
                        {[14, 20, 32, 56].map(s => (
                            <button key={s} onClick={() => setFontSize(s)}
                                className={`text-xs px-2 py-0.5 rounded-lg cursor-pointer transition-colors duration-150
                                    ${fontSize === s ? "bg-purple-500/20 text-purple-300" : "text-white/30 hover:text-white/70 hover:bg-white/5"}`}>
                                {s}
                            </button>
                        ))}
                        <span className="text-[10px] text-white/20 font-sans select-none ml-1">· Click canvas to place</span>
                    </div>
                )}
            </div>

            {/* ── Canvas ── */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ cursor: highlight === "text" ? "text" : highlight === "erase" || highlight === "arrow" ? "crosshair" : "default" }}
                onClick={handleCanvasClick}
            />

            {/* ── Text overlay (React-controlled, rendered in normal DOM) ── */}
            {textOverlay && (
                <div
                    className="fixed z-50 flex flex-col gap-2"
                    style={{ left: textOverlay.x, top: textOverlay.y }}
                >
                    <textarea
                        autoFocus
                        rows={2}
                        value={textValue}
                        onChange={e => setTextValue(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        placeholder="Type… Enter to place"
                        className="min-w-[160px] rounded-lg border border-purple-500/60 bg-black/80 text-white placeholder:text-white/30 outline-none px-3 py-2 resize-none backdrop-blur-sm"
                        style={{ fontSize: `${Math.min(fontSize, 32)}px`, fontFamily: "var(--font-kalam), Kalam, cursive", lineHeight: 1.3 }}
                    />
                    <div className="flex items-center gap-2 text-[11px] text-white/40 font-sans select-none">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Enter</kbd> place
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Shift+↵</kbd> new line
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Esc</kbd> cancel
                        <button onClick={commitText} className="ml-auto px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 hover:bg-purple-500/50 cursor-pointer transition-colors">Place</button>
                    </div>
                </div>
            )}
        </div>
    );
}
