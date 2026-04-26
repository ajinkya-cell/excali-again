"use client"

import { motion } from "motion/react"

// Simulated canvas shapes that float and animate
const shapes = [
  { id: 1, type: "rect",   x: "8%",   y: "12%",  w: 140, h: 80,  rx: 12, stroke: "#c084fc", delay: 0 },
  { id: 2, type: "rect",   x: "62%",  y: "8%",   w: 110, h: 60,  rx: 8,  stroke: "#f472b6", delay: 0.3 },
  { id: 3, type: "circle", x: "78%",  y: "55%",  r: 44,          stroke: "#a855f7", delay: 0.6 },
  { id: 4, type: "circle", x: "18%",  y: "60%",  r: 30,          stroke: "#e879f9", delay: 0.2 },
  { id: 5, type: "rect",   x: "38%",  y: "70%",  w: 160, h: 50,  rx: 6,  stroke: "#d946ef", delay: 0.8 },
  { id: 6, type: "rect",   x: "50%",  y: "22%",  w: 90,  h: 90,  rx: 16, stroke: "#c026d3", delay: 0.5 },
]

const connectors = [
  { x1: "15%", y1: "22%", x2: "50%", y2: "27%" },
  { x1: "68%", y1: "18%", x2: "78%", y2: "55%" },
  { x1: "18%", y1: "62%", x2: "38%", y2: "72%" },
]

const labels = [
  { x: "8%",  y: "5%",  text: "Hero section",    delay: 0.4 },
  { x: "62%", y: "2%",  text: "Navbar",           delay: 0.7 },
  { x: "35%", y: "65%", text: "CTA button",       delay: 1.0 },
  { x: "72%", y: "49%", text: "Avatar",           delay: 0.9 },
]

const cursors = [
  { x: "35%", y: "38%", initials: "AJ", color: "#a855f7", delay: 0 },
  { x: "60%", y: "62%", initials: "RM", color: "#f472b6", delay: 1.2 },
]

export function CanvasPreview() {
  return (
    <div className="relative w-full max-w-3xl mx-auto h-[380px] md:h-[440px]">
      {/* Canvas card */}
      <div className="absolute inset-0 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden shadow-[0_32px_80px_0_rgba(0,0,0,0.6)]">
        {/* Subtle grid inside canvas */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.25) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* Top bar of canvas app */}
        <div className="absolute top-0 inset-x-0 h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="mx-auto text-xs text-white/30 font-mono">doodleboard — untitled canvas</div>
          {/* Live badge */}
          <div className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-300">Live</span>
          </div>
        </div>

        {/* SVG canvas contents */}
        <svg className="absolute inset-0 w-full h-full pt-10" xmlns="http://www.w3.org/2000/svg">
          {/* Connector lines */}
          {connectors.map((c, i) => (
            <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          ))}

          {/* Shapes */}
          {shapes.map((s) =>
            s.type === "rect" ? (
              <motion.rect
                key={s.id}
                x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx}
                fill="rgba(168,85,247,0.05)"
                stroke={s.stroke}
                strokeWidth="1.5"
                strokeOpacity="0.6"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: s.delay, duration: 0.6, ease: "easeOut" }}
              />
            ) : (
              <motion.circle
                key={s.id}
                cx={s.x} cy={s.y} r={s.r}
                fill="rgba(232,121,249,0.06)"
                stroke={s.stroke}
                strokeWidth="1.5"
                strokeOpacity="0.6"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: s.delay, duration: 0.6, ease: "easeOut" }}
              />
            )
          )}
        </svg>

        {/* Floating labels */}
        {labels.map((l) => (
          <motion.div
            key={l.text}
            className="absolute text-[10px] font-mono text-purple-300/70 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5"
            style={{ left: l.x, top: l.y }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: l.delay, duration: 0.5 }}
          >
            {l.text}
          </motion.div>
        ))}

        {/* Cursors */}
        {cursors.map((c) => (
          <motion.div
            key={c.initials}
            className="absolute flex flex-col items-start gap-1"
            style={{ left: c.x, top: c.y }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: c.delay + 1, duration: 0.4 }}
          >
            {/* SVG cursor */}
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path d="M0 0L0 14L4 10L7 17L9 16L6 9L11 9L0 0Z" fill={c.color} />
            </svg>
            <div
              className="text-[10px] font-sans font-medium text-white px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: c.color + "cc" }}
            >
              {c.initials}
            </div>
          </motion.div>
        ))}

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Glow under card */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-purple-600/20 blur-2xl rounded-full" />
    </div>
  )
}
