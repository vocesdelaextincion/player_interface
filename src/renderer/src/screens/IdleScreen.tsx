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

// Idle plays slowed, silent footage behind a dimming veil and a single line of instruction
// (see ARCHITECTURE.md). Clips are picked at random and cycle for as long as nobody touches.
export function IdleScreen({ onActivate }: { onActivate: () => void }): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(1, videos.length)))
  const [visible, setVisible] = useState(true)

  // Two jobs, both of which must happen per clip rather than once:
  // playbackRate is reset by the element on every source load, and the fade-in has to wait for
  // the first frame to actually exist — fading in on a still-loading element shows a fade to
  // black followed by a pop when the frame arrives, which is what makes a swap look abrupt.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    function handleLoadedData(): void {
      const video = videoRef.current
      if (!video) return
      video.playbackRate = idleVideoPlaybackRate
      // autoPlay covers the first clip; this covers every source swap after it.
      void video.play().catch(() => {})
      setVisible(true)
    }

    if (el.readyState >= 2) handleLoadedData()
    el.addEventListener('loadeddata', handleLoadedData)
    return () => el.removeEventListener('loadeddata', handleLoadedData)
  }, [index])

  // A single clip has nothing to cut to, so it loops on the element instead (see `loop` below)
  // and never reaches this. With more than one, the clip fades out and `handleFadeComplete`
  // picks the next.
  const handleEnded = useCallback(() => setVisible(false), [])

  // Swap the source only once the fade-out has finished, so exactly one clip is ever decoding
  // (ARCHITECTURE.md: one full-bleed animated layer at a time). `visible` stays false here —
  // the effect above raises it when the new clip's first frame is ready.
  const handleFadeComplete = useCallback(() => {
    if (visible) return
    setIndex((current) => pickDifferent(current, videos.length))
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
          // Native looping rather than restarting on 'ended': the round trip through React
          // shows a hitch at the seam, and with one clip that seam is the only cut the idle
          // screen ever makes.
          loop={videos.length <= 1}
          onEnded={handleEnded}
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: duration.idleVideoFade, ease: 'easeInOut' }}
          onAnimationComplete={handleFadeComplete}
        />
      )}
      <div className={styles.veil} />
      <p className={styles.hint}>Toca la pantalla para comenzar</p>
    </div>
  )
}
