"use client"

import { type ReactNode, useCallback, useRef } from "react"
import { useAudio } from "./audio-provider"
import { cn } from "@/lib/utils"

interface InteractiveWrapperProps {
  children: ReactNode
  className?: string
  hoverSound?: boolean
  clickSound?: boolean
  glitchOnHover?: boolean
  as?: "div" | "button" | "a"
  onClick?: () => void
  href?: string
}

export function InteractiveWrapper({
  children,
  className,
  hoverSound = true,
  clickSound = true,
  glitchOnHover = false,
  as: Component = "div",
  onClick,
  href,
}: InteractiveWrapperProps) {
  const { playSound } = useAudio()
  const lastHoverRef = useRef(0)

  const handleMouseEnter = useCallback(() => {
    // Throttle hover sounds to prevent spam
    const now = Date.now()
    if (hoverSound && now - lastHoverRef.current > 100) {
      playSound("hover")
      lastHoverRef.current = now
    }
  }, [hoverSound, playSound])

  const handleClick = useCallback(() => {
    if (clickSound) {
      playSound("click")
    }
    onClick?.()
  }, [clickSound, playSound, onClick])

  const props = {
    className: cn(glitchOnHover && "glitch-hover", className),
    onMouseEnter: handleMouseEnter,
    onClick: handleClick,
    ...(Component === "a" && href ? { href } : {}),
  }

  return <Component {...props}>{children}</Component>
}
