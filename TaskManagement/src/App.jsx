import { useUIStore } from './store'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Sidebar/Header'
import BoardView from './components/Board/BoardView'
import CalendarView from './components/Calendar/CalendarView'
import TaskModal from './components/Modal/TaskModal'
import styles from './App.module.css'

export default function App() {
  const view = useUIStore((s) => s.view)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className={`${styles.app} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          {view === 'board' ? <BoardView /> : <CalendarView />}
        </div>
      </div>
      <TaskModal />
    </div>
  )
}