"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, [pathname]); // Re-check on route change

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/signin");
    };

    return (
        <header className="w-full fixed top-0 left-0 z-50 glass-panel border-b border-[var(--glass-border)] bg-[var(--card-bg)] backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 hover:opacity-80 transition-opacity">
                    ExcaliChat
                </Link>

                <nav className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <span className="text-sm text-gray-400 hidden sm:block">Welcome back</span>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signin">
                                <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/signup">
                                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                                    Sign Up
                                </button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
