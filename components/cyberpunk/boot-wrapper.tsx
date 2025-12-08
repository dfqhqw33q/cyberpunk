"use client"

import { useState, useEffect, type ReactNode } from "react"
import { BootSequence } from "./boot-sequence"

interface BootWrapperProps {
  children: ReactNode
}

export function BootWrapper({ children }: BootWrapperProps) {
  const [booted, setBooted] = useState(false)
  const [showBoot, setShowBoot] = useState(true)
  const [isReturningUser, setIsReturningUser] = useState(false)

  useEffect(() => {
    // Check if user has visited before
    const lastVisit = sessionStorage.getItem("cyberauth_last_boot")
    const now = Date.now()

    if (lastVisit) {
      const timeSinceLast = now - Number.parseInt(lastVisit)
      // If visited within last 5 minutes, show micro boot
      if (timeSinceLast < 5 * 60 * 1000) {
        setIsReturningUser(true)
      }
    }

    // Update last visit time
    sessionStorage.setItem("cyberauth_last_boot", now.toString())

    // Honor reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setShowBoot(false)
      setBooted(true)
    }
  }, [])

  const handleBootComplete = () => {
    setBooted(true)
    setTimeout(() => setShowBoot(false), 500)
  }

  return (
    <>
      {showBoot && !booted && <BootSequence onComplete={handleBootComplete} isReturningUser={isReturningUser} />}
      <div className={booted ? "animate-fade-in" : "opacity-0"}>{children}</div>
    </>
  )
}
