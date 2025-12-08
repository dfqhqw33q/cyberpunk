"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { cyberAudio, type SoundType } from "@/lib/audio/audio-context"
import { cyberEvents } from "@/lib/audio/event-bus"

interface AudioContextValue {
  initialized: boolean
  enabled: boolean
  volume: number
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  playSound: (type: SoundType) => void
  emitEvent: (event: SoundType, data?: unknown) => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [enabled, setEnabledState] = useState(true)
  const [volume, setVolumeState] = useState(0.5)

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      await cyberAudio.init()
      setInitialized(true)
      const settings = cyberAudio.getSettings()
      setEnabledState(settings.enabled)
      setVolumeState(settings.volume)
    }

    // Init on first user gesture
    const handleInteraction = () => {
      initAudio()
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("keydown", handleInteraction)
    window.addEventListener("touchstart", handleInteraction)

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
    }
  }, [])

  const setEnabled = useCallback((value: boolean) => {
    cyberAudio.setEnabled(value)
    setEnabledState(value)
  }, [])

  const setVolume = useCallback((value: number) => {
    cyberAudio.setVolume(value)
    setVolumeState(value)
  }, [])

  const playSound = useCallback((type: SoundType) => {
    cyberAudio.play(type)
  }, [])

  const emitEvent = useCallback((event: SoundType, data?: unknown) => {
    cyberEvents.emit(event, data)
  }, [])

  return (
    <AudioContext.Provider value={{ initialized, enabled, volume, setEnabled, setVolume, playSound, emitEvent }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
