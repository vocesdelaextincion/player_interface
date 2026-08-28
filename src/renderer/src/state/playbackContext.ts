import { createContext } from 'react'

export interface PlaybackContextValue {
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  // The Active station registers a callback that silences every sound it owns.
  registerStop: (fn: (() => void) | null) => void
  requestStop: () => void
}

export const PlaybackContext = createContext<PlaybackContextValue | null>(null)
