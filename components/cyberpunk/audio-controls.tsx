"use client"

import { useState } from "react"
import { Volume2, VolumeX, Settings } from "lucide-react"
import { useAudio } from "./audio-provider"
import { cn } from "@/lib/utils"

export function AudioControls({ className }: { className?: string }) {
  const { enabled, volume, setEnabled, setVolume, playSound } = useAudio()
  const [showSlider, setShowSlider] = useState(false)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => {
          setEnabled(!enabled)
          if (!enabled) playSound("click")
        }}
        onMouseEnter={() => playSound("hover")}
        className={cn(
          "p-2 rounded border transition-all duration-300",
          enabled
            ? "border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10"
            : "border-cyber-red/50 text-cyber-red/50 hover:bg-cyber-red/10",
        )}
        title={enabled ? "Mute sounds" : "Enable sounds"}
      >
        {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      <div className="relative">
        <button
          onClick={() => setShowSlider(!showSlider)}
          onMouseEnter={() => playSound("hover")}
          className="p-2 rounded border border-cyber-cyan/30 text-cyber-cyan/70 hover:border-cyber-cyan hover:text-cyber-cyan transition-all duration-300"
        >
          <Settings size={18} />
        </button>

        {showSlider && (
          <div className="absolute bottom-full right-0 mb-2 p-3 glass-panel rounded">
            <div className="text-xs text-cyber-cyan mb-2 font-display">VOLUME</div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-24 accent-cyber-cyan"
            />
            <div className="text-xs text-cyber-cyan/70 mt-1 text-center">{Math.round(volume * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  )
}
