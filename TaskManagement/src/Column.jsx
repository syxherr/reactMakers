import { useModalStore } from '../../store'
import TaskCard from '../Card/TaskCard'
import styles from './Column.module.css'

export default function Column({ column, tasks, accentColor, isDragOver, onDragOver, onDrop, onDragStart }) {
  const openCreate = useModalStore((s) => s.openCreate)

  const handleDragOver = (e) => {
    e.preventDefault()
    onDragOver()
  }

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onDrop(null)
      }}
    >
      {/* Column header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.dot} style={{ background: accentColor }} />
          <span className={styles.title}>{column.title}</span>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => openCreate(column.id)}
          title="Tambah tugas"
        >
          +
        </button>
      </div>

      {/* Drop indicator */}
      {isDragOver && <div className={styles.dropIndicator} style={{ borderColor: accentColor }} />}

      {/* Cards */}
      <div className={styles.cards}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={() => onDragStart(task.id)}
          />
        ))}

        {tasks.length === 0 && (
          <div className={styles.empty}>
            <span>Tidak ada tugas</span>
          </div>
        )}
      </div>

      {/* Add task button */}
      <button className={styles.addTaskBtn} onClick={() => openCreate(column.id)}>
        <span>+</span> Tambah tugas
      </button>
    </div>
  )
}