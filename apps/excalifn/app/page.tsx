"use client"

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react"
import picture from "../assets/Playboard.svg"
import doodle from "../assets/doodle.png"
import { FaGithub } from "react-icons/fa";
import { SlSocialTwitter } from "react-icons/sl";
import { TbBrandLinkedin } from "react-icons/tb";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { http } from "@/components/endpoints";


export default function Home(){
    const router = useRouter()
    const parent = {
        initial: { opacity: 1 },
        visible: {
            transition: {
                staggerChildren: 0.2,
            }
        }
    }

    const child = {
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 1
            }
        },
        initial: {
            y: 50,
            opacity: 0
        }
    }

    const startBoard = async () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            const res = await axios.get(http + "/verify-token", {
                headers: {
                    Authorization: token
                }
            })
            const id = res.data.userId;
            if (id) {
                try {
                    const Roomres = await axios.get(`${http}/userRooms/${id}`)
                    const rooms = Roomres.data.data
                    const lastroom = rooms[rooms.length - 1];
                    const roomidres = await axios.get(`${http}/room/${lastroom.slug}`)
                    const roomid = roomidres.data.id
                    router.push(`/canvas/${roomid}`);
                } catch (e) {
                    console.log(e)
                }
            }
        } else {
            router.push("/Signin")
        }
    }

    return <>
        {/* Dot-grid black background */}
        <div
            className="absolute -z-20 w-full h-[100rem] bg-black"
            style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '28px 28px'
            }}
        ></div>

        {/* Floating Glass Navbar */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl">
            <div className="relative rounded-2xl md:rounded-full bg-white/[0.02] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-2xl px-4 md:px-8 py-3 flex flex-col md:flex-row items-center gap-4 justify-between overflow-hidden">
                {/* Top glare */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                {/* Aurora glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none opacity-50"></div>

                {/* Logo */}
                <div className="relative z-10">
                   DoodleBoard
                </div>

                {/* Nav links */}
                <div className="relative z-10 hidden md:flex items-center gap-20 text-sm text-white/70">
                    <Link href="/" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-300">Home</Link>
                    <Link href="/Dashboard" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-300">Product</Link>
                    <Link href="/" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-300">About</Link>
                </div>

                {/* CTA */}
                <div className="relative z-10">
                    <Link href="/Signup">
                        <Button btnscale={true} btnsize="small" prop="blue" content="SignUp" />
                    </Link>
                </div>
            </div>
        </div>

        {/* Main content */}
        <div className="w-full h-[1000px] md:h-[1701px] flex flex-col items-center justify-between pt-24">
            <div className="flex flex-col items-center justify-between">
                <motion.div
                    variants={parent}
                    initial="initial"
                    animate="visible"
                >
                    <motion.div className="mt-30 flex flex-col items-center">
                        <motion.h1 variants={child} className="text-[clamp(1.5rem,2.604vw,3rem)] flex-wrap font-serif font-bold relative z-10">Sketch, Share, and Build Together</motion.h1>
                        <motion.h2 variants={child} className="font-sans text-[clamp(0.8rem,2.604vw,1.25rem)]">Collaborate live on the same canvas with anyone</motion.h2>
                    </motion.div>
                    <motion.div variants={child} className="mt-10 flex z-10 flex-col items-center">
                        <Button btnscale={true} btnsize="medium" btnfunction={() => startBoard()} prop="pink" content="Start board" />
                    </motion.div>
                    <motion.div
                        variants={child}
                        className="relative -z-10"
                    >
                        <Image className="relative z-10 mask-b-from-20% mask-b-to-80%" alt="online sketchboard image" src={picture} priority />
                    </motion.div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="w-full h-[250px] bg-black flex items-center justify-center">
                <div className="w-[1280px] h-[56px] mt-4 flex items-center justify-between px-2">
                    <div className="w-[120px] drop-shadow-md">
                        <Image src={doodle} alt="Playboard logo" className="h-8 w-auto" />
                    </div>
                    <div className="opacity-50 text-sm">Made by Avi</div>
                    <div className="w-[100px] md:w-[160px] drop-shadow-md flex items-center justify-between">
                        <Link href="https://github.com/adi-ty-a" target="_blank" rel="noopener noreferrer">
                            <FaGithub className="text-white w-6 h-6 sm:w-10 sm:h-10" />
                        </Link>
                        <Link href="https://x.com/avi_0t" target="_blank" rel="noopener noreferrer">
                            <SlSocialTwitter className="text-white w-6 h-6 sm:w-10 sm:h-10" />
                        </Link>
                        <Link href="https://www.linkedin.com/in/aditya-srivastava-662829317/" target="_blank" rel="noopener noreferrer">
                            <TbBrandLinkedin className="text-white w-6 h-6 sm:w-10 sm:h-10" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </>
}
