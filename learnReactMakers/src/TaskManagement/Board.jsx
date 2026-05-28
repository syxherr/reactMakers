import { useState, useRef, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useTaskStore from './useTaskStore'
import styles from './Board.module.css'
import { Helmet } from "react-helmet-async";

const COLUMNS = [
  { id: 'todo',  label: 'To Do',         dot: '#888' },
  { id: 'doing', label: 'In Progress', dot: '#f59e0b' },
  { id: 'done',  label: 'Done',         dot: '#22c55e' },
]

const PRIORITIES = ['High', 'Medium', 'Low']
const CATEGORIES = ['UI/UX', 'React.js', 'FrontEnd', 'Read Book', 'Other']

const CAT_CLASS = {
  'UI/UX': styles.categoryUIUX, 'React.js': styles.categoryReact,
  'FrontEnd': styles.categoryFrontend, 'Read Book': styles.categoryRead,
  'Other': styles.categoryOther,
}

function deadlineStatus(dl) {
  if (!dl) return null
  const diff = Math.ceil((new Date(dl) - new Date()) / 86400000)
  if (diff < 0)  return { label: 'Overdue', cls: styles.deadlineOverdue }
  if (diff <= 2) return { label: diff === 0 ? 'Today' : `${diff} days left`, cls: styles.deadlineSoon }
  return { label: `${diff} days left`, cls: '' }
}

function TaskModal({ initial, colId, onSave, onClose }) {
  const [form, setForm] = useState({
    title:    initial?.title    ?? '',
    note:     initial?.note     ?? '',
    category: initial?.category ?? 'Other',
    priority: initial?.priority ?? 'Medium',
    deadline: initial?.deadline ?? '',
  })
  const inputRef = useRef()
  useEffect(() => { inputRef.current?.focus() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) { inputRef.current?.focus(); return }
    onSave({ ...form, title: form.title.trim(), col: colId ?? initial?.col })
  }

  return (
    <div className={styles.page}>
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h3>{initial ? 'Edit Task' : 'Add Task'}</h3>

        <label>Add Task</label>
        <input ref={inputRef} value={form.title} placeholder="What task do you want to do?"
          onChange={(e) => set('title', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()} />

        <label>Notes (optional)</label>
        <textarea value={form.note} placeholder="Additional details..."
          onChange={(e) => set('note', e.target.value)} />

        <div className={styles.row2}>
          <div>
            <label>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>piority</label>
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <label style={{ marginTop: 12 }}>Deadline</label>
        <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />

        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSave}>{initial ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────
function TaskCard({ task, colIndex }) {
  const editTask   = useTaskStore((state) => state.editTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const moveTask   = useTaskStore((state) => state.moveTask)
  const [editing, setEditing] = useState(false)

  const dl = deadlineStatus(task.deadline)

  return (
    <>
      <div className={styles.card}>
        <span className={`${styles.cardCategory} ${CAT_CLASS[task.category] ?? styles.categoryOther}`}>
          {task.category}
        </span>
        <div className={task.col === 'done' ? `${styles.cardTitle} ${styles.cardTitleDone}` : styles.cardTitle}>
          {task.title}
        </div>
        {task.note && <div className={styles.cardNote}>{task.note}</div>}

        <div className={styles.cardFooter}>
          {dl ? (
            <span className={`${styles.deadline} ${dl.cls}`}>● {dl.label}</span>
          ) : (
            <span />
          )}
          <div className={styles.cardActions}>
            {colIndex > 0 && (
              <button className={styles.iconBtn} title="Move Left" onClick={() => moveTask(task.id, -1)}>←</button>
            )}
            {colIndex < 2 && (
              <button className={styles.iconBtn} title="Move Right" onClick={() => moveTask(task.id, 1)}>→</button>
            )}
            <button className={styles.iconBtn} title="Edit" onClick={() => setEditing(true)}>✎</button>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={() => deleteTask(task.id)}>✕</button>
          </div>
        </div>
      </div>

      {editing && (
        <TaskModal initial={task}
          onSave={(patch) => { editTask(task.id, patch); setEditing(false) }}
          onClose={() => setEditing(false)} />
      )}
    </>
  )
}

// ── Column ─────────────────────────────────────────────
function Column({ col, colIndex, filteredTasks }) {
  const addTask = useTaskStore((state) => state.addTask)
  const [adding, setAdding] = useState(false)
  const tasks = filteredTasks.filter((t) => t.col === col.id)

  return (
    <>
      <div className={styles.column}>
        <div className={styles.colHeader}>
          <div className={styles.colLeft}>
            <span className={styles.colDot} style={{ background: col.dot }} />
            <span className={styles.colTitle}>{col.label}</span>
            <span className={styles.colBadge}>{tasks.length}</span>
          </div>
        </div>

        {tasks.length === 0 && <div className={styles.emptyState}>No tasks available</div>}
        {tasks.map((t) => <TaskCard key={t.id} task={t} colIndex={colIndex} />)}

        <button className={styles.addBtn} onClick={() => setAdding(true)}>+ Add Task</button>
      </div>

      {adding && (
        <TaskModal colId={col.id}
          onSave={(data) => { addTask(data); setAdding(false) }}
          onClose={() => setAdding(false)} />
      )}
    </>
  )
}

export default function Board() {
  const { search, priority, setSearch, setPriority, getFiltered } = useTaskStore(
    useShallow((state) => ({
      search: state.search, priority: state.priority,
      setSearch: state.setSearch, setPriority: state.setPriority, getFiltered: state.getFiltered,
    }))
  )

  const tasks    = useTaskStore(useShallow((state) => state.tasks))
  const filtered = getFiltered() 

  const total   = tasks.length
  const doing   = tasks.filter((t) => t.col === 'doing').length
  const done    = tasks.filter((t) => t.col === 'done').length
  const high  = tasks.filter((t) => t.priority === 'High').length

  const PRIORITY_BTNS = [
    { key: 'all',  label: 'All', dot: styles.dotAll },
    { key: 'High',   label: 'High',   dot: styles.dotHigh },
    { key: 'Medium', label: 'Medium', dot: styles.dotMedium },
    { key: 'Low',    label: 'Low',    dot: styles.dotLow },
  ]

  return (
    <>
    <Helmet>
            <title>Tast Management</title>
            <meta
              name="description"
              content="Manage your messy tasks "
            />
            <meta property="og:title" content="Luxora Shop — Electronics & Accessories" />
            <meta
              property="og:description"
              content="Shop the latest electronics and accessories at Luxora."
            />
            <meta property="og:type" content="website" />
            <link rel="canonical" href="https://board" />
          </Helmet>
    <div className={styles.board}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input className={styles.searchInput} value={search}
            onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
        </div>
        {PRIORITY_BTNS.map((b) => (
          <button key={b.key}
            className={`${styles.filterBtn} ${priority === b.key ? styles.filterBtnActive : ''}`}
            style={priority === b.key && b.bg ? { background: '#e8e8e8', color: '#0f0f0f' } : {}}
            onClick={() => setPriority(b.key)}>
            {b.dot && <span className={`${styles.dot} ${b.dot}`} />}
            {b.label}
          </button>
        ))}
      </div>

      <div className={styles.statsBar}>
        <span><strong>{total}</strong> total tasks</span>
        <span><strong>{doing}</strong> in progress</span>
        <span><strong>{done}</strong> completed</span>
        <span><strong>{high}</strong> high priority</span>
        
      </div>

     <div className={styles.columns}>
        {COLUMNS.map((col, i) => (
          <Column key={col.id} col={col} colIndex={i} filteredTasks={filtered} />
        ))}
      </div>
    </div>
    </>
  );
}