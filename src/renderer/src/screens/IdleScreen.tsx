import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './IdleScreen.module.css'
import { duration, idleVideoPlaybackRate } from '../theme'

// Eager, like the recordings loader: the set is tiny and this runs once at startup.
// Extension-scoped so the 4K masters in media/videos/masters/ are never bundled.
const videos = Object.values(
  import.meta.glob('../../../../media/videos/*.mp4', {
    eager: true,
    query: '?url',
    import: 'default'
  })
) as string[]

function pickDifferent(current: number, total: number): number {
  if (total <= 1) return current
  let next = current
  while (next === current) next = Math.floor(Math.random() * total)
  return next
}

// Idle is video only — no text, no chrome, no audio (see ARCHITECTURE.md). The clips are a few
// seconds each, so idle cycles through them at random for as long as nobody touches the screen.
export function IdleScreen({ onActivate }: { onActivate: () => void }): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(1, videos.length)))
  const [visible, setVisible] = useState(true)

  // playbackRate is reset by the element every time a new source loads, so it has to be
  // reapplied per clip rather than set once.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    function applyRate(): void {
      const video = videoRef.current
      if (!video) return
      video.playbackRate = idleVideoPlaybackRate
      // autoPlay covers the first clip; this covers every source swap after it.
      void video.play().catch(() => {})
    }

    applyRate()
    el.addEventListener('loadeddata', applyRate)
    return () => el.removeEventListener('loadeddata', applyRate)
  }, [index])

  const handleEnded = useCallback(() => {
    // A single clip can't cross-fade to anything else — just loop it in place.
    if (videos.length <= 1) {
      const el = videoRef.current
      if (el) {
        el.currentTime = 0
        void el.play().catch(() => {})
      }
      return
    }
    setVisible(false)
  }, [])

  // Swap the source only once the fade-out has finished, so one video element is ever decoding
  // (ARCHITECTURE.md: one full-bleed animated layer at a time).
  const handleFadeComplete = useCallback(() => {
    if (visible) return
    setIndex((current) => pickDifferent(current, videos.length))
    setVisible(true)
  }, [visible])

  return (
    <div className={styles.screen} onPointerDown={onActivate}>
      {videos.length > 0 && (
        <motion.video
          ref={videoRef}
          className={styles.video}
          src={videos[index]}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleEnded}
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: duration.idleVideoFade, ease: 'linear' }}
          onAnimationComplete={handleFadeComplete}
        />
      )}
    </div>
  )
}
