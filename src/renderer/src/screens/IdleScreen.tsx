import styles from './placeholder.module.css'

export function IdleScreen({ onActivate }: { onActivate: () => void }): React.JSX.Element {
  return (
    <div className={styles.screen} onPointerDown={onActivate}>
      <h1 className={styles.title}>Voces de la Extinción</h1>
      <p className={styles.subtitle}>Toca la pantalla para comenzar</p>
    </div>
  )
}
