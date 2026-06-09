import { useSelector } from "react-redux";
import { useShallow } from "zustand/react/shallow";
import useTaskStore from "../store/useTaskStore";
import styles from "./Board.module.css";

const PURPLE = ["#CECBF6", "#AFA9EC", "#534AB7", "#26215C"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKS = 16;

export default function ProductivityTab() {
  const { doneDates } = useSelector((s) => s.board);
  const tasks = useTaskStore(useShallow((s) => s.tasks));

  const totalDone = Object.values(doneDates).reduce((a, b) => a + b, 0);
  const totalOverdue = tasks.filter((t) => {
    if (!t.deadline || t.col === "done") return false;
    return new Date(t.deadline) < new Date();
  }).length;

  const today = new Date();
  const totalDays = WEEKS * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const emptyColor = isDark ? "#21262d" : "#ebedf0";

  const cells = [];
  const monthSpans = [];
  let lastMonth = -1;

  for (let w = 0; w < WEEKS; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + w * 7);
    const mo = weekStart.getMonth();
    monthSpans.push(mo !== lastMonth ? MONTHS[mo] : "");
    lastMonth = mo;

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);
      const key = date.toISOString().slice(0, 10);
      const val = doneDates[key] || 0;
      cells.push({ key, val, date });
    }
  }

  return (
    <div className={styles.productivitySection}>
      {/* stat cards */}
      <div className={styles.prodStatGrid}>
        <div className={styles.prodStatCard}>
          <div className={styles.prodStatLabel}>Tasks done</div>
          <div className={styles.prodStatValue}>{totalDone}</div>
        </div>
        <div className={styles.prodStatCard}>
          <div className={styles.prodStatLabel}>Overdue</div>
          <div
            className={styles.prodStatValue}
            style={{ color: totalOverdue > 0 ? "#ef4444" : undefined }}
          >
            {totalOverdue}
          </div>
        </div>
      </div>

      {/* contribution graph */}
      <div className={styles.contribOuter}>
        <div className={styles.dayLabels}>
          {["", "Mon", "", "Wed", "", "Fri", ""].map((l, i) => (
            <span key={i} className={styles.dayLabel}>{l}</span>
          ))}
        </div>
        <div className={styles.contribScroll}>
          <div className={styles.monthLabels}>
            {monthSpans.map((m, i) => (
              <span key={i} className={styles.monthLabel}>{m}</span>
            ))}
          </div>
          <div className={styles.contribGrid}>
            {cells.map(({ key, val, date }) => (
              <div
                key={key}
                className={styles.contribCell}
                title={`${val} task${val !== 1 ? "s" : ""} done on ${date.toDateString()}`}
                style={{
                  background: val === 0 ? emptyColor : PURPLE[Math.min(val - 1, 3)],
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className={styles.contribLegend}>
        <span>Less</span>
        <div className={styles.legendCells}>
          {[emptyColor, ...PURPLE].map((c, i) => (
            <div key={i} className={styles.legendCell} style={{ background: c }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}