"use client"
import Link from "next/link";
import { Button } from "@/components/Button";
import { useForm, SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation";
import axios from "axios";
import { http } from "@/components/endpoints";

type m = {
  origin: string;
  code: string;
  minimum?: number;
  inclusive?: boolean;
  path: string[];
  message: string;
};

export default function Signup() {
  const router = useRouter()

  type form = {
    email: string,
    password: string,
    username: string
  }

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<form>();
  const onsubmit: SubmitHandler<form> = async (data) => {
    try {
      const response = await axios.post(http + "/signUp", {
        username: data.username,
        password: data.password,
        email: data.email
      })
      if (response.data.msg == 'signedup') {
        router.push('/Signin')
        console.log("account created")
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msgs = err.response?.data?.msg?.message[0].path;
        console.log(msgs)
        if (Array.isArray(msgs)) {
          msgs.forEach((m: m) => {
            setError(m.path[0] as "username" | "email" | "password", {
              message: m.message,
            });
          });
        }
      } else {
        console.error(err);
      }
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
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_32px_80px_0_rgba(0,0,0,0.5)] p-8 overflow-hidden">
          {/* Top glare */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-400/40 to-transparent" />
          {/* Card inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />

          <div className="relative z-10">
            {/* Brand */}
            <div className="mb-8 text-center">
              <h1 className="font-serif text-4xl tracking-tight text-white">
                Doodle<span className="italic" style={{ color: '#c084fc' }}>Board</span>
              </h1>
              <p className="mt-2 text-white/40 text-sm font-sans">Create your account and start drawing</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-sans uppercase tracking-widest">Name</label>
                <input
                  {...register("username", {
                    required: "Name is required",
                    minLength: { value: 5, message: "At least 5 characters" }
                  })}
                  placeholder="Your name"
                  className="h-11 bg-white/5 border border-white/10 px-4 text-white text-sm w-full rounded-xl placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all duration-200"
                  type="text"
                />
                {errors.username && <p className="text-pink-400 text-xs mt-0.5">{errors.username.message}</p>}
              </div>

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
                  bg-gradient-to-r from-pink-600 to-purple-600
                  hover:from-pink-500 hover:to-purple-500
                  shadow-[0_0_24px_rgba(236,72,153,0.3)]
                  hover:shadow-[0_0_36px_rgba(236,72,153,0.5)]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-white/40 text-sm font-sans">
              Already have an account?{" "}
              <Link href="/Signin" className="text-purple-400 hover:text-pink-400 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}