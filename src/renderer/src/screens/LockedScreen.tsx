import styles from './LockedScreen.module.css'
import { StaffFrame } from './StaffFrame'

// Screen-cleaning mode. `blockTouch` swallows every touch on the frame; the only way out is the
// shell's window-level F4 listener.
export function LockedScreen(): React.JSX.Element {
  return (
    <StaffFrame badge="Modo bloqueo" blockTouch>
      <h1 className={styles.title}>Pantalla bloqueada</h1>
      <p className={styles.hint}>F4 para desbloquear</p>
    </StaffFrame>
  )
}
