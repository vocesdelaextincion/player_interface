import { createContext } from 'react'

export interface PlaybackContextValue {
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  // Stage 5 registers the single <audio> element's stop function here.
  registerStop: (fn: (() => void) | null) => void
  requestStop: () => void
}

export const PlaybackContext = createContext<PlaybackContextValue | null>(null)
