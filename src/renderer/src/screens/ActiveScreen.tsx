import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import styles from './ActiveScreen.module.css'
import { recordings, type Recording } from '../content/recordings'
import { menuBackgrounds } from '../content/backgrounds'
import { ActivePlayerBar } from './ActivePlayerBar'
import { useAudioPlayer } from '../state/useAudioPlayer'
import { duration, easeCinematic } from '../theme'

const PAGE_SIZE = 5

// TEMPORARY: the catalog holds exactly one screenful of recordings, so the carousel can't be
// judged without repeating it. Delete this and let the page count follow the recording count
// alone once the real catalog lands.
const PLACEHOLDER_PAGES = 4

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
}

function buildPages(list: Recording[], pageCount: number): Recording[][] {
  if (list.length === 0) return []
  return Array.from({ length: pageCount }, (_, page) =>
    Array.from({ length: PAGE_SIZE }, (_, slot) => list[(page * PAGE_SIZE + slot) % list.length])
  )
}

export function ActiveScreen(): React.JSX.Element {
  const pages = useMemo(() => {
    const needed = Math.ceil(recordings.length / PAGE_SIZE)
    const count = Math.min(menuBackgrounds.length, Math.max(needed, PLACEHOLDER_PAGES))
    return buildPages(recordings, count)
  }, [])

  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = recordings.find((r) => r.id === selectedId)
  const background = menuBackgrounds[page % Math.max(1, menuBackgrounds.length)]

  const { audioElRef, isPlaying, currentTime, durationSec, play, toggle, seek } = useAudioPlayer(
    selected?.audioSrc,
    selected?.gain
  )

  // Runs after the <audio> src attribute has been updated, so this starts the newly picked
  // recording rather than replaying the previous one.
  useEffect(() => {
    if (selectedId) play()
  }, [selectedId, play])

  function goTo(step: number): void {
    if (pages.length <= 1) return
    setDirection(step)
    setPage((current) => (current + step + pages.length) % pages.length)
  }

  function handleSelect(recording: Recording): void {
    if (recording.id === selectedId) {
      toggle()
      return
    }
    setSelectedId(recording.id)
  }

  return (
    <div className={styles.screen}>
      <audio ref={audioElRef} src={selected?.audioSrc} preload="auto" />

      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: duration.carousel, ease: easeCinematic }}
          className={styles.page}
        >
          {background && (
            <>
              <img src={background.src} alt="" className={styles.background} decoding="async" />
              <div
                className={background.side === 'left' ? styles.veilLeft : styles.veilRight}
                aria-hidden="true"
              />
            </>
          )}

          <nav className={background?.side === 'right' ? styles.menuRight : styles.menuLeft}>
            {pages[page]?.map((recording, slot) => {
              const isCurrent = recording.id === selectedId
              return (
                <button
                  // The same recording can appear on more than one page while the catalog is
                  // padded out, so the slot has to be part of the key.
                  key={`${page}-${slot}-${recording.id}`}
                  className={isCurrent ? styles.itemPlaying : styles.item}
                  onClick={() => handleSelect(recording)}
                >
                  <span className={styles.itemGlyph} aria-hidden="true">
                    {isCurrent && isPlaying ? '❚❚' : '▶'}
                  </span>
                  <span className={styles.itemTitle}>{recording.title}</span>
                </button>
              )
            })}
          </nav>
        </motion.div>
      </AnimatePresence>

      <div className={styles.pager}>
        <button
          className={styles.arrow}
          onClick={() => goTo(-1)}
          disabled={pages.length <= 1}
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          className={styles.arrow}
          onClick={() => goTo(1)}
          disabled={pages.length <= 1}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      {selected && (
        <ActivePlayerBar
          title={selected.title}
          isPlaying={isPlaying}
          currentTime={currentTime}
          durationSec={durationSec}
          onTogglePlay={toggle}
          onSeek={seek}
        />
      )}
    </div>
  )
}
