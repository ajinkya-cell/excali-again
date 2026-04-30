"use client"

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react"
import doodle from "../assets/doodle.png"
import { FaGithub } from "react-icons/fa";
import { SlSocialTwitter } from "react-icons/sl";
import { TbBrandLinkedin } from "react-icons/tb";
import { useRouter } from "next/navigation";
import axios from "axios";
import { http } from "@/components/endpoints";
import { CanvasPreview } from "@/components/CanvasPreview";

export default function Home() {
    const router = useRouter()

    const startBoard = async () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const res = await axios.get(http + "/verify-token", {
                    headers: { Authorization: token }
                })
                const id = res.data.userId;
                if (id) {
                    const Roomres = await axios.get(`${http}/userRooms/${id}`)
                    const rooms = Roomres.data.data
                    const lastroom = rooms[rooms.length - 1];
                    const roomidres = await axios.get(`${http}/room/${lastroom.slug}`)
                    const roomid = roomidres.data.id
                    router.push(`/canvas/${roomid}`);
                }
            } catch (e) {
                console.log(e)
            }
        } else {
            router.push("/Signin")
        }
    }

    return (
        <div
            className="relative min-h-screen bg-black overflow-x-hidden"
            style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '28px 28px'
            }}
        >
            {/* Ambient blobs */}
            <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed top-[30%] right-[-10%] w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 left-[30%] w-[500px] h-[300px] bg-fuchsia-700/10 rounded-full blur-[100px] pointer-events-none" />

            {/* ── Navbar ── */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl">
                <div className="relative rounded-full bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl px-6 py-3 flex items-center justify-between overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

                    {/* Brand */}
                    <div className="relative z-10 font-serif text-xl tracking-tight text-white">
                        Doodle<span className="italic" style={{ color: '#c084fc' }}>Board</span>
                    </div>

                    {/* Nav links */}
                    <div className="relative z-10 hidden md:flex items-center gap-10 text-sm text-white/60">
                        <Link href="/" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.9)] transition-all duration-300">Home</Link>
                        <Link href="/Dashboard" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.9)] transition-all duration-300">Dashboard</Link>
                        <Link href="/" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.9)] transition-all duration-300">About</Link>
                    </div>

                    {/* CTA */}
                    <div className="relative z-10">
                        <Link href="/Signup">
                            <button className="h-9 px-5 rounded-full text-sm font-sans font-medium text-white
                                bg-gradient-to-r from-purple-600 to-pink-600
                                hover:from-purple-500 hover:to-pink-500
                                shadow-[0_0_16px_rgba(168,85,247,0.4)]
                                hover:shadow-[0_0_24px_rgba(168,85,247,0.6)]
                                transition-all duration-300 cursor-pointer">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Hero ── */}
            <section className="relative flex flex-col items-center justify-center text-center px-4 pt-40 pb-20">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-xs text-purple-300 font-sans tracking-wide">Real-time collaborative canvas</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-tight text-white max-w-4xl"
                >
                    Sketch, share, and{" "}
                    <span className="italic" style={{ color: '#c084fc' }}>build together</span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25 }}
                    className="mt-5 font-sans text-[clamp(0.9rem,1.8vw,1.2rem)] text-white/50 max-w-xl"
                >
                    A live collaborative whiteboard where your team can draw, annotate, and think simultaneously — no friction, just flow.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-10 flex flex-col sm:flex-row items-center gap-4"
                >
                    <button
                        onClick={startBoard}
                        className="h-12 px-8 rounded-xl font-sans text-base font-medium text-white cursor-pointer
                            bg-gradient-to-r from-purple-600 to-pink-600
                            hover:from-purple-500 hover:to-pink-500
                            shadow-[0_0_28px_rgba(168,85,247,0.4)]
                            hover:shadow-[0_0_44px_rgba(168,85,247,0.6)]
                            transition-all duration-300"
                    >
                        Open your canvas →
                    </button>
                    <Link href="/Signup">
                        <button className="h-12 px-8 rounded-xl font-sans text-base font-medium text-white/70 cursor-pointer
                            border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white
                            backdrop-blur-sm transition-all duration-300">
                            Create account
                        </button>
                    </Link>
                </motion.div>

                {/* Canvas preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.6 }}
                    className="mt-20 w-full max-w-4xl px-4"
                >
                    <CanvasPreview />
                </motion.div>
            </section>

            {/* ── Features strip ── */}
            <section className="relative px-4 pb-24 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: "✦", title: "Real-time sync", desc: "Every stroke appears instantly for every collaborator in the room." },
                        { icon: "◈", title: "Infinite canvas", desc: "Pan, zoom, and draw without ever hitting a wall. Space is unlimited." },
                        { icon: "⬡", title: "Shareable rooms", desc: "One link — everyone joins and starts drawing immediately." },
                    ].map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                            className="relative rounded-2xl bg-white/[0.02] border border-white/8 p-6 overflow-hidden group hover:border-purple-500/30 transition-colors duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="text-2xl mb-3" style={{ color: '#c084fc' }}>{f.icon}</div>
                            <h3 className="font-serif text-white text-lg mb-2">{f.title}</h3>
                            <p className="font-sans text-white/40 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="font-serif text-xl text-white/80">
                        Doodle<span className="italic" style={{ color: '#c084fc' }}>Board</span>
                    </div>
                    <p className="font-sans text-white/30 text-sm">Made by Ajinkya</p>
                    <div className="flex items-center gap-5">
                        <Link href="https://github.com/ajinkya-cell" target="_blank" rel="noopener noreferrer">
                            <FaGithub className="text-white/40 hover:text-white w-5 h-5 transition-colors duration-200" />
                        </Link>
                        <Link href="https://x.com/ajinkyacell" target="_blank" rel="noopener noreferrer">
                            <SlSocialTwitter className="text-white/40 hover:text-white w-5 h-5 transition-colors duration-200" />
                        </Link>
                        <Link href="https://www.linkedin.com/in/ajinkya-dharkar-a844b1258/" target="_blank" rel="noopener noreferrer">
                            <TbBrandLinkedin className="text-white/40 hover:text-white w-5 h-5 transition-colors duration-200" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
