"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "./config";
import axios from "axios";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center relative overflow-hidden p-6">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
            ExcaliChat
          </h1>
          <p className="text-gray-400 text-lg">
            Connect instantly. Chat securely.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/5">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Start a conversation
            </label>
            <input 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)} 
              type="text" 
              placeholder="Enter room name..." 
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-gray-500"
            />
            
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => router.push(`/rooms/${roomId}`)}
                disabled={!roomId}
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"
              >
                Join Room
              </button>

              <button 
                onClick={async () => {
                    if (!roomId) return;
                    try {
                        const token = localStorage.getItem("token");
                        if (!token) {
                            router.push("/signin");
                            return;
                        }
                        await axios.post(`${BACKEND_URL}/create-room`, {
                            name: roomId
                        }, {
                            headers: { "Authorization": token }
                        });
                        router.push(`/rooms/${roomId}`);
                    } catch(e) {
                         if (axios.isAxiosError(e) && e.response?.status === 409) {
                             router.push(`/rooms/${roomId}`);
                         } else if (axios.isAxiosError(e) && e.response?.status === 400) {
                             alert("Invalid room name");
                         } else if (axios.isAxiosError(e) && e.response?.status === 403) {
                             localStorage.removeItem("token");
                             router.push("/signin"); 
                         } else {
                             console.error(e);
                             alert("Error creating room");
                         }
                    }
                }}
                disabled={!roomId}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all active:scale-[0.98]"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
           Enter a unique room name to get started. 
           <br/> No account needed to join.
        </p>
      </div>
    </div>
  );
}
