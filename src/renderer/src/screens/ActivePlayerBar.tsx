import styles from './ActivePlayerBar.module.css'
import { formatTime } from '../utils/formatTime'

interface ActivePlayerBarProps {
  title: string
  isPlaying: boolean
  currentTime: number
  durationSec: number
  onTogglePlay: () => void
  onSeek: (fraction: number) => void
}

export function ActivePlayerBar({
  title,
  isPlaying,
  currentTime,
  durationSec,
  onTogglePlay,
  onSeek
}: ActivePlayerBarProps): React.JSX.Element {
  function handleSeek(event: React.PointerEvent<HTMLDivElement>): void {
    const rect = event.currentTarget.getBoundingClientRect()
    onSeek(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)))
  }

  const progress = durationSec > 0 ? Math.min(1, currentTime / durationSec) : 0

  return (
    <div className={styles.bar}>
      <button
        className={styles.toggle}
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      <div className={styles.body}>
        <span className={styles.title}>{title}</span>
        <div
          className={styles.track}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            handleSeek(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons === 1) handleSeek(event)
          }}
          onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        >
          <div className={styles.rail}>
            {/* scaleX rather than width — this updates ~4x/sec for the whole track. */}
            <div className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>

      <span className={styles.time}>
        {formatTime(currentTime)} / {formatTime(durationSec)}
      </span>
    </div>
  )
}
