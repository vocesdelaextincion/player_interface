import { useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import styles from './ActiveScreen.module.css'
import { recordings, type Recording } from '../content/recordings'
import { menuBackgrounds } from '../content/backgrounds'
import { useSoundboard } from '../state/useSoundboard'
import { duration, easeCinematic } from '../theme'

const PAGE_SIZE = 4

// TEMPORARY: the catalog barely fills one station, so the carousel can't be judged without
// repeating it. Delete this and let the page count follow the recording count alone once the
// real catalog lands.
const PLACEHOLDER_PAGES = 4

// Stable identity: useSoundboard rebuilds its elements whenever the station changes, so an
// empty catalog must not hand it a fresh array on every render.
const NO_STATION: Recording[] = []

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

  const station = pages[page] ?? NO_STATION
  const background = menuBackgrounds[page % Math.max(1, menuBackgrounds.length)]

  const { playingSlots, toggle } = useSoundboard(station)

  function goTo(step: number): void {
    if (pages.length <= 1) return
    setDirection(step)
    setPage((current) => (current + step + pages.length) % pages.length)
  }

  return (
    <div className={styles.screen}>
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
            {station.map((recording, slot) => {
              const isPlaying = playingSlots.has(slot)
              return (
                <button
                  // The same recording can appear on more than one page while the catalog is
                  // padded out, so the slot has to be part of the key.
                  key={`${page}-${slot}-${recording.id}`}
                  className={isPlaying ? styles.itemPlaying : styles.item}
                  onClick={() => toggle(slot)}
                  aria-label={recording.title}
                >
                  <span className={styles.itemGlyph} aria-hidden="true">
                    {isPlaying ? '■' : '▶'}
                  </span>
                </button>
              )
            })}
          </nav>
        </motion.div>
      </AnimatePresence>

      <div className={styles.pager}>
        <button className={styles.arrow} onClick={() => goTo(-1)} disabled={pages.length <= 1}>
          <span className={styles.arrowGlyph} aria-hidden="true">
            ‹
          </span>
          <span className={styles.arrowLabel}>Anterior</span>
        </button>
        <button className={styles.arrow} onClick={() => goTo(1)} disabled={pages.length <= 1}>
          <span className={styles.arrowLabel}>Siguiente</span>
          <span className={styles.arrowGlyph} aria-hidden="true">
            ›
          </span>
        </button>
      </div>
    </div>
  )
}
