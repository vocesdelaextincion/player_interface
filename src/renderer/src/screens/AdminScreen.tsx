import { useState } from 'react'
import styles from './AdminScreen.module.css'
import { StaffFrame } from './StaffFrame'
import { PasswordPrompt } from './PasswordPrompt'

interface AdminScreenProps {
  cameFromLocked: boolean
  onUnlock: () => void
  onLock: () => void
  onCancel: () => void
}

export function AdminScreen({
  cameFromLocked,
  onUnlock,
  onLock,
  onCancel
}: AdminScreenProps): React.JSX.Element {
  const [authenticated, setAuthenticated] = useState(false)

  function handleSuccess(): void {
    // ARCHITECTURE.md: `Locked --F4+password--> Idle` is a direct arrow — unlocking resumes
    // normal operation rather than dropping staff on the action menu. F4 reopens it if needed.
    if (cameFromLocked) onUnlock()
    else setAuthenticated(true)
  }

  if (!authenticated) return <PasswordPrompt onSuccess={handleSuccess} onCancel={onCancel} />

  return (
    <StaffFrame badge="Panel de administración">
      <h1 className={styles.title}>Acciones</h1>
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

      {/* Outside the action group and quieter than it: this leaves the panel rather than doing
          anything on the machine. Esc still does the same for staff with a keyboard. */}
      <button className={styles.back} onClick={onCancel}>
        Volver
      </button>
    </StaffFrame>
  )
}
