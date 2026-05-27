import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  isSameDay, addMonths, subMonths, parseISO
} from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { useTasks } from '../../hooks/useTaskQueries'
import { useUIStore, useModalStore } from '../../store'
import { TAG_CONFIG, PRIORITY_CONFIG } from '../../utils'
import styles from './CalendarView.module.css'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function CalendarView() {
  const calendarMonth = useUIStore((s) => s.calendarMonth)
  const setCalendarMonth = useUIStore((s) => s.setCalendarMonth)
  const openDetail = useModalStore((s) => s.openDetail)
  const openCreate = useModalStore((s) => s.openCreate)
  const { data: tasks = [] } = useTasks()
  const [selectedDay, setSelectedDay] = useState(null)

  const current = new Date(calendarMonth)
  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const tasksForDay = (date) =>
    tasks.filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), date))

  const selectedTasks = selectedDay ? tasksForDay(selectedDay) : []

  return (
    <div className={styles.wrapper}>
      <div className={styles.calendar}>
        {/* Nav */}
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={() => setCalendarMonth(subMonths(current, 1).toISOString())}>‹</button>
          <h2 className={styles.monthTitle}>
            {format(current, 'MMMM yyyy', { locale: localeId })}
          </h2>
          <button className={styles.navBtn} onClick={() => setCalendarMonth(addMonths(current, 1).toISOString())}>›</button>
          <button className={styles.todayBtn} onClick={() => setCalendarMonth(new Date().toISOString())}>
            Hari ini
          </button>
        </div>

        {/* Day names */}
        <div className={styles.dayNames}>
          {DAYS.map((d) => <span key={d} className={styles.dayName}>{d}</span>)}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {days.map((day) => {
            const dayTasks = tasksForDay(day)
            const isCurrentMonth = isSameMonth(day, current)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            return (
              <div
                key={day.toISOString()}
                className={`${styles.cell}
                  ${!isCurrentMonth ? styles.otherMonth : ''}
                  ${isToday(day) ? styles.today : ''}
                  ${isSelected ? styles.selected : ''}`}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
              >
                <span className={styles.dayNum}>{format(day, 'd')}</span>
                <div className={styles.taskDots}>
                  {dayTasks.slice(0, 3).map((t) => {
                    const cfg = TAG_CONFIG[t.tag]
                    return (
                      <span
                        key={t.id}
                        className={styles.dot}
                        style={{ background: cfg?.color ?? 'var(--brand)' }}
                        title={t.title}
                      />
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <span className={styles.more}>+{dayTasks.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail panel */}
      <div className={styles.panel}>
        {selectedDay ? (
          <>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                {format(selectedDay, 'EEEE, d MMMM', { locale: localeId })}
              </h3>
              <button className={styles.addDayBtn} onClick={() => openCreate()}>+ Tambah</button>
            </div>
            {selectedTasks.length === 0 ? (
              <div className={styles.panelEmpty}>Tidak ada tugas jatuh tempo</div>
            ) : (
              <div className={styles.panelTasks}>
                {selectedTasks.map((task) => {
                  const tagCfg = TAG_CONFIG[task.tag]
                  const priCfg = PRIORITY_CONFIG[task.priority]
                  return (
                    <div key={task.id} className={styles.panelTask} onClick={() => openDetail(task)}>
                      <div className={styles.panelTaskAccent} style={{ background: tagCfg?.color }} />
                      <div className={styles.panelTaskBody}>
                        <p className={styles.panelTaskTitle}>{task.title}</p>
                        <div className={styles.panelTaskMeta}>
                          <span style={{ color: tagCfg?.color, fontSize: 11 }}>{tagCfg?.label}</span>
                          <span style={{ color: priCfg?.color, fontSize: 11 }}>● {priCfg?.label}</span>
                          <span className={styles.panelTaskAssignee}>{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className={styles.panelEmpty}>
            <p>Klik tanggal untuk melihat tugas yang jatuh tempo</p>
          </div>
        )}
      </div>
    </div>
  )
}