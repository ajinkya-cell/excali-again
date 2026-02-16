"use client";

import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center relative overflow-hidden p-6">
            <div className="z-10 w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-2 text-white">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">
                        Sign in to continue your conversations
                    </p>
                </div>

                <div className="glass-panel rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/5">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                            <input 
                                type="text" 
                                placeholder="name@example.com" 
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-gray-600"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-gray-600"
                            />
                        </div>

                        <button 
                            onClick={async () => {
                                try {
                                    const res = await axios.post(`${BACKEND_URL}/signIn`, {
                                        email,
                                        password
                                    });
                                    
                                    localStorage.setItem("token", res.data.token);
                                    router.push("/");
                                } catch(e) {
                                    console.error("Signin error:", e);
                                    alert("Sign in failed");
                                }
                            }}
                            className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"
                        >
                            Sign In
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account? 
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium ml-1 transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
