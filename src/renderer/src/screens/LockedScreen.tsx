import styles from './LockedScreen.module.css'
import { StaffFrame } from './StaffFrame'

// Screen-cleaning mode. `blockTouch` swallows every touch on the frame itself; the ways out are
// the shell's window-level listeners, which the frame can't intercept — F4, or a long press in
// the bottom-left corner.
export function LockedScreen(): React.JSX.Element {
  return (
    <StaffFrame badge="Modo bloqueo" blockTouch>
      <h1 className={styles.title}>Pantalla bloqueada</h1>
      <p className={styles.hint}>Mantén pulsada la esquina inferior izquierda para desbloquear</p>
    </StaffFrame>
  )
}
