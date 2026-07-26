import { useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import styles from './ActiveScreen.module.css'
import { recordings } from '../content/recordings'
import { ActiveTagFilter } from './ActiveTagFilter'
import { ActiveRecordingCard } from './ActiveRecordingCard'
import { useAudioPlayer } from '../state/useAudioPlayer'
import { duration, easeCinematic } from '../theme'

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
}

export function ActiveScreen(): React.JSX.Element {
  const allTags = useMemo(() => Array.from(new Set(recordings.flatMap((r) => r.tags))).sort(), [])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const filtered = useMemo(
    () => (activeTag ? recordings.filter((r) => r.tags.includes(activeTag)) : recordings),
    [activeTag]
  )

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const safeIndex = filtered.length === 0 ? 0 : index % filtered.length
  const current = filtered[safeIndex]

  const { audioElRef, isPlaying, currentTime, durationSec, toggle, seek } = useAudioPlayer(
    current?.audioSrc
  )

  function goTo(step: number): void {
    if (filtered.length <= 1) return
    setDirection(step)
    setIndex((i) => (i + step + filtered.length) % filtered.length)
  }

  function selectTag(tag: string | null): void {
    setActiveTag(tag)
    setDirection(1)
    setIndex(0)
  }

  return (
    <div className={styles.screen}>
      <audio ref={audioElRef} src={current?.audioSrc} />
      <ActiveTagFilter tags={allTags} active={activeTag} onSelect={selectTag} />

      {current && (
        <>
          <div className={styles.stage}>
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: duration.carousel, ease: easeCinematic }}
                className={styles.slide}
              >
                <ActiveRecordingCard
                  recording={current}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  durationSec={durationSec}
                  onTogglePlay={toggle}
                  onSeek={seek}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            className={styles.arrowLeft}
            onClick={() => goTo(-1)}
            disabled={filtered.length <= 1}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className={styles.arrowRight}
            onClick={() => goTo(1)}
            disabled={filtered.length <= 1}
            aria-label="Siguiente"
          >
            ›
          </button>

          <div className={styles.dots}>
            {filtered.map((r, i) => (
              <span key={r.id} className={i === safeIndex ? styles.dotActive : styles.dot} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
