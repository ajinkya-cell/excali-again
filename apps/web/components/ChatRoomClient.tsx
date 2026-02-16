
"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";

interface Message {
    message: string;
    userId?: number;
    id?: number;
}

export function ChatRoomClient({
    messages,
    id
}: {
    messages: Message[];
    id: string | number
}) {
    const [chats, setChats] = useState<Message[]>(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const {socket, loading} = useSocket();
    const [userId, setUserId] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch current user ID to distinguish messages
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`${BACKEND_URL}/verify-token`, {
                headers: { "Authorization": token }
            }).then(res => {
                setUserId(res.data.userId);
            }).catch(e => console.error(e));
        }
    }, []);

    useEffect(() => {
        if (socket && !loading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, {
                        message: parsedData.message,
                        userId: parsedData.userId
                    }])
                }
            }
        }
    }, [socket, loading, id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-black/5 relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                {chats.map((m, index) => {
                    const isMe = userId && m.userId === userId;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words
                                ${isMe 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : 'bg-[var(--card-bg)] border border-[var(--glass-border)] text-gray-200 rounded-bl-none'}
                            `}>
                                {m.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="absolute bottom-0 w-full p-4 glass-panel border-t border-[var(--glass-border)]">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <input 
                        type="text" 
                        value={currentMessage} 
                        onChange={e => setCurrentMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && currentMessage.trim()) {
                                socket?.send(JSON.stringify({
                                    type: "chat",
                                    roomId: id,
                                    message: currentMessage
                                }));
                                setCurrentMessage("");
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 glass-input rounded-xl px-4 py-3 placeholder-gray-500"
                    />
                    <button 
                        onClick={() => {
                            if (!currentMessage.trim()) return;
                            socket?.send(JSON.stringify({
                                type: "chat",
                                roomId: id,
                                message: currentMessage
                            }));
                            setCurrentMessage("");
                        }}
                        className="btn-primary rounded-xl px-6 py-3 font-medium shadow-lg hover:shadow-indigo-500/20"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}