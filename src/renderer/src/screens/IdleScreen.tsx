import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './IdleScreen.module.css'
import { recordings } from '../content/recordings'
import { duration, easeCinematic, kenBurnsEnabled } from '../theme'

// A few pan/zoom directions so consecutive images don't all drift the same way.
const KEN_BURNS_VARIANTS = [
  { scale: 1.08, x: '-1%', y: '1%' },
  { scale: 1.06, x: '1%', y: '-1%' },
  { scale: 1.1, x: 0, y: 0 }
]

const cycleSeconds = duration.ambientHold + duration.ambientCrossfade

export function IdleScreen({ onActivate }: { onActivate: () => void }): React.JSX.Element {
  const images = recordings.map((recording) => recording.imageSrc)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, cycleSeconds * 1000)
    return () => clearInterval(id)
  }, [images.length])

  const kenBurns = KEN_BURNS_VARIANTS[index % KEN_BURNS_VARIANTS.length]

  return (
    <div className={styles.screen} onPointerDown={onActivate}>
      {images.length > 0 && (
        <AnimatePresence>
          <motion.img
            key={index}
            src={images[index]}
            alt=""
            className={styles.image}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: kenBurnsEnabled ? kenBurns.scale : 1,
              x: kenBurnsEnabled ? kenBurns.x : 0,
              y: kenBurnsEnabled ? kenBurns.y : 0
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: duration.ambientCrossfade, ease: easeCinematic },
              scale: { duration: cycleSeconds, ease: 'linear' },
              x: { duration: cycleSeconds, ease: 'linear' },
              y: { duration: cycleSeconds, ease: 'linear' }
            }}
          />
        </AnimatePresence>
      )}
    </div>
  )
}
