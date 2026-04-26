"use client"
import { Card } from "@/components/Cards";
import { http } from "@/components/endpoints";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [input, setinput] = useState("");
  const router = useRouter()
  const [disable, setdisable] = useState(false);
  const [loading, setloading] = useState(true);
  const [rooms, setrooms] = useState<null | { slug: string }[]>(null)
  const [userid, setuserid] = useState<number | null>(null)
  const [newerror, seterror] = useState<null | string>(null)

  useEffect(() => {
    const checkauth = async () => {
      const token = localStorage.getItem("jwtToken")
      if (!token) { router.push('/Signin'); return; }
      try {
        const res = await axios.get(http + "/verify-token", {
          headers: { Authorization: token },
        });
        const resid = res.data.userId
        setuserid(resid)
        setloading(false)
        if (resid !== null) {
          const roomres = await axios.get(`${http}/userRooms/${resid}`)
          if (roomres) setrooms(roomres.data.data);
        }
      } catch (e) {
        localStorage.removeItem("jwtToken");
        router.push("/")
        console.log(e)
      }
    }
    checkauth()
  }, [router])

  const Createroom = async () => {
    seterror(null);
    setdisable(true);
    try {
      const slugifiedInput = input.trim().replace(/\s+/g, "-");
      const response = await axios.post(http + "/create-room", { name: slugifiedInput }, {
        headers: { Authorization: localStorage.getItem("jwtToken") }
      });
      if (response.status === 200) {
        setdisable(false);
        router.push(`/canvas/${response.data}`)
      }
    } catch (e) {
      setdisable(false);
      console.log(e);
    }
  }

  const Joinroom = async (value?: string) => {
    seterror(null);
    setdisable(true);
    try {
      const responsed = value !== undefined
        ? await axios.get(`${http}/room/${value}`)
        : await axios.get(`${http}/room/${input}`)
      if (responsed.data) {
        setdisable(false);
        setrooms(null)
        router.push(`/canvas/${responsed.data.id}`)
      }
    } catch (e) {
      setdisable(false);
      if (axios.isAxiosError(e)) {
        seterror(e.response?.data?.msg || "Room not found");
      } else {
        console.error(e);
      }
    }
  }

  const deleteroom = async (slug: string) => {
    await axios.get(`${http}/closeroom/${slug}`);
    const roomres = await axios.get(`${http}/userRooms/${userid}`)
    if (roomres) setrooms(roomres.data.data);
  }

  const logout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/Signin")
  }

  return (
    <div
      className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}
    >
      {/* Ambient blobs */}
      <div className="fixed top-[-15%] left-[-10%] w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl">
        <div className="relative rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl px-6 py-3 flex items-center justify-between overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
          <span className="relative z-10 font-serif text-xl text-white tracking-tight">
            Doodle<span className="italic" style={{ color: '#c084fc' }}>Board</span>
          </span>
          <span className="relative z-10 text-white/40 text-sm font-sans hidden md:block">Your boards</span>
          <button
            onClick={logout}
            className="relative z-10 h-8 px-4 rounded-full text-xs font-sans font-medium text-white/70 border border-white/10 hover:border-pink-500/40 hover:text-white bg-white/[0.03] hover:bg-pink-500/10 transition-all duration-300 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-lg mx-4 mt-4">
        <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_32px_80px_0_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

          <div className="relative z-10 p-8">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500/40 border-t-purple-400 animate-spin" />
                <p className="text-white/40 text-sm font-sans">Checking authentication…</p>
              </div>
            ) : (
              <>
                {/* Input + buttons */}
                <div className="flex flex-col gap-3">
                  <label className="text-white/50 text-xs font-sans uppercase tracking-widest">Room name</label>
                  <input
                    placeholder="e.g. my-design-sprint"
                    onChange={(e) => setinput(e.target.value)}
                    className="h-11 bg-white/5 border border-white/10 px-4 text-white text-sm w-full rounded-xl placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors duration-200"
                    type="text"
                  />
                  <div className="flex gap-3 mt-1">
                    <button
                      disabled={disable}
                      onClick={Createroom}
                      className="flex-1 h-10 rounded-xl text-sm font-sans font-medium text-white cursor-pointer
                        bg-gradient-to-r from-purple-600 to-pink-600
                        hover:from-purple-500 hover:to-pink-500
                        shadow-[0_0_20px_rgba(168,85,247,0.3)]
                        hover:shadow-[0_0_32px_rgba(168,85,247,0.5)]
                        disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {disable ? "…" : "Create room"}
                    </button>
                    <button
                      disabled={disable}
                      onClick={() => Joinroom()}
                      className="flex-1 h-10 rounded-xl text-sm font-sans font-medium text-white/70 cursor-pointer
                        border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:text-white
                        disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {disable ? "…" : "Join room"}
                    </button>
                  </div>
                  {newerror && (
                    <p className="text-pink-400 text-xs font-mono mt-1">{newerror}</p>
                  )}
                </div>

                {/* Previous rooms */}
                <div className="mt-7">
                  <p className="text-white/30 text-xs font-sans uppercase tracking-widest mb-3">Previous rooms</p>
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {rooms === null || rooms.length === 0 ? (
                      <div className="text-white/20 text-sm font-sans text-center py-8">No rooms yet</div>
                    ) : rooms.map((e: { slug: string }) => (
                      <Card key={e.slug} roomname={e.slug} joinfuntion={() => Joinroom(e.slug)} deleterm={() => deleteroom(e.slug)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}