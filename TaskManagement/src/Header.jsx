import { useUIStore } from '../../store'
import { useTasks, useMembers } from '../../hooks/useTaskQueries'
import { TAG_CONFIG } from '../../utils'
import styles from './Header.module.css'

export default function Header() {
  const view = useUIStore((state) => state.view)
  const filter = useUIStore((state) => state.filter)
  const setFilter = useUIStore((state) => state.setFilter)
  const resetFilters = useUIStore((state) => state.resetFilters)
  const { data: tasks = [] } = useTasks()
  const { data: members = [] } = useMembers()

  const activeFilters = [
    filter.priority !== 'all',
    filter.assignee !== 'all',
    filter.tag !== 'all',
    filter.search !== '',
  ].filter(Boolean).length

  const doneCount = tasks.filter((t) => t.column === 'done').length
  const totalCount = tasks.length

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Project Alpha</h1>
          <span className={styles.badge}>{doneCount}/{totalCount} selesai</span>
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            className={styles.search}
            placeholder="Cari tugas..."
            value={filter.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filters}>
        {/* Priority filter */}
        <select
          className={styles.select}
          value={filter.priority}
          onChange={(e) => setFilter('priority', e.target.value)}
        >
          <option value="all">Semua prioritas</option>
          <option value="high">🔴 Tinggi</option>
          <option value="med">🟡 Sedang</option>
          <option value="low">🟢 Rendah</option>
        </select>

        {/* Assignee filter */}
        <select
          className={styles.select}
          value={filter.assignee}
          onChange={(e) => setFilter('assignee', e.target.value)}
        >
          <option value="all">Semua anggota</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.id} — {m.name.split(' ')[0]}</option>
          ))}
        </select>

        {/* Tag filter */}
        <select
          className={styles.select}
          value={filter.tag}
          onChange={(e) => setFilter('tag', e.target.value)}
        >
          <option value="all">Semua label</option>
          {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        {activeFilters > 0 && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            Reset ({activeFilters})
          </button>
        )}
      </div>
    </header>
  )
}