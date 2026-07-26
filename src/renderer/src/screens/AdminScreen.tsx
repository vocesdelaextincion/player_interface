import styles from './placeholder.module.css'

// Real password prompt + Close/Restart/Lock actions land in Stage 6.
// The "Bloquear" button here only exists so Locked is reachable to test in Stage 3.
export function AdminScreen({ onLock }: { onLock: () => void }): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Admin</h1>
      <p className={styles.subtitle}>Esc para cancelar</p>
      <button className={styles.button} onClick={onLock}>
        Bloquear
      </button>
    </div>
  )
}
