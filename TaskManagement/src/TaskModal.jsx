import { useState, useEffect } from 'react'
import { useModalStore } from '../../store'
import { useCreateTask, useUpdateTask, useDeleteTask, useMembers } from '../../hooks/useTaskQueries'
import { TAG_CONFIG, PRIORITY_CONFIG, ASSIGNEE_CONFIG, generateId } from '../../utils'
import styles from './TaskModal.module.css'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Siap dikerjakan' },
  { id: 'inprogress', label: 'Sedang berjalan' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Selesai' },
]

const EMPTY_FORM = {
  title: '', description: '', column: 'todo',
  priority: 'med', tag: 'tag-blue', tagLabel: 'Desain',
  assignee: 'AR', assigneeColor: 'blue', dueDate: '',
  checklist: [],
}

export default function TaskModal() {
  const { isOpen, mode, defaultColumn, editingTask, close, openEdit } = useModalStore()
  const { data: members = [] } = useMembers()
  const { mutate: createTask, isPending: creating } = useCreateTask()
  const { mutate: updateTask, isPending: updating } = useUpdateTask()
  const { mutate: deleteTask } = useDeleteTask()

  const [form, setForm] = useState(EMPTY_FORM)
  const [newCheckItem, setNewCheckItem] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (mode === 'create') {
      setForm({ ...EMPTY_FORM, column: defaultColumn })
    } else if (editingTask) {
      setForm({
        title: editingTask.title ?? '',
        description: editingTask.description ?? '',
        column: editingTask.column ?? 'todo',
        priority: editingTask.priority ?? 'med',
        tag: editingTask.tag ?? 'tag-blue',
        tagLabel: editingTask.tagLabel ?? 'Desain',
        assignee: editingTask.assignee ?? 'AR',
        assigneeColor: editingTask.assigneeColor ?? 'blue',
        dueDate: editingTask.dueDate ?? '',
        checklist: editingTask.checklist ?? [],
      })
    }
  }, [isOpen, mode, defaultColumn, editingTask])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleTagChange = (e) => {
    const tag = e.target.value
    set('tag', tag)
    set('tagLabel', TAG_CONFIG[tag]?.label ?? '')
  }

  const handleAssigneeChange = (e) => {
    const member = members.find((m) => m.id === e.target.value)
    if (member) {
      set('assignee', member.id)
      set('assigneeColor', member.color)
    }
  }

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return
    set('checklist', [...form.checklist, { id: generateId(), text: newCheckItem.trim(), done: false }])
    setNewCheckItem('')
  }

  const toggleCheck = (id) => {
    set('checklist', form.checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c))
  }

  const removeCheck = (id) => {
    set('checklist', form.checklist.filter((c) => c.id !== id))
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    const payload = { ...form }
    if (mode === 'create') {
      createTask(payload, { onSuccess: close })
    } else {
      updateTask({ id: editingTask.id, ...payload }, { onSuccess: close })
    }
  }

  const handleDelete = () => {
    if (!editingTask) return
    if (confirm(`Hapus tugas "${editingTask.title}"?`)) {
      deleteTask(editingTask.id, { onSuccess: close })
    }
  }

  if (!isOpen) return null

  const isDetail = mode === 'detail'
  const isEditing = mode === 'edit' || mode === 'create'
  const task = editingTask
  const tagCfg = TAG_CONFIG[form.tag]
  const priCfg = PRIORITY_CONFIG[form.priority]
  const avCfg = ASSIGNEE_CONFIG[form.assigneeColor] || ASSIGNEE_CONFIG.blue
  const progress = form.checklist.length
    ? { done: form.checklist.filter((c) => c.done).length, total: form.checklist.length }
    : null

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={styles.modal}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {isDetail ? (
              <>
                <span className={styles.tagBadge} style={{ color: tagCfg?.color, background: tagCfg?.bg }}>
                  {TAG_CONFIG[task?.tag]?.label}
                </span>
                <span className={styles.priBadge} style={{ color: priCfg?.color, background: priCfg?.bg }}>
                  {PRIORITY_CONFIG[task?.priority]?.label}
                </span>
              </>
            ) : (
              <h2 className={styles.modalTitle}>
                {mode === 'create' ? 'Tugas baru' : 'Edit tugas'}
              </h2>
            )}
          </div>
          <div className={styles.headerRight}>
            {isDetail && (
              <button className={styles.editBtn} onClick={() => openEdit(task)}>Edit</button>
            )}
            {!isDetail && editingTask && (
              <button className={styles.deleteBtn} onClick={handleDelete}>Hapus</button>
            )}
            <button className={styles.closeBtn} onClick={close}>✕</button>
          </div>
        </div>

        <div className={styles.body}>
          {/* Detail view */}
          {isDetail && task && (
            <>
              <h2 className={styles.detailTitle}>{task.title}</h2>
              {task.description && <p className={styles.detailDesc}>{task.description}</p>}

              <div className={styles.metaGrid}>
                <MetaRow label="Kolom" value={COLUMNS.find((c) => c.id === task.column)?.label} />
                <MetaRow label="Assignee">
                  <div className={styles.avatarInline} style={{ color: avCfg.color, background: avCfg.bg }}>
                    {task.assignee}
                  </div>
                  <span>{members.find((m) => m.id === task.assignee)?.name}</span>
                </MetaRow>
                {task.dueDate && <MetaRow label="Jatuh tempo" value={task.dueDate} />}
              </div>

              {task.checklist?.length > 0 && (
                <div className={styles.checkSection}>
                  <div className={styles.checkHeader}>
                    <span className={styles.checkLabel}>Checklist</span>
                    {progress && (
                      <span className={styles.checkProgress}>{progress.done}/{progress.total}</span>
                    )}
                  </div>
                  {progress && (
                    <div className={styles.checkBar}>
                      <div className={styles.checkFill} style={{ width: `${Math.round(progress.done / progress.total * 100)}%` }} />
                    </div>
                  )}
                  <div className={styles.checkList}>
                    {task.checklist.map((item) => (
                      <div key={item.id} className={`${styles.checkItem} ${item.done ? styles.checkDone : ''}`}>
                        <span className={styles.checkIcon}>{item.done ? '☑' : '☐'}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit / Create form */}
          {isEditing && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Judul tugas *</label>
                <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Contoh: Desain halaman login"
                  autoFocus
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Deskripsi</label>
                <textarea
                  className={styles.textarea}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Detail lebih lanjut tentang tugas ini..."
                  rows={3}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Kolom</label>
                  <select className={styles.select} value={form.column} onChange={(e) => set('column', e.target.value)}>
                    {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Prioritas</label>
                  <select className={styles.select} value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Label</label>
                  <select className={styles.select} value={form.tag} onChange={handleTagChange}>
                    {Object.entries(TAG_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Assignee</label>
                  <select className={styles.select} value={form.assignee} onChange={handleAssigneeChange}>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.id} — {m.name.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Jatuh tempo</label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                />
              </div>

              {/* Checklist */}
              <div className={styles.field}>
                <label className={styles.label}>Checklist</label>
                {form.checklist.map((item) => (
                  <div key={item.id} className={styles.checkEditItem}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleCheck(item.id)}
                      className={styles.checkbox}
                    />
                    <span className={`${styles.checkText} ${item.done ? styles.checkDone : ''}`}>{item.text}</span>
                    <button className={styles.removeCheck} onClick={() => removeCheck(item.id)}>✕</button>
                  </div>
                ))}
                <div className={styles.addCheck}>
                  <input
                    className={styles.input}
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    placeholder="Tambah item checklist..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCheckItem()}
                  />
                  <button className={styles.addCheckBtn} onClick={handleAddCheckItem}>+</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={close}>Batal</button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={creating || updating || !form.title.trim()}
            >
              {creating || updating ? 'Menyimpan...' : mode === 'create' ? 'Buat tugas' : 'Simpan perubahan'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MetaRow({ label, value, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 80, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {value || children}
      </span>
    </div>
  )
}