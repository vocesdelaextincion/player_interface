import type { ReactNode } from 'react'
import styles from './AdminFrame.module.css'
import { adminBackground } from '../content/backgrounds'

// Shared chrome for both staff screens (password gate and action menu) so they can't drift
// apart: same background, same heavy veil, same badge, same left-aligned column.
export function AdminFrame({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div className={styles.screen}>
      {adminBackground && (
        <img src={adminBackground} alt="" className={styles.background} decoding="async" />
      )}
      <div className={styles.veil} aria-hidden="true" />

      <div className={styles.badge}>
        <span className={styles.badgeDot} aria-hidden="true" />
        Panel de administración
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  )
}
