import { useState, useEffect } from "react"

export function useResponsive() {
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setWidth(w)
      setHeight(h)
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1024)
      setIsDesktop(w >= 1024)
    }

    // Initial call
    handleResize()

    // Regular resize listener
    window.addEventListener("resize", handleResize)
    
    // Orientation change listener with delay
    const handleOrientationChange = () => {
      setTimeout(handleResize, 100)
    }
    window.addEventListener("orientationchange", handleOrientationChange)

    // Visual viewport change (for keyboard appearance on mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      window.visualViewport.addEventListener("scroll", handleResize)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleOrientationChange)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
        window.visualViewport.removeEventListener("scroll", handleResize)
      }
    }
  }, [])

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
  }
}

