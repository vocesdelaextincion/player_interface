import styles from './ActiveTagFilter.module.css'

interface ActiveTagFilterProps {
  tags: string[]
  active: string | null
  onSelect: (tag: string | null) => void
}

export function ActiveTagFilter({
  tags,
  active,
  onSelect
}: ActiveTagFilterProps): React.JSX.Element {
  return (
    <div className={styles.row}>
      <button
        className={`${styles.chip} ${active === null ? styles.chipActive : ''}`}
        onClick={() => onSelect(null)}
      >
        Todos
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.chip} ${active === tag ? styles.chipActive : ''}`}
          onClick={() => onSelect(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
