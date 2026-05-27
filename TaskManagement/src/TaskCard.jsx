import { useModalStore } from '../../store'
import { useDeleteTask } from '../../hooks/useTaskQueries'
import { formatDate, getDueStatus, TAG_CONFIG, PRIORITY_CONFIG, ASSIGNEE_CONFIG, getChecklistProgress } from '../../utils'
import styles from './TaskCard.module.css'

export default function TaskCard({ task, onDragStart }) {
  const openEdit = useModalStore((s) => s.openEdit)
  const openDetail = useModalStore((s) => s.openDetail)
  const { mutate: deleteTask } = useDeleteTask()

  const tagCfg = TAG_CONFIG[task.tag] || {}
  const priCfg = PRIORITY_CONFIG[task.priority] || {}
  const avCfg = ASSIGNEE_CONFIG[task.assigneeColor] || ASSIGNEE_CONFIG.blue
  const dueStatus = getDueStatus(task.dueDate)
  const progress = getChecklistProgress(task.checklist)

  const dueLabel = getDueStatusLabel(dueStatus, task.dueDate)
  const dueClass = {
    overdue: styles.dueOverdue,
    today: styles.dueToday,
    soon: styles.dueSoon,
    ok: styles.dueOk,
  }[dueStatus] || ''

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm(`Hapus tugas "${task.title}"?`)) deleteTask(task.id)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    openEdit(task)
  }

  return (
    <div
      className={styles.card}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onClick={() => openDetail(task)}
    >
      {/* Tag */}
      <div className={styles.tagRow}>
        <span
          className={styles.tag}
          style={{ color: tagCfg.color, background: tagCfg.bg }}
        >
          {tagCfg.label}
        </span>
        <span
          className={styles.priority}
          style={{ color: priCfg.color, background: priCfg.bg }}
        >
          {priCfg.label}
        </span>
      </div>

      {/* Title */}
      <p className={styles.title}>{task.title}</p>

      {/* Checklist progress */}
      {progress && (
        <div className={styles.checklist}>
          <div className={styles.checklistBar}>
            <div
              className={styles.checklistFill}
              style={{ width: `${progress.pct}%`, background: progress.pct === 100 ? 'var(--col-done)' : 'var(--brand)' }}
            />
          </div>
          <span className={styles.checklistLabel}>{progress.done}/{progress.total}</span>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {task.dueDate && (
            <span className={`${styles.due} ${dueClass}`}>
              {dueLabel}
            </span>
          )}
        </div>
        <div className={styles.footerRight}>
          <button className={styles.actionBtn} onClick={handleEdit} title="Edit">✎</button>
          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={handleDelete} title="Hapus">✕</button>
          <div
            className={styles.avatar}
            style={{ color: avCfg.color, background: avCfg.bg }}
            title={task.assignee}
          >
            {task.assignee}
          </div>
        </div>
      </div>
    </div>
  )
}

function getDueStatusLabel(status, dateStr) {
  if (!status || !dateStr) return null
  const labels = {
    overdue: `⚠ ${formatDate(dateStr)}`,
    today: '⏰ Hari ini',
    soon: `⏳ ${formatDate(dateStr)}`,
    ok: formatDate(dateStr),
  }
  return labels[status]
}