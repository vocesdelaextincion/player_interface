import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePlayback } from './usePlayback'
import { IdleScreen } from '../screens/IdleScreen'
import { ActiveScreen } from '../screens/ActiveScreen'
import { AdminScreen } from '../screens/AdminScreen'
import { LockedScreen } from '../screens/LockedScreen'
import { duration, easeCinematic } from '../theme'

type ScreenState = 'idle' | 'active' | 'admin' | 'locked'

const INACTIVITY_TIMEOUT_MS = 45_000

export function AppShell(): React.JSX.Element {
  const [state, setState] = useState<ScreenState>('idle')
  const previousStateRef = useRef<ScreenState>('idle')
  const { isPlaying, requestStop } = usePlayback()

  // F4 from Locked also routes here (into 'admin'), landing on the same Close/Restart/Lock
  // menu as F4 from Idle/Active. ARCHITECTURE.md's diagram draws Locked's unlock as a direct
  // arrow to Idle instead — open question for Stage 6 (password prompt) whether that means
  // "skip the menu, auto-resolve to Idle" or is just diagram shorthand. See STAGES.md Stage 6.
  const openAdmin = useCallback(() => {
    setState((current) => {
      if (current === 'admin') return current
      previousStateRef.current = current
      return 'admin'
    })
    requestStop()
  }, [requestStop])

  // F4 opens Admin from any state; Esc cancels Admin back to whatever preceded it.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'F4') {
        openAdmin()
      } else if (event.key === 'Escape') {
        setState((current) => (current === 'admin' ? previousStateRef.current : current))
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [openAdmin])

  // Active -> Idle after 45s with no touch, deferred while a track is playing.
  useEffect(() => {
    if (state !== 'active' || isPlaying) return

    let timer = setTimeout(() => setState('idle'), INACTIVITY_TIMEOUT_MS)

    function resetTimer(): void {
      clearTimeout(timer)
      timer = setTimeout(() => setState('idle'), INACTIVITY_TIMEOUT_MS)
    }

    window.addEventListener('pointerdown', resetTimer)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', resetTimer)
    }
  }, [state, isPlaying])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.state, ease: easeCinematic }}
      >
        {state === 'idle' && <IdleScreen onActivate={() => setState('active')} />}
        {state === 'active' && <ActiveScreen />}
        {state === 'admin' && <AdminScreen onLock={() => setState('locked')} />}
        {state === 'locked' && <LockedScreen />}
      </motion.div>
    </AnimatePresence>
  )
}
