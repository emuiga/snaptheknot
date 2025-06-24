"use client"
import { useAudio } from './AudioProvider'
import { Play, Pause } from 'lucide-react'

export function GlobalAudioControl() {
  const { isPlaying, toggleAudio } = useAudio()

  return (
    <div className="w-full bg-black/30 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-brown/70 font-cormorant truncate">[play audio before continuing]</span>
          <button
            onClick={toggleAudio}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors flex-shrink-0"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
} 