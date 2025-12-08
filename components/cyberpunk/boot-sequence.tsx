"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { cyberAudio } from "@/lib/audio/audio-context"

interface BootSequenceProps {
  onComplete: () => void
  isReturningUser?: boolean
}

const bootMessages = [
  { text: "INITIALIZING NEURAL INTERFACE...", delay: 0, type: "system" },
  { text: "LOADING SECURITY PROTOCOLS...", delay: 400, type: "security" },
  { text: "ESTABLISHING ENCRYPTED CONNECTION...", delay: 800, type: "network" },
  { text: "AUTHENTICATING QUANTUM SIGNATURE...", delay: 1200, type: "auth", glitch: true },
  { text: "SYNCING BIOMETRIC DATA...", delay: 1600, type: "biometric" },
  { text: "COMPILING ACCESS MATRICES...", delay: 2000, type: "compile" },
  { text: "VERIFYING NEURAL HANDSHAKE...", delay: 2400, type: "verify", glitch: true },
  { text: "SYSTEM ONLINE", delay: 2800, type: "success" },
]

const microBootMessages = [
  { text: "RESUMING SESSION...", delay: 0, type: "system" },
  { text: "SYSTEM READY", delay: 400, type: "success" },
]

export function BootSequence({ onComplete, isReturningUser = false }: BootSequenceProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessages, setCurrentMessages] = useState<typeof bootMessages>([])
  const [showGlitch, setShowGlitch] = useState(false)
  const [complete, setComplete] = useState(false)
  const [hexData, setHexData] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const messages = isReturningUser ? microBootMessages : bootMessages
  const totalDuration = isReturningUser ? 800 : 3200

  // Generate random hex data for visual effect
  useEffect(() => {
    const generateHex = () => {
      const hex = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase(),
      ).join(" ")
      return hex
    }

    const interval = setInterval(() => {
      setHexData((prev) => {
        const newData = [...prev, generateHex()]
        return newData.slice(-6)
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  // Matrix rain effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF"
    const fontSize = 14
    const columns = canvas.width / fontSize
    const drops: number[] = Array(Math.floor(columns)).fill(1)

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 20, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#00FFFF"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.1})`
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    cyberAudio.init().then(() => {
      cyberAudio.play("boot")
    })

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (totalDuration / 50)
        return Math.min(next, 100)
      })
    }, 50)

    messages.forEach((msg) => {
      setTimeout(() => {
        setCurrentMessages((prev) => [...prev, msg])
        if (msg.glitch) {
          setShowGlitch(true)
          cyberAudio.play("glitch")
          setTimeout(() => setShowGlitch(false), 150)
        }
      }, msg.delay)
    })

    const completeTimeout = setTimeout(() => {
      setComplete(true)
      cyberAudio.play("success")
      setTimeout(onComplete, 500)
    }, totalDuration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete, messages, totalDuration])

  return (
    <div
      className={cn(
        "fixed inset-0 bg-cyber-black z-[100] flex items-center justify-center overflow-hidden",
        "transition-opacity duration-500",
        complete && "opacity-0 pointer-events-none",
      )}
    >
      {/* Matrix rain background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-40" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Glitch overlay */}
      {showGlitch && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0 bg-cyber-cyan/20"
            style={{
              clipPath: `inset(${Math.random() * 40}% 0 ${Math.random() * 40}% 0)`,
              animation: "glitch 0.1s infinite",
            }}
          />
          <div
            className="absolute inset-0 bg-cyber-magenta/20"
            style={{
              clipPath: `inset(${Math.random() * 40}% 0 ${Math.random() * 40}% 0)`,
              transform: `translateX(${Math.random() * 20 - 10}px)`,
            }}
          />
          <div
            className="absolute inset-0 bg-cyber-red/10"
            style={{
              clipPath: `inset(${Math.random() * 50}% 0 ${Math.random() * 50}% 0)`,
              transform: `translateX(${Math.random() * -20 + 10}px)`,
            }}
          />
        </div>
      )}

      {/* HUD Frame corners */}
      <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-cyber-cyan/50" />
      <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-cyber-cyan/50" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-cyber-cyan/50" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-cyber-cyan/50" />

      {/* Main content */}
      <div className="relative w-full max-w-3xl px-4 sm:px-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-display uppercase tracking-[0.3em] text-cyber-cyan text-glow-cyan mb-2">
            CYBERAUTH
          </h1>
          <p className="text-xs sm:text-sm text-cyber-cyan/50 font-mono tracking-widest">
            NEURAL SECURITY SYSTEM v2.5.0
          </p>
        </div>

        {/* Terminal window */}
        <div className="glass-panel rounded overflow-hidden border border-cyber-cyan/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          {/* Terminal header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-cyber-black/80 border-b border-cyber-cyan/20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-cyber-red shadow-[0_0_8px_rgba(255,7,58,0.6)]" />
              <div className="w-3 h-3 rounded-full bg-cyber-yellow shadow-[0_0_8px_rgba(255,255,0,0.6)]" />
              <div className="w-3 h-3 rounded-full bg-cyber-green shadow-[0_0_8px_rgba(0,255,65,0.6)]" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-cyber-cyan/70 font-mono text-xs sm:text-sm">SECURE_TERMINAL :: BOOT_SEQUENCE</span>
            </div>
            <div className="text-cyber-green/70 font-mono text-xs animate-pulse">●&nbsp;LIVE</div>
          </div>

          {/* Terminal content */}
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-1.5 min-h-[280px] sm:min-h-[320px] bg-cyber-black/60">
            {/* Hex data stream */}
            <div className="mb-4 text-cyber-cyan/30 text-[10px] leading-tight overflow-hidden h-16">
              {hexData.map((hex, i) => (
                <div key={i} className="truncate">
                  {hex}
                </div>
              ))}
            </div>

            {/* Boot messages */}
            {currentMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className={cn("shrink-0", msg.type === "success" ? "text-cyber-green" : "text-cyber-cyan")}>
                  [{String(i).padStart(2, "0")}]
                </span>
                <span className="text-cyber-magenta/70 shrink-0">›</span>
                <span
                  className={cn(
                    msg.type === "success" ? "text-cyber-green font-bold text-glow-green" : "text-cyber-cyan",
                  )}
                >
                  {msg.text}
                  {i === currentMessages.length - 1 && (
                    <span className="inline-block w-2 h-4 bg-cyber-cyan ml-1 animate-pulse" />
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Progress section */}
          <div className="p-4 sm:p-6 bg-cyber-black/80 border-t border-cyber-cyan/20">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-cyber-cyan/70 mb-2 font-mono">
                <span>BOOT SEQUENCE PROGRESS</span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-cyber-black rounded overflow-hidden border border-cyber-cyan/30 relative">
                <div
                  className="h-full transition-all duration-100 relative"
                  style={{
                    width: `${progress}%`,
                    background:
                      progress < 33
                        ? "linear-gradient(90deg, var(--cyber-red), var(--cyber-red))"
                        : progress < 66
                          ? "linear-gradient(90deg, var(--cyber-yellow), var(--cyber-yellow))"
                          : "linear-gradient(90deg, var(--cyber-green), var(--cyber-cyan))",
                    boxShadow: progress >= 66 ? "0 0 20px rgba(0, 255, 65, 0.5)" : undefined,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
                {/* Progress markers */}
                <div className="absolute inset-0 flex">
                  {[25, 50, 75].map((mark) => (
                    <div
                      key={mark}
                      className="absolute top-0 bottom-0 w-px bg-cyber-cyan/30"
                      style={{ left: `${mark}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Telemetry data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div className="p-2 bg-cyber-black/50 rounded border border-cyber-cyan/20">
                <div className="text-cyber-cyan/50 uppercase tracking-wider text-[10px]">CPU Load</div>
                <div className="text-cyber-cyan font-display text-lg mt-1">
                  {Math.min(Math.round(progress * 0.85), 85)}%
                </div>
              </div>
              <div className="p-2 bg-cyber-black/50 rounded border border-cyber-cyan/20">
                <div className="text-cyber-cyan/50 uppercase tracking-wider text-[10px]">Memory</div>
                <div className="text-cyber-cyan font-display text-lg mt-1">
                  {Math.min(Math.round(progress * 12), 1024)}MB
                </div>
              </div>
              <div className="p-2 bg-cyber-black/50 rounded border border-cyber-cyan/20">
                <div className="text-cyber-cyan/50 uppercase tracking-wider text-[10px]">Packets</div>
                <div className="text-cyber-green font-display text-lg mt-1">{Math.round(progress * 47)}</div>
              </div>
              <div className="p-2 bg-cyber-black/50 rounded border border-cyber-cyan/20">
                <div className="text-cyber-cyan/50 uppercase tracking-wider text-[10px]">Latency</div>
                <div className="text-cyber-yellow font-display text-lg mt-1">
                  {Math.max(12, Math.round(120 - progress))}ms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-cyber-cyan/40 font-mono tracking-wider">
            CYBERSECURITY SYSTEMS // AUTHORIZED ACCESS ONLY
          </p>
          <p className="text-[10px] text-cyber-cyan/20 font-mono">© 2025 CYBERAUTH CORP. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </div>
  )
}
