"use client"

import { useEffect, useRef } from "react"

interface DataStreamBgProps {
  className?: string
}

export function DataStreamBg({ className = "" }: DataStreamBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let columns: number[] = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      columns = []
      const columnCount = Math.floor(canvas.width / 20)
      for (let i = 0; i < columnCount; i++) {
        columns[i] = Math.random() * canvas.height
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const fontSize = 14

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#00ffff"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * 20
        const y = columns[i]

        // Gradient effect - brighter at the head
        const gradient = ctx.createLinearGradient(x, y - 100, x, y)
        gradient.addColorStop(0, "rgba(0, 255, 255, 0)")
        gradient.addColorStop(0.8, "rgba(0, 255, 255, 0.5)")
        gradient.addColorStop(1, "rgba(0, 255, 255, 1)")

        ctx.fillStyle = gradient
        ctx.fillText(char, x, y)

        // Random magenta highlights
        if (Math.random() > 0.99) {
          ctx.fillStyle = "#ff00ff"
          ctx.fillText(char, x, y)
        }

        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = 0
        }
        columns[i] += fontSize
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none opacity-30 ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
