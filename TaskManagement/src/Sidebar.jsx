import { useUIStore, useModalStore } from '../../store'
import { useTasks } from '../../hooks/useTaskQueries'
import { COLUMN_COLORS } from '../../utils'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'board', label: 'Board', icon: '▦' },
  { id: 'calendar', label: 'Kalender', icon: '◫' },
]

const COLUMNS_META = [
  { id: 'backlog',    label: 'Backlog' },
  { id: 'todo',       label: 'Siap dikerjakan' },
  { id: 'inprogress', label: 'Sedang berjalan' },
  { id: 'review',     label: 'Review' },
  { id: 'done',       label: 'Selesai' },
]

export default function Sidebar() {
  const view = useUIStore((s) => s.view)
  const setView = useUIStore((s) => s.setView)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const openCreate = useModalStore((s) => s.openCreate)
  const { data: tasks = [] } = useTasks()

  const countByCol = COLUMNS_META.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.column === col.id).length
    return acc
  }, {})

  const highPriority = tasks.filter((t) => t.priority === 'high' && t.column !== 'done').length

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.collapsed}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⬡</span>
        {sidebarOpen && <span className={styles.logoText}>TaskBoard</span>}
      </div>

      {/* New Task Button */}
      <button className={styles.newTaskBtn} onClick={() => openCreate()}>
        <span className={styles.plusIcon}>+</span>
        {sidebarOpen && <span>Tugas baru</span>}
      </button>

      {/* Nav */}
      <nav className={styles.nav}>
        {sidebarOpen && <p className={styles.navLabel}>Tampilan</p>}
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${view === item.id ? styles.active : ''}`}
            onClick={() => setView(item.id)}
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Column Progress */}
      {sidebarOpen && (
        <div className={styles.progress}>
          <p className={styles.navLabel}>Status tugas</p>
          {COLUMNS_META.map((col) => (
            <div key={col.id} className={styles.progressItem}>
              <div className={styles.progressDot} style={{ background: COLUMN_COLORS[col.id] }} />
              <span className={styles.progressLabel}>{col.label}</span>
              <span className={styles.progressCount}>{countByCol[col.id]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alert */}
      {sidebarOpen && highPriority > 0 && (
        <div className={styles.alert}>
          <span className={styles.alertDot} />
          <span>{highPriority} tugas prioritas tinggi belum selesai</span>
        </div>
      )}

      {/* Collapse toggle */}
      <button className={styles.collapseBtn} onClick={toggleSidebar} title="Toggle sidebar">
        {sidebarOpen ? '‹' : '›'}
      </button>
    </aside>
  )
}