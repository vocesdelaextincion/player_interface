import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { PlaybackContext } from './playbackContext'

export function PlaybackProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)

  const registerStop = useCallback((fn: (() => void) | null) => {
    stopRef.current = fn
  }, [])

  const requestStop = useCallback(() => {
    stopRef.current?.()
  }, [])

  const value = useMemo(
    () => ({ isPlaying, setIsPlaying, registerStop, requestStop }),
    [isPlaying, registerStop, requestStop]
  )

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
}
