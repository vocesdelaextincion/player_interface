import styles from './placeholder.module.css'
import { recordings } from '../content/recordings'

export function ActiveScreen(): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Explorar</h1>
      <p className={styles.subtitle}>{recordings.length} grabaciones cargadas</p>
    </div>
  )
}
