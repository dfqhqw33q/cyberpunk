"use client"

import { cyberAudio, type SoundType } from "./audio-context"

type EventType = "hover" | "click" | "success" | "error" | "notification" | "boot" | "glitch" | "lock" | "unlock"
type EventCallback = (data?: unknown) => void

class CyberEventBus {
  private listeners: Map<EventType, Set<EventCallback>> = new Map()
  private audioMapping: Record<EventType, SoundType> = {
    hover: "hover",
    click: "click",
    success: "success",
    error: "error",
    notification: "notification",
    boot: "boot",
    glitch: "glitch",
    lock: "lock",
    unlock: "unlock",
  }

  emit(event: EventType, data?: unknown) {
    // Play corresponding sound
    const soundType = this.audioMapping[event]
    if (soundType) {
      cyberAudio.play(soundType)
    }

    // Notify listeners
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => cb(data))
    }
  }

  on(event: EventType, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event: EventType, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback)
  }
}

export const cyberEvents = new CyberEventBus()
