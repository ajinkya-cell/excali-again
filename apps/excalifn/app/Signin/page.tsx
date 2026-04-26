"use client"
import Link from "next/link";
import { Button } from "@/components/Button";
import { useForm, SubmitHandler } from "react-hook-form"
import axios from "axios";
import { useRouter } from "next/navigation";
import { http } from "@/components/endpoints";

export default function Signin() {
  const router = useRouter()

  type form = {
    email: string,
    password: string
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<form>();
  const onsubmit: SubmitHandler<form> = async (data) => {
    try {
      const response = await axios.post(http + "/signIn", {
        password: data.password,
        email: data.email
      })
      if (response.data.msg = "logged in") {
        localStorage.setItem('jwtToken', response.data.token);
        router.push('/Dashboard')
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      className="w-full min-h-screen bg-black flex items-center justify-center"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}
    >
      {/* Ambient glow blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_32px_80px_0_rgba(0,0,0,0.5)] p-8 overflow-hidden">
          {/* Top glare */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
          {/* Card inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

          <div className="relative z-10">
            {/* Brand */}
            <div className="mb-8 text-center">
              <h1 className="font-serif text-4xl tracking-tight text-white">
                Doodle<span className="italic" style={{ color: '#c084fc' }}>Board</span>
              </h1>
              <p className="mt-2 text-white/40 text-sm font-sans">Welcome back — sign in to your canvas</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-sans uppercase tracking-widest">Email Address</label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="you@example.com"
                  className="h-11 bg-white/5 border border-white/10 px-4 text-white text-sm w-full rounded-xl placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all duration-200"
                  type="text"
                />
                {errors.email && <p className="text-pink-400 text-xs mt-0.5">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-sans uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                  className="h-11 bg-white/5 border border-white/10 px-4 text-white text-sm w-full rounded-xl placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all duration-200"
                />
                {errors.password && <p className="text-pink-400 text-xs mt-0.5">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-11 w-full rounded-xl font-sans text-sm font-medium text-white transition-all duration-300 cursor-pointer
                  bg-gradient-to-r from-purple-600 to-pink-600
                  hover:from-purple-500 hover:to-pink-500
                  shadow-[0_0_24px_rgba(168,85,247,0.3)]
                  hover:shadow-[0_0_36px_rgba(168,85,247,0.5)]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-white/40 text-sm font-sans">
              No account yet?{" "}
              <Link href="/Signup" className="text-purple-400 hover:text-pink-400 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}