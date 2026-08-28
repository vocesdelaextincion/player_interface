import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayback } from './usePlayback'
import type { Recording } from '../content/recordings'

interface Soundboard {
  /** Slots of the current station that are sounding right now. */
  playingSlots: ReadonlySet<number>
  toggle: (slot: number) => void
}

interface Tracked {
  station: Recording[]
  slots: ReadonlySet<number>
}

const NONE: ReadonlySet<number> = new Set()

// A station is a mix, not a playlist: every sound on it gets its own looping element so visitors
// can layer them. Keyed by slot rather than recording id, because a short catalog can repeat the
// same recording on more than one station and the slots still have to sound independently.
export function useSoundboard(station: Recording[]): Soundboard {
  const elementsRef = useRef<HTMLAudioElement[]>([])
  const [tracked, setTracked] = useState<Tracked>({ station, slots: NONE })
  const { setIsPlaying, registerStop } = usePlayback()

  // Turning the page replaces the whole element set, so the outgoing station's slots are dropped
  // by identity here rather than cleared by an extra render.
  const playingSlots = tracked.station === station ? tracked.slots : NONE

  // Elements are built imperatively rather than rendered, so the teardown is explicit — an
  // <audio> left holding a src holds a decoder with it, and this app runs all day (see
  // ARCHITECTURE.md "Long-run stability"). Turning the page lands here and silences the
  // outgoing station on the way out.
  useEffect(() => {
    const elements = station.map((recording) => {
      const el = new Audio(recording.audioSrc)
      el.loop = true
      el.preload = 'auto'
      // Per-recording level trim, so a mix doesn't tilt towards whichever track was recorded
      // hottest (see recordings.ts).
      el.volume = recording.gain
      return el
    })
    elementsRef.current = elements

    // Derived from the elements rather than tracked alongside them, so a play() that never
    // starts leaves the icon telling the truth.
    function sync(): void {
      setTracked({
        station,
        slots: new Set(elements.flatMap((el, slot) => (el.paused ? [] : [slot])))
      })
    }

    for (const el of elements) {
      el.addEventListener('play', sync)
      el.addEventListener('pause', sync)
    }

    // The admin gate and the hard limit both silence the exhibit through this bridge.
    registerStop(() => {
      for (const el of elements) {
        el.pause()
        el.currentTime = 0
      }
    })

    return () => {
      registerStop(null)
      for (const el of elements) {
        el.removeEventListener('play', sync)
        el.removeEventListener('pause', sync)
        el.pause()
        el.removeAttribute('src')
        el.load()
      }
      elementsRef.current = []
    }
  }, [station, registerStop])

  // Stop, not pause: with sounds layered and looping there is no position worth keeping.
  const toggle = useCallback((slot: number) => {
    const el = elementsRef.current[slot]
    if (!el) return
    if (el.paused) {
      void el.play().catch(() => {})
    } else {
      el.pause()
      el.currentTime = 0
    }
  }, [])

  useEffect(() => {
    setIsPlaying(playingSlots.size > 0)
  }, [playingSlots, setIsPlaying])

  // Leaving Active tears the elements down without firing 'pause', so the shared flag is cleared
  // here — otherwise the inactivity timer stays deferred forever.
  useEffect(() => () => setIsPlaying(false), [setIsPlaying])

  return { playingSlots, toggle }
}
