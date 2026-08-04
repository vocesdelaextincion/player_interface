import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import styles from './PasswordPrompt.module.css'
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
    <div className={styles.screen}>
      <motion.form className={styles.card} animate={shake} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Modo administrador</h1>
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
    </div>
  )
}
