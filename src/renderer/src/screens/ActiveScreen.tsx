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
  const [lastStarted, setLastStarted] = useState<number | null>(null)

  const station = pages[page] ?? NO_STATION
  const background = menuBackgrounds[page % Math.max(1, menuBackgrounds.length)]

  const { playingSlots, toggle } = useSoundboard(station)

  // With several sounds layered, the label follows the one most recently started — and falls back
  // to whatever is still sounding if that one has since been stopped. Nothing playing, no label:
  // the icons are meant to be tried, and naming them all up front would just be the old menu back.
  const describedSlot = playingSlots.has(lastStarted ?? -1)
    ? (lastStarted as number)
    : station.findIndex((_, slot) => playingSlots.has(slot))
  const described = describedSlot >= 0 ? station[describedSlot] : undefined
  const isSounding = playingSlots.size > 0

  function handleToggle(slot: number): void {
    if (!playingSlots.has(slot)) setLastStarted(slot)
    toggle(slot)
  }

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
              {/* Baked blur rather than a CSS filter, crossfaded on opacity — see
                  scripts/blur-backgrounds.mjs. Once a station is sounding the whole photograph
                  softens, not just the menu side, which is what gives the label a ground to sit
                  on in the far column. */}
              {background.blurredSrc && (
                <motion.img
                  src={background.blurredSrc}
                  alt=""
                  aria-hidden="true"
                  className={styles.background}
                  decoding="async"
                  initial={false}
                  animate={{ opacity: isSounding ? 1 : 0 }}
                  transition={{ duration: duration.feedback, ease: 'easeOut' }}
                />
              )}
              <div
                className={background.side === 'left' ? styles.veilLeft : styles.veilRight}
                aria-hidden="true"
              />
              <motion.div
                className={styles.veilFull}
                aria-hidden="true"
                initial={false}
                animate={{ opacity: isSounding ? 1 : 0 }}
                transition={{ duration: duration.feedback, ease: 'easeOut' }}
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
                  onClick={() => handleToggle(slot)}
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

      {/* Outside the sliding page: a page turn silences the station, so the label is already gone
          by the time the carousel moves, and this way it never renders twice mid-slide. */}
      <AnimatePresence>
        {described && (
          <motion.aside
            key={described.id}
            className={background?.side === 'right' ? styles.captionLeft : styles.captionRight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.feedback, ease: 'easeOut' }}
          >
            <p className={styles.captionSpecies}>{described.species}</p>
            <p className={styles.captionTitle}>{described.title}</p>
            {described.tags.length > 0 && (
              <p className={styles.captionTags}>{described.tags.join(' · ')}</p>
            )}
          </motion.aside>
        )}
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
