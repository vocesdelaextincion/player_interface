import styles from './ActiveRecordingCard.module.css'
import type { Recording } from '../content/recordings'
import { formatTime } from '../utils/formatTime'

interface ActiveRecordingCardProps {
  recording: Recording
  isPlaying: boolean
  currentTime: number
  durationSec: number
  onTogglePlay: () => void
  onSeek: (fraction: number) => void
}

export function ActiveRecordingCard({
  recording,
  isPlaying,
  currentTime,
  durationSec,
  onTogglePlay,
  onSeek
}: ActiveRecordingCardProps): React.JSX.Element {
  function handleSeek(event: React.PointerEvent<HTMLDivElement>): void {
    const rect = event.currentTarget.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    onSeek(fraction)
  }

  const progress = durationSec > 0 ? (currentTime / durationSec) * 100 : 0

  return (
    <div className={styles.card} onClick={onTogglePlay}>
      <img src={recording.imageSrc} alt="" className={styles.image} decoding="async" />
      <div className={styles.overlay} />
      <div className={styles.info}>
        <button className={styles.playButton} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <h1 className={styles.species}>{recording.species}</h1>
        <p className={styles.title}>{recording.title}</p>
        <p className={styles.tag}>{recording.tags.join(', ')}</p>
        <div
          className={styles.scrubTrack}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            handleSeek(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons === 1) handleSeek(event)
          }}
          onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        >
          <div className={styles.scrubBar}>
            <div className={styles.scrubFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className={styles.time}>
          {formatTime(currentTime)} / {formatTime(durationSec)}
        </span>
      </div>
    </div>
  )
}
