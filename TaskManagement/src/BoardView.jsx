import { useTasks, useColumns, useMoveTask } from '../../hooks/useTaskQueries'
import { useUIStore } from '../../store'
import { filterTasks, COLUMN_COLORS } from '../../utils'
import Column from './Column'
import styles from './BoardView.module.css'

export default function BoardView() {
  const { data: tasks = [], isLoading, isError } = useTasks()
  const { data: columns = [] } = useColumns()
  const filter = useUIStore((s) => s.filter)
  const { mutate: moveTask } = useMoveTask()
  const { draggingCardId, dragOverColumn, setDraggingCard, setDragOverColumn, clearDrag } = useUIStore()

  const filteredTasks = filterTasks(tasks, filter)

  const handleDragStart = (cardId) => setDraggingCard(cardId)
  const handleDragOver = (colId) => setDragOverColumn(colId)
  const handleDrop = (colId) => {
    if (draggingCardId) {
      const task = tasks.find((t) => t.id === draggingCardId)
      if (task && task.column !== colId) {
        moveTask({ id: draggingCardId, column: colId })
      }
    }
    clearDrag()
  }

  if (isLoading) return (
    <div className={styles.state}>
      <div className={styles.spinner} />
      <p>Memuat tugas dari server...</p>
    </div>
  )

  if (isError) return (
    <div className={styles.state}>
      <p className={styles.error}>⚠ Gagal memuat data. Pastikan json-server berjalan di port 3001.</p>
      <code className={styles.code}>npm run server</code>
    </div>
  )

  return (
    <div className={styles.board}>
      {columns.map((col) => (
        <Column
          key={col.id}
          column={col}
          tasks={filteredTasks.filter((t) => t.column === col.id)}
          accentColor={COLUMN_COLORS[col.id]}
          isDragOver={dragOverColumn === col.id}
          onDragOver={() => handleDragOver(col.id)}
          onDrop={() => handleDrop(col.id)}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  )
}