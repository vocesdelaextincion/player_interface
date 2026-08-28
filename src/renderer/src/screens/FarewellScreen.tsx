import styles from './InterstitialScreen.module.css'
import { InterstitialScreen } from './InterstitialScreen'

const HOLD_MS = 6_000

// The end of the hard-limited visit. It takes no input on purpose: whoever is at the screen has
// just been interrupted mid-listen, and a dismissable screen would only invite them to stay.
export function FarewellScreen({ onDone }: { onDone: () => void }): React.JSX.Element {
  return (
    <InterstitialScreen holdMs={HOLD_MS} onDone={onDone}>
      <h1 className={styles.title}>Gracias por escuchar</h1>
      <p className={styles.footnote}>Voces de la Extinción</p>
    </InterstitialScreen>
  )
}
