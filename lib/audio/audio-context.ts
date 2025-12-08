"use client"

// Audio UX System - Web Audio API with low-latency sound effects
export type SoundType = "hover" | "click" | "success" | "error" | "notification" | "boot" | "glitch" | "lock" | "unlock"

interface AudioSettings {
  enabled: boolean
  volume: number
  ambientVolume: number
}

class CyberAudioManager {
  private context: AudioContext | null = null
  private buffers: Map<SoundType, AudioBuffer> = new Map()
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.5,
    ambientVolume: 0.2,
  }
  private initialized = false
  private ambientSource: AudioBufferSourceNode | null = null
  private masterGain: GainNode | null = null

  constructor() {
    // Load settings from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cyberAudioSettings")
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) }
        } catch {}
      }
    }
  }

  async init() {
    if (this.initialized || typeof window === "undefined") return

    try {
      this.context = new AudioContext()
      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)
      this.masterGain.gain.value = this.settings.volume

      // Generate and decode all sound effects
      await this.generateSounds()
      this.initialized = true
    } catch (err) {
      console.warn("Audio initialization failed:", err)
    }
  }

  private async generateSounds() {
    if (!this.context) return

    // Generate synthetic sounds using oscillators
    const sounds: Record<SoundType, () => AudioBuffer> = {
      hover: () => this.createBeepSound(800, 0.05, "sine"),
      click: () => this.createBeepSound(200, 0.1, "square"),
      success: () => this.createSuccessSound(),
      error: () => this.createGlitchSound(0.3),
      notification: () => this.createNotificationSound(),
      boot: () => this.createBootSound(),
      glitch: () => this.createGlitchSound(0.15),
      lock: () => this.createLockSound(),
      unlock: () => this.createUnlockSound(),
    }

    for (const [type, generator] of Object.entries(sounds)) {
      this.buffers.set(type as SoundType, generator())
    }
  }

  private createBeepSound(freq: number, duration: number, type: OscillatorType): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 20) // Fast decay
      let sample = 0

      if (type === "sine") {
        sample = Math.sin(2 * Math.PI * freq * t)
      } else if (type === "square") {
        sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1
      }

      data[i] = sample * envelope * 0.3
    }

    return buffer
  }

  private createSuccessSound(): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const duration = 0.4
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    // Rising tones for success
    const freqs = [400, 600, 800]
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const freqIndex = Math.min(Math.floor(t / (duration / 3)), 2)
      const freq = freqs[freqIndex]
      const envelope = Math.exp(-t * 5) * (1 - Math.exp(-t * 50))
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3
    }

    return buffer
  }

  private createGlitchSound(duration: number): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 10)
      // Noise with bit-crushing effect
      const noise = Math.random() * 2 - 1
      const crushed = Math.round(noise * 4) / 4
      data[i] = crushed * envelope * 0.4
    }

    return buffer
  }

  private createNotificationSound(): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const duration = 0.15
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const freq = 1200 + Math.sin(t * 40) * 200
      const envelope = Math.exp(-t * 15)
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25
    }

    return buffer
  }

  private createBootSound(): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const duration = 1.5
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Low hum building up
      const baseFreq = 60 + t * 100
      const envelope = Math.min(t * 2, 1) * Math.exp(-(t - 1) * 3)
      const hum = Math.sin(2 * Math.PI * baseFreq * t) * 0.3
      const harmonic = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.15
      // Add digital artifacts
      const digital = Math.random() > 0.98 ? (Math.random() - 0.5) * 0.4 : 0
      data[i] = (hum + harmonic + digital) * envelope * 0.4
    }

    return buffer
  }

  private createLockSound(): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const duration = 0.5
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Descending tone with alarm quality
      const freq = 800 - t * 600
      const envelope = Math.exp(-t * 4)
      const alarm = Math.sin(2 * Math.PI * freq * t) * Math.sin(2 * Math.PI * 8 * t)
      data[i] = alarm * envelope * 0.35
    }

    return buffer
  }

  private createUnlockSound(): AudioBuffer {
    const ctx = this.context!
    const sampleRate = ctx.sampleRate
    const duration = 0.3
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // Ascending digital chirp
      const freq = 300 + t * 1000
      const envelope = Math.exp(-t * 6) * (1 - Math.exp(-t * 100))
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3
    }

    return buffer
  }

  play(type: SoundType) {
    if (!this.initialized || !this.context || !this.settings.enabled) return

    const buffer = this.buffers.get(type)
    if (!buffer || !this.masterGain) return

    // Resume context if suspended (browsers require user interaction)
    if (this.context.state === "suspended") {
      this.context.resume()
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.connect(this.masterGain)
    source.start()
  }

  setEnabled(enabled: boolean) {
    this.settings.enabled = enabled
    this.saveSettings()
  }

  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.volume
    }
    this.saveSettings()
  }

  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  private saveSettings() {
    if (typeof window !== "undefined") {
      localStorage.setItem("cyberAudioSettings", JSON.stringify(this.settings))
    }
  }
}

// Singleton instance
export const cyberAudio = new CyberAudioManager()
