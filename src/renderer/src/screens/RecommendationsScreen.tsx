import styles from './InterstitialScreen.module.css'
import { InterstitialScreen } from './InterstitialScreen'

const HOLD_MS = 5_000

// Shown once on the way out of Idle. It exists because the station screen deliberately says
// nothing until a sound is playing — the icons carry no titles, and combining them is not
// something a visitor would think to try unprompted.
export function RecommendationsScreen({ onDone }: { onDone: () => void }): React.JSX.Element {
  return (
    <InterstitialScreen holdMs={HOLD_MS} onDone={onDone}>
      <h1 className={styles.title}>Voces de la extinción</h1>
      <ul className={styles.list}>
        <li className={styles.listItem}>Seleccioná los audios que desees escuchar</li>
        <li className={styles.listItem}>Podés combinar los que quieras</li>
        <li className={styles.listItem}>Cerrá los ojos y disfrutá de los sonidos del monte</li>
      </ul>
    </InterstitialScreen>
  )
}
