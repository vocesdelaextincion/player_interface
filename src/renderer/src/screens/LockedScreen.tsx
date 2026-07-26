import styles from './placeholder.module.css'

// No touch handlers by design — locked ignores all touch, only the shell's F4 listener reaches it.
export function LockedScreen(): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Bloqueado</h1>
      <p className={styles.subtitle}>F4 para desbloquear</p>
    </div>
  )
}
