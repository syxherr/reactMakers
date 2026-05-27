import { format, isToday, isTomorrow, isPast, differenceInDays, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export const formatDate = (dateStr) => {
  if (!dateStr) return null
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Hari ini'
  if (isTomorrow(d)) return 'Besok'
  return format(d, 'd MMM yyyy', { locale: localeId })
}

export const getDueStatus = (dateStr) => {
  if (!dateStr) return null
  const d = parseISO(dateStr)
  if (isPast(d) && !isToday(d)) return 'overdue'
  if (isToday(d)) return 'today'
  if (differenceInDays(d, new Date()) <= 2) return 'soon'
  return 'ok'
}

export const PRIORITY_CONFIG = {
  high: { label: 'Tinggi', color: 'var(--priority-high)', bg: 'var(--priority-high-bg)' },
  med:  { label: 'Sedang', color: 'var(--priority-med)',  bg: 'var(--priority-med-bg)'  },
  low:  { label: 'Rendah', color: 'var(--priority-low)',  bg: 'var(--priority-low-bg)'  },
}

export const TAG_CONFIG = {
  'tag-blue':   { label: 'Desain',    color: 'var(--tag-blue)',   bg: 'var(--tag-blue-bg)'   },
  'tag-teal':   { label: 'Backend',   color: 'var(--tag-teal)',   bg: 'var(--tag-teal-bg)'   },
  'tag-coral':  { label: 'Frontend',  color: 'var(--tag-coral)',  bg: 'var(--tag-coral-bg)'  },
  'tag-amber':  { label: 'Riset',     color: 'var(--tag-amber)',  bg: 'var(--tag-amber-bg)'  },
  'tag-purple': { label: 'Fitur',     color: 'var(--tag-purple)', bg: 'var(--tag-purple-bg)' },
  'tag-red':    { label: 'Bug',       color: 'var(--tag-red)',    bg: 'var(--tag-red-bg)'    },
  'tag-green':  { label: 'Selesai',   color: 'var(--tag-green)',  bg: 'var(--tag-green-bg)'  },
}

export const ASSIGNEE_CONFIG = {
  blue:   { color: 'var(--av-blue)',   bg: 'var(--av-blue-bg)'   },
  teal:   { color: 'var(--av-teal)',   bg: 'var(--av-teal-bg)'   },
  coral:  { color: 'var(--av-coral)',  bg: 'var(--av-coral-bg)'  },
  purple: { color: 'var(--av-purple)', bg: 'var(--av-purple-bg)' },
}

export const COLUMN_COLORS = {
  backlog:    'var(--col-backlog)',
  todo:       'var(--col-todo)',
  inprogress: 'var(--col-inprogress)',
  review:     'var(--col-review)',
  done:       'var(--col-done)',
}

export const filterTasks = (tasks, filter) => {
  if (!tasks) return []
  return tasks.filter((t) => {
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false
    if (filter.assignee !== 'all' && t.assignee !== filter.assignee) return false
    if (filter.tag !== 'all' && t.tag !== filter.tag) return false
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })
}

export const getChecklistProgress = (checklist) => {
  if (!checklist?.length) return null
  const done = checklist.filter((c) => c.done).length
  return { done, total: checklist.length, pct: Math.round((done / checklist.length) * 100) }
}

export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`