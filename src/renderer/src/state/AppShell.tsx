import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePlayback } from './usePlayback'
import { IdleScreen } from '../screens/IdleScreen'
import { RecommendationsScreen } from '../screens/RecommendationsScreen'
import { ActiveScreen } from '../screens/ActiveScreen'
import { FarewellScreen } from '../screens/FarewellScreen'
import { AdminScreen } from '../screens/AdminScreen'
import { LockedScreen } from '../screens/LockedScreen'
import { duration, easeCinematic } from '../theme'

type ScreenState = 'idle' | 'recommendations' | 'active' | 'farewell' | 'admin' | 'locked'

// `previous` is what Esc returns to, and it decides where a successful password lands —
// so it has to be state, not a ref: the Admin render reads it.
interface Screen {
  current: ScreenState
  previous: ScreenState
}

const INACTIVITY_TIMEOUT_MS = 45_000

// The cap on a single visit. Unlike the inactivity timeout this one cannot be reset, deferred or
// touched away — it is what keeps one visitor from holding the exhibit for an afternoon.
const VISIT_LIMIT_MS = 90_000

// The kiosk ships without a keyboard, so Admin needs a touch way in. A long press rather than a
// tap, in one corner rather than anywhere: a visitor has no reason to hold a bare corner of the
// screen for three seconds, and staff can be told where it is in one sentence.
const ADMIN_HOLD_MS = 3_000
const ADMIN_CORNER = 0.12

export function AppShell(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>({ current: 'idle', previous: 'idle' })
  const { current: state, previous: previousState } = screen
  const { isPlaying, requestStop } = usePlayback()

  const goTo = useCallback((next: ScreenState) => {
    setScreen((s) => ({ current: next, previous: s.current }))
  }, [])

  // Stable so the interstitials' hold timers aren't restarted by an unrelated re-render.
  const goToRecommendations = useCallback(() => goTo('recommendations'), [goTo])
  const goToActive = useCallback(() => goTo('active'), [goTo])
  const goToIdle = useCallback(() => goTo('idle'), [goTo])

  const cancelAdmin = useCallback(() => {
    setScreen((s) => (s.current === 'admin' ? { current: s.previous, previous: 'admin' } : s))
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
        cancelAdmin()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [openAdmin, cancelAdmin])

  // Listened for on the window rather than rendered as a hotspot element, deliberately: an
  // element on top would swallow the corner, and Locked stops touches at its own frame
  // (StaffFrame) — preventDefault there doesn't stop the event reaching this listener, so the
  // one screen that has to be unlockable without a keyboard still is.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function cancelHold(): void {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
    }

    function handlePointerDown(event: PointerEvent): void {
      const inCorner =
        event.clientX < window.innerWidth * ADMIN_CORNER &&
        event.clientY > window.innerHeight * (1 - ADMIN_CORNER)
      if (!inCorner) return
      cancelHold()
      timer = setTimeout(openAdmin, ADMIN_HOLD_MS)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', cancelHold)
    window.addEventListener('pointercancel', cancelHold)
    return () => {
      cancelHold()
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', cancelHold)
      window.removeEventListener('pointercancel', cancelHold)
    }
  }, [openAdmin])

  // Active -> Farewell 90s after the station screen appears, whatever the visitor is doing.
  // Deliberately none of the things the inactivity timer below is: no pointer reset, no deferral
  // while audio plays. It is also what makes that deferral safe — sounds loop now, so without a
  // hard cap above it a single playing station would hold Idle off indefinitely.
  useEffect(() => {
    if (state !== 'active') return

    const timer = setTimeout(() => {
      requestStop()
      goTo('farewell')
    }, VISIT_LIMIT_MS)

    return () => clearTimeout(timer)
  }, [state, goTo, requestStop])

  // Active -> Idle after 45s with no touch, deferred while a sound is playing.
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
        {state === 'idle' && <IdleScreen onActivate={goToRecommendations} />}
        {state === 'recommendations' && <RecommendationsScreen onDone={goToActive} />}
        {state === 'active' && <ActiveScreen />}
        {state === 'farewell' && <FarewellScreen onDone={goToIdle} />}
        {state === 'admin' && (
          <AdminScreen
            cameFromLocked={previousState === 'locked'}
            onUnlock={() => goTo('idle')}
            onLock={() => goTo('locked')}
            onCancel={cancelAdmin}
          />
        )}
        {state === 'locked' && <LockedScreen />}
      </motion.div>
    </AnimatePresence>
  )
}
