import { useContext } from 'react'
import { PlaybackContext, type PlaybackContextValue } from './playbackContext'

export function usePlayback(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext)
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider')
  return ctx
}
