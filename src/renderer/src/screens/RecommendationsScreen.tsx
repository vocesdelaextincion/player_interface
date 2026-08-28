import styles from './InterstitialScreen.module.css'
import { InterstitialScreen } from './InterstitialScreen'

const HOLD_MS = 5_000

// Shown once on the way out of Idle. It exists because the station screen deliberately says
// nothing until a sound is playing — the icons carry no titles, and combining them is not
// something a visitor would think to try unprompted.
export function RecommendationsScreen({ onDone }: { onDone: () => void }): React.JSX.Element {
  return (
    <InterstitialScreen holdMs={HOLD_MS} onDone={onDone}>
      <h1 className={styles.title}>Antes de comenzar</h1>
      <ul className={styles.list}>
        <li className={styles.listItem}>Toca un ícono para escuchar</li>
        <li className={styles.listItem}>Puedes combinar varios sonidos</li>
        <li className={styles.listItem}>Las flechas cambian de estación</li>
      </ul>
      <p className={styles.footnote}>Tienes 90 segundos</p>
    </InterstitialScreen>
  )
}
