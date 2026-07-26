import styles from './App.module.css'
import { recordings } from './content/recordings'

function App(): React.JSX.Element {
  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Voces de la Extinción</h1>
      <p className={styles.subtitle}>Stage 2 — {recordings.length} recordings loaded</p>
    </div>
  )
}

export default App
