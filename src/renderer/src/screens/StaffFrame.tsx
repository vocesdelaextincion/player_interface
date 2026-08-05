import type { ReactNode } from 'react'
import styles from './StaffFrame.module.css'
import { adminBackground } from '../content/backgrounds'

interface StaffFrameProps {
  /** Mode marker, top-left. Always present so a staff screen is never mistaken for the exhibit. */
  badge: string
  /** Locked uses this to swallow every touch (screen-cleaning mode). */
  blockTouch?: boolean
  children: ReactNode
}

// Shared chrome for every staff screen — password gate, action menu, locked. One background,
// one veil, one badge, one left-aligned column, so they can't drift apart as any of them changes.
export function StaffFrame({ badge, blockTouch, children }: StaffFrameProps): React.JSX.Element {
  return (
    <div
      className={blockTouch ? styles.screenLocked : styles.screen}
      onPointerDown={blockTouch ? (event) => event.preventDefault() : undefined}
      onContextMenu={blockTouch ? (event) => event.preventDefault() : undefined}
    >
      {adminBackground && (
        <img src={adminBackground} alt="" className={styles.background} decoding="async" />
      )}
      <div className={styles.veil} aria-hidden="true" />

      <div className={styles.badge}>
        <span className={styles.badgeDot} aria-hidden="true" />
        {badge}
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  )
}
