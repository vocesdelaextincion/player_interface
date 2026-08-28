import { useEffect } from 'react'
import type { ReactNode } from 'react'
import styles from './InterstitialScreen.module.css'
import { menuBackgrounds } from '../content/backgrounds'

interface InterstitialScreenProps {
  /** How long it holds before calling `onDone`. */
  holdMs: number
  onDone: () => void
  children: ReactNode
}

// The exhibit photograph, already out of focus — it belongs to the same world as the stations
// without competing with the words on top of it. Falls back to the sharp frame if the blurred
// variants haven't been generated (see scripts/blur-backgrounds.mjs).
const backdrop = menuBackgrounds[0]?.blurredSrc ?? menuBackgrounds[0]?.src

// Shared chrome for the two screens that only speak and then move on: the recommendations shown
// on the way in and the farewell shown when the visit runs out. Neither takes any input — a
// visitor can't get stuck on one, and nothing here needs a control to miss.
export function InterstitialScreen({
  holdMs,
  onDone,
  children
}: InterstitialScreenProps): React.JSX.Element {
  useEffect(() => {
    const timer = setTimeout(onDone, holdMs)
    return () => clearTimeout(timer)
  }, [holdMs, onDone])

  return (
    <div className={styles.screen}>
      {backdrop && <img src={backdrop} alt="" className={styles.background} decoding="async" />}
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
