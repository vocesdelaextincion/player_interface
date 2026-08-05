import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayback } from './usePlayback'

interface AudioPlayer {
  audioElRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  currentTime: number
  durationSec: number
  play: () => void
  toggle: () => void
  seek: (fraction: number) => void
}

// Owns the one <audio> element the Active screen reuses across every recording —
// only its `src` changes as the carousel moves (see ARCHITECTURE.md "Long-run stability").
export function useAudioPlayer(src: string | undefined, gain = 1): AudioPlayer {
  const audioElRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setLocalPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const { setIsPlaying, registerStop } = usePlayback()

  const stop = useCallback(() => {
    const el = audioElRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
    }
    setLocalPlaying(false)
    setIsPlaying(false)
  }, [setIsPlaying])

  // Safe to call straight after a source change: the element buffers and starts when ready.
  const play = useCallback(() => {
    const el = audioElRef.current
    if (el) void el.play().catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    const el = audioElRef.current
    if (!el) return
    if (el.paused) {
      void el.play()
    } else {
      el.pause()
    }
  }, [])

  const seek = useCallback((fraction: number) => {
    const el = audioElRef.current
    if (!el || !el.duration) return
    el.currentTime = fraction * el.duration
  }, [])

  useEffect(() => {
    registerStop(stop)
    return () => registerStop(null)
  }, [registerStop, stop])

  // Switching recordings stops the current one (see ARCHITECTURE.md "Playback").
  // No setState here: pausing/seeking fires the native 'pause'/'timeupdate' events
  // below, which sync isPlaying/currentTime; duration resets itself once the new
  // source's metadata loads.
  useEffect(() => {
    const el = audioElRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
  }, [src])

  // Per-recording level trim, so the catalog plays at a consistent loudness (see recordings.ts).
  // Applied alongside src so a new track never plays a frame at the previous track's level.
  useEffect(() => {
    const el = audioElRef.current
    if (el) el.volume = gain
  }, [gain, src])

  useEffect(() => {
    const el = audioElRef.current
    if (!el) return

    function handlePlay(): void {
      setLocalPlaying(true)
      setIsPlaying(true)
    }
    function handlePause(): void {
      setLocalPlaying(false)
      setIsPlaying(false)
    }
    function handleTimeUpdate(): void {
      setCurrentTime(el?.currentTime ?? 0)
    }
    function handleLoadedMetadata(): void {
      setDurationSec(el?.duration ?? 0)
    }
    // Track end: stop, stay on the current recording — no auto-advance.
    function handleEnded(): void {
      stop()
    }

    el.addEventListener('play', handlePlay)
    el.addEventListener('pause', handlePause)
    el.addEventListener('timeupdate', handleTimeUpdate)
    el.addEventListener('loadedmetadata', handleLoadedMetadata)
    el.addEventListener('ended', handleEnded)

    return () => {
      el.removeEventListener('play', handlePlay)
      el.removeEventListener('pause', handlePause)
      el.removeEventListener('timeupdate', handleTimeUpdate)
      el.removeEventListener('loadedmetadata', handleLoadedMetadata)
      el.removeEventListener('ended', handleEnded)
    }
  }, [setIsPlaying, stop])

  return { audioElRef, isPlaying, currentTime, durationSec, play, toggle, seek }
}
