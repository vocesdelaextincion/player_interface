import styles from './LockedScreen.module.css'

// Screen-cleaning mode. Nothing here is interactive, and `touch-action: none` plus the
// swallowed pointer events keep wiping the glass from triggering native touch behaviour
// (drag, long-press). Only the shell's window-level F4 listener stays live.
export function LockedScreen(): React.JSX.Element {
  return (
    <div
      className={styles.screen}
      onPointerDown={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <h1 className={styles.title}>Pantalla bloqueada</h1>
      <p className={styles.hint}>F4 para desbloquear</p>
    </div>
  )
}
