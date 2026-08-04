import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePlayback } from './usePlayback'
import { IdleScreen } from '../screens/IdleScreen'
import { ActiveScreen } from '../screens/ActiveScreen'
import { AdminScreen } from '../screens/AdminScreen'
import { LockedScreen } from '../screens/LockedScreen'
import { duration, easeCinematic } from '../theme'

type ScreenState = 'idle' | 'active' | 'admin' | 'locked'

// `previous` is what Esc returns to, and it decides where a successful password lands —
// so it has to be state, not a ref: the Admin render reads it.
interface Screen {
  current: ScreenState
  previous: ScreenState
}

const INACTIVITY_TIMEOUT_MS = 45_000

export function AppShell(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>({ current: 'idle', previous: 'idle' })
  const { current: state, previous: previousState } = screen
  const { isPlaying, requestStop } = usePlayback()

  const goTo = useCallback((next: ScreenState) => {
    setScreen((s) => ({ current: next, previous: s.current }))
  }, [])

  // F4 from Locked routes here too, but only as far as the password gate: AdminScreen reads
  // `cameFromLocked` and resolves straight to Idle on success, per ARCHITECTURE.md's direct
  // `Locked --F4+password--> Idle` arrow.
  const openAdmin = useCallback(() => {
    setScreen((s) => (s.current === 'admin' ? s : { current: 'admin', previous: s.current }))
    requestStop()
  }, [requestStop])

  // F4 opens Admin from any state; Esc cancels Admin back to whatever preceded it.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'F4') {
        openAdmin()
      } else if (event.key === 'Escape') {
        setScreen((s) => (s.current === 'admin' ? { current: s.previous, previous: 'admin' } : s))
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [openAdmin])

  // Active -> Idle after 45s with no touch, deferred while a track is playing.
  useEffect(() => {
    if (state !== 'active' || isPlaying) return

    let timer = setTimeout(() => goTo('idle'), INACTIVITY_TIMEOUT_MS)

    function resetTimer(): void {
      clearTimeout(timer)
      timer = setTimeout(() => goTo('idle'), INACTIVITY_TIMEOUT_MS)
    }

    window.addEventListener('pointerdown', resetTimer)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', resetTimer)
    }
  }, [state, isPlaying, goTo])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.state, ease: easeCinematic }}
      >
        {state === 'idle' && <IdleScreen onActivate={() => goTo('active')} />}
        {state === 'active' && <ActiveScreen />}
        {state === 'admin' && (
          <AdminScreen
            cameFromLocked={previousState === 'locked'}
            onUnlock={() => goTo('idle')}
            onLock={() => goTo('locked')}
          />
        )}
        {state === 'locked' && <LockedScreen />}
      </motion.div>
    </AnimatePresence>
  )
}
