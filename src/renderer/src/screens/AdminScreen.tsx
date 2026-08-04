import { useState } from 'react'
import styles from './AdminScreen.module.css'
import { PasswordPrompt } from './PasswordPrompt'

interface AdminScreenProps {
  cameFromLocked: boolean
  onUnlock: () => void
  onLock: () => void
}

export function AdminScreen({
  cameFromLocked,
  onUnlock,
  onLock
}: AdminScreenProps): React.JSX.Element {
  const [authenticated, setAuthenticated] = useState(false)

  function handleSuccess(): void {
    // ARCHITECTURE.md: `Locked --F4+password--> Idle` is a direct arrow — unlocking resumes
    // normal operation rather than dropping staff on the action menu. F4 reopens it if needed.
    if (cameFromLocked) onUnlock()
    else setAuthenticated(true)
  }

  if (!authenticated) return <PasswordPrompt onSuccess={handleSuccess} />

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Modo administrador</h1>
      <div className={styles.actions}>
        <button className={styles.button} onClick={onLock}>
          Bloquear pantalla
        </button>
        <button className={styles.button} onClick={() => window.api.restartApp()}>
          Reiniciar aplicación
        </button>
        <button className={styles.buttonDanger} onClick={() => window.api.quitApp()}>
          Cerrar aplicación
        </button>
      </div>
      <p className={styles.hint}>Esc para volver</p>
    </div>
  )
}
