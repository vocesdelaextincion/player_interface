import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import styles from './PasswordPrompt.module.css'
import { StaffFrame } from './StaffFrame'
import { ADMIN_PASSWORD } from '../admin'

export function PasswordPrompt({ onSuccess }: { onSuccess: () => void }): React.JSX.Element {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const shake = useAnimationControls()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault()
    if (value === ADMIN_PASSWORD) {
      onSuccess()
      return
    }
    setValue('')
    void shake.start({
      x: [0, -14, 12, -8, 6, 0],
      transition: { duration: 0.4, ease: 'easeInOut' }
    })
  }

  return (
    <StaffFrame badge="Panel de administración">
      <motion.form className={styles.form} animate={shake} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Contraseña</h1>
        <input
          ref={inputRef}
          className={styles.input}
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          // A stray visitor touch must not leave staff typing into nothing.
          onBlur={() => inputRef.current?.focus()}
          aria-label="Contraseña"
        />
        <p className={styles.hint}>Intro para confirmar · Esc para cancelar</p>
      </motion.form>
    </StaffFrame>
  )
}
