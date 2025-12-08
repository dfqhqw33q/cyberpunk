"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile: boolean
  isTablet: boolean
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobile: false,
  isTablet: false,
})

export const useSidebar = () => useContext(SidebarContext)

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const pathname = usePathname()

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchCurrentX = useRef(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isHorizontalSwipe = useRef(false)

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)

      if (width >= 768 && width < 1024) {
        setIsCollapsed(true)
      } else if (width >= 1024) {
        setIsCollapsed(false)
      }
    }

    checkBreakpoint()
    window.addEventListener("resize", checkBreakpoint)
    return () => window.removeEventListener("resize", checkBreakpoint)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  useEffect(() => {
    if (isOpen && isMobile) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflowY = "scroll"
      return () => {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflowY = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen, isMobile])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchCurrentX.current = e.touches[0].clientX
    isHorizontalSwipe.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = touchStartX.current - currentX
    const diffY = Math.abs(touchStartY.current - currentY)

    // Determine if this is a horizontal swipe (for closing sidebar)
    if (!isHorizontalSwipe.current && Math.abs(diffX) > 10) {
      isHorizontalSwipe.current = Math.abs(diffX) > diffY
    }

    // Only apply transform for horizontal swipes
    if (isHorizontalSwipe.current && diffX > 0 && sidebarRef.current) {
      touchCurrentX.current = currentX
      const transform = Math.min(diffX, 300)
      sidebarRef.current.style.transform = `translateX(-${transform}px)`
      sidebarRef.current.style.transition = "none"
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchCurrentX.current

    if (sidebarRef.current) {
      sidebarRef.current.style.transition = ""
      sidebarRef.current.style.transform = ""
    }

    // Only close if it was a horizontal swipe
    if (isHorizontalSwipe.current && diff > 100) {
      setIsOpen(false)
    }
    isHorizontalSwipe.current = false
  }, [])

  useEffect(() => {
    if (!isMobile) return

    let startX = 0
    let startY = 0
    const handleDocTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleDocTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const diffX = endX - startX
      const diffY = Math.abs(endY - startY)

      // Open sidebar if swiping from left edge and horizontal movement is greater than vertical
      if (startX < 30 && diffX > 80 && diffX > diffY && !isOpen) {
        setIsOpen(true)
      }
    }

    document.addEventListener("touchstart", handleDocTouchStart, { passive: true })
    document.addEventListener("touchend", handleDocTouchEnd, { passive: true })
    return () => {
      document.removeEventListener("touchstart", handleDocTouchStart)
      document.removeEventListener("touchend", handleDocTouchEnd)
    }
  }, [isMobile, isOpen])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed, isMobile, isTablet }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden fixed top-4 left-4 z-50",
          "w-12 h-12 flex items-center justify-center rounded-sm",
          "bg-cyber-black/90 border border-cyber-cyan/30",
          "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50",
          "active:scale-95 active:bg-cyber-cyan/20 transition-all duration-300",
          "shadow-[0_0_15px_rgba(0,255,255,0.2)]",
          "touch-manipulation",
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} className="text-cyber-cyan" /> : <Menu size={24} className="text-cyber-cyan" />}
      </button>

      {/* Tablet collapse button */}
      {isTablet && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden md:flex lg:hidden fixed top-4 z-50",
            "w-10 h-10 items-center justify-center rounded-sm",
            "bg-cyber-black/90 border border-cyber-cyan/30",
            "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50",
            "active:scale-95 active:bg-cyber-cyan/20 transition-all duration-300",
            "touch-manipulation",
            isCollapsed ? "left-[72px]" : "left-[264px]",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={20} className="text-cyber-cyan" />
          ) : (
            <ChevronLeft size={20} className="text-cyber-cyan" />
          )}
        </button>
      )}

      {/* Backdrop overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="md:hidden fixed inset-0 bg-cyber-black/80 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container with touch gestures */}
      <div
        ref={sidebarRef}
        onTouchStart={isMobile && isOpen ? handleTouchStart : undefined}
        onTouchMove={isMobile && isOpen ? handleTouchMove : undefined}
        onTouchEnd={isMobile && isOpen ? handleTouchEnd : undefined}
        className={cn(
          "fixed left-0 top-0 h-screen z-40",
          "transition-transform duration-300 ease-out",
          "max-md:w-[85vw] max-md:max-w-[320px]",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0",
          "md:max-lg:translate-x-0",
          isTablet && isCollapsed && "md:max-lg:w-16",
          isTablet && !isCollapsed && "md:max-lg:w-64",
          "lg:w-72 lg:translate-x-0",
        )}
      >
        <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed, isMobile, isTablet }}>
          {children}
        </SidebarContext.Provider>
      </div>
    </SidebarContext.Provider>
  )
}
