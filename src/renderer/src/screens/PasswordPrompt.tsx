import { useCallback, useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import styles from './PasswordPrompt.module.css'
import { StaffFrame } from './StaffFrame'
import { ADMIN_PIN } from '../admin'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

interface PasswordPromptProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PasswordPrompt({ onSuccess, onCancel }: PasswordPromptProps): React.JSX.Element {
  const [value, setValue] = useState('')
  const shake = useAnimationControls()

  const submit = useCallback(
    (pin: string): void => {
      if (pin === ADMIN_PIN) {
        onSuccess()
        return
      }
      setValue('')
      void shake.start({
        x: [0, -14, 12, -8, 6, 0],
        transition: { duration: 0.4, ease: 'easeInOut' }
      })
    },
    [onSuccess, shake]
  )

  // Entered on the keypad, but a keyboard still works where one happens to be plugged in —
  // staff who learned the old F4-and-type routine don't have to unlearn it. Esc is handled
  // globally by the app shell.
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent): void {
      if (/^\d$/.test(event.key)) setValue((v) => v + event.key)
      else if (event.key === 'Backspace') setValue((v) => v.slice(0, -1))
      else if (event.key === 'Enter') submit(value)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [value, submit])

  return (
    <StaffFrame badge="Panel de administración">
      <motion.div className={styles.form} animate={shake}>
        <h1 className={styles.title}>Contraseña</h1>

        {/* Length only, never the digits — staff enter this in front of visitors. */}
        <div className={styles.dots} aria-label={`${value.length} dígitos ingresados`}>
          {Array.from({ length: Math.max(ADMIN_PIN.length, value.length) }, (_, i) => (
            <span key={i} className={i < value.length ? styles.dotFilled : styles.dot} />
          ))}
        </div>

        <div className={styles.keypad}>
          {KEYS.map((key) => (
            <button
              key={key}
              className={styles.key}
              onClick={() => setValue((v) => v + key)}
              aria-label={key}
            >
              {key}
            </button>
          ))}
          <button
            className={styles.key}
            onClick={() => setValue((v) => v.slice(0, -1))}
            aria-label="Borrar"
          >
            ←
          </button>
          <button className={styles.key} onClick={() => setValue((v) => v + '0')} aria-label="0">
            0
          </button>
          <button
            className={styles.keyConfirm}
            onClick={() => submit(value)}
            aria-label="Confirmar"
          >
            ✓
          </button>
        </div>

        <button className={styles.cancel} onClick={onCancel}>
          Cancelar
        </button>
      </motion.div>
    </StaffFrame>
  )
}
