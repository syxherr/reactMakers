import {
  useState,
  useRef,
  useEffect,
  useContext,
  useId,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useShallow } from "zustand/react/shallow";
import useTaskStore from "../store/useTaskStore";
import {
  toggleStar,
  pushSnapshot,
  undo,
  redo,
  recordDone,
} from "../store/boardSlice";
import styles from "./Board.module.css";
import { Helmet } from "react-helmet-async";
import { UserContext } from "../../post/context/UserContext";
import ProductivityTab from "./ProductivityTab ";

const COLUMNS = [
  { id: "todo", label: "To Do", dot: "#888" },
  { id: "doing", label: "In Progress", dot: "#f59e0b" },
  { id: "done", label: "Done", dot: "#22c55e" },
];

const PRIORITIES = ["High", "Medium", "Low"];
const CATEGORIES = ["UI/UX", "React.js", "FrontEnd", "Read Book", "Other"];

const CAT_CLASS = {
  "UI/UX": styles.categoryUIUX,
  "React.js": styles.categoryReact,
  FrontEnd: styles.categoryFrontend,
  "Read Book": styles.categoryRead,
  Other: styles.categoryOther,
};

const PRIORITY_STYLE = {
  High: { bg: "#7c2d12", color: "#fca68a", dot: "#f97316" },
  Medium: { bg: "#713f12", color: "#fcd68a", dot: "#eab308" },
  Low: { bg: "#14532d", color: "#86efac", dot: "#22c55e" },
};

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function deadlineStatus(dl) {
  if (!dl) return null;
  const diff = Math.ceil((new Date(dl) - new Date()) / 86400000);
  if (diff < 0) return { label: "Overdue", cls: styles.deadlineOverdue };
  if (diff <= 2)
    return {
      label: diff === 0 ? "Today" : `${diff} days left`,
      cls: styles.deadlineSoon,
    };
  return { label: `${diff} days left`, cls: "" };
}

function TaskModal({ initial, colId, onSave, onClose, triggerRef }) {
  const titleId = useId();
  const noteId = useId();
  const categoryId = useId();
  const priorityId = useId();
  const deadlineId = useId();
  const headingId = useId();

  // data apa yang disimpan
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    note: initial?.note ?? "",
    category: initial?.category ?? "Other",
    priority: initial?.priority ?? "Medium",
    deadline: initial?.deadline ?? "",
  });

  const inputRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef?.current?.focus();
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, triggerRef]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  //3. fungsi handle save dipanggil
  const handleSave = () => {
    if (!form.title.trim()) {
      inputRef.current?.focus();
      return;
    }
    onSave({ ...form, title: form.title.trim(), col: colId ?? initial?.col });
    triggerRef?.current?.focus();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          triggerRef?.current?.focus();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={styles.modal}
      >
        <h3 id={headingId}>{initial ? "Edit Task" : "Add Task"}</h3>

        <label htmlFor={titleId}>Task title</label>
        <input
          ref={inputRef}
          id={titleId}
          value={form.title}
          placeholder="What task do you want to do?"
          onChange={(e) => set("title", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          aria-required="true"
        />

        <label htmlFor={noteId}>Notes (optional)</label>
        <textarea
          id={noteId}
          value={form.note}
          placeholder="Additional details..."
          onChange={(e) => set("note", e.target.value)}
        />

        <div className={styles.row2}>
          <div>
            <label htmlFor={categoryId}>Category</label>
            <select
              id={categoryId}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={priorityId}>Priority</label>
            <select
              id={priorityId}
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor={deadlineId} style={{ marginTop: 12 }}>
          Deadline
        </label>
        <input
          id={deadlineId}
          type="date"
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
        />

        <div className={styles.modalActions}>
          <button
            className={styles.btnCancel}
            onClick={() => {
              onClose();
              triggerRef?.current?.focus();
            }}
          >
            Cancel
          </button>

          {/* 2. user klik add, handleSave dipanggil */}
          <button className={styles.btnPrimary} onClick={handleSave}>
            {initial ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, colIndex, onBeforeChange }) {
  // redux 1. dispatch
  const dispatch = useDispatch();
  const starred = useSelector((s) => s.board.starred);
  const isStarred = starred.includes(task.id);

  const editTask = useTaskStore((s) => s.editTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const moveTask = useTaskStore((s) => s.moveTask);
  const [editing, setEditing] = useState(false);
  const dl = deadlineStatus(task.deadline);

  const editBtnRef = useRef();
  const deleteBtnRef = useRef();

  const handleDelete = useCallback(() => {
    onBeforeChange();
    deleteBtnRef.current
      ?.closest("[data-column]")
      ?.querySelector("button")
      ?.focus();
    deleteTask(task.id);
  }, [deleteTask, task.id, onBeforeChange]);

  // redux 3. ubah status
  const handleMove = (dir) => {
    onBeforeChange();
    const cols = ["todo", "doing", "done"];
    const nextCol = cols[cols.indexOf(task.col) + dir];
    if (nextCol === "done") dispatch(recordDone());
    moveTask(task.id, dir);
  };

  return (
    <>
      <article className={styles.card} aria-label={`Task: ${task.title}`}>
        <div className={styles.cardTop}>
          <span
            className={`${styles.cardCategory} ${CAT_CLASS[task.category] ?? styles.categoryOther}`}
          >
            {task.category}
          </span>
          <button
            className={`${styles.starBtn} ${isStarred ? styles.starBtnActive : ""}`}
            onClick={() => dispatch(toggleStar(task.id))}
            aria-label={
              isStarred ? `Unstar "${task.title}"` : `Star "${task.title}"`
            }
          >
            ★
          </button>
        </div>

        <div
          className={
            task.col === "done"
              ? `${styles.cardTitle} ${styles.cardTitleDone}`
              : styles.cardTitle
          }
        >
          {task.title}
        </div>

        {task.note && <div className={styles.cardNote}>{task.note}</div>}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
          }}
        >
          {task.priority &&
            (() => {
              const ps = PRIORITY_STYLE[task.priority];
              return (
                <span
                  style={{
                    background: ps.bg,
                    color: ps.color,
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: ps.dot,
                      display: "inline-block",
                    }}
                  />
                  {task.priority}
                </span>
              );
            })()}
          {task.createdAt && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              🕐 {timeAgo(task.createdAt)}
            </span>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {dl && task.col !== "done" && (
              <span
                className={`${styles.deadline} ${dl.cls}`}
                aria-label={`Deadline: ${dl.label}`}
              >
                <span aria-hidden="true">● </span>
                {dl.label}
              </span>
            )}
          </div>

          <div
            className={styles.cardActions}
            role="group"
            aria-label={`Actions for "${task.title}"`}
          >
            {colIndex > 0 && (
              <button
                className={styles.iconBtn}
                aria-label={`Move "${task.title}" to previous column`}
                onClick={() => handleMove(-1)}
              >
                <span aria-hidden="true">←</span>
              </button>
            )}
            {colIndex < 2 && (
              <button
                className={styles.iconBtn}
                aria-label={`Move "${task.title}" to next column`}
                onClick={() => handleMove(1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            )}
            <button
              ref={editBtnRef}
              className={styles.iconBtn}
              aria-label={`Edit "${task.title}"`}
              onClick={() => setEditing(true)}
            >
              <span aria-hidden="true">✎</span>
            </button>
            <button
              ref={deleteBtnRef}
              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
              aria-label={`Delete "${task.title}"`}
              onClick={handleDelete}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
      </article>

      {editing && (
        <TaskModal
          initial={task}
          triggerRef={editBtnRef}
          onSave={(patch) => {
            onBeforeChange();
            editTask(task.id, patch);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function Column({ col, colIndex, filteredTasks, onBeforeChange }) {
  const addTask = useTaskStore((s) => s.addTask);
  const [adding, setAdding] = useState(false);
  const tasks = filteredTasks.filter((t) => t.col === col.id);
  const addBtnRef = useRef();
  const headingId = useId();

  return (
    <>
      <section
        className={styles.column}
        data-column={col.id}
        aria-labelledby={headingId}
      >
        <div className={styles.colHeader}>
          <div className={styles.colLeft}>
            <span
              className={styles.colDot}
              style={{ background: col.dot }}
              aria-hidden="true"
            />
            <h2 id={headingId} className={styles.colTitle}>
              {col.label}
            </h2>
            <span
              className={styles.colBadge}
              aria-label={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
            >
              {tasks.length}
            </span>
          </div>
        </div>

        {tasks.length === 0 && (
          <p className={styles.emptyState} role="status">
            No tasks available
          </p>
        )}

        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            colIndex={colIndex}
            onBeforeChange={onBeforeChange}
          />
        ))}

        <button
          ref={addBtnRef}
          className={styles.addBtn}
          aria-label={`Add task to ${col.label}`}
          onClick={() => setAdding(true)} //1. user klik add task
        >
          + Add Task
        </button>
      </section>

      {adding && (
        <TaskModal
          colId={col.id}
          triggerRef={addBtnRef}
          onSave={(data) => {
            onBeforeChange();
            addTask({ ...data, createdAt: new Date().toISOString() });
            setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}

export default function Board() {
  const { user } = useContext(UserContext);
  const BOARD_KEY = `board_tasks_${user.name}`;

  const dispatch = useDispatch();
  const { past, future, snapshot } = useSelector((s) => s.board);

  const [activeMainTab, setActiveMainTab] = useState("tasks");
  const [starFilter, setStarFilter] = useState(false);
  const starred = useSelector((s) => s.board.starred);

  const {
    tasks,
    search,
    priority,
    setSearch,
    setPriority,
    getFiltered,
    loadTasks,
  } = useTaskStore(
    useShallow((s) => ({
      tasks: s.tasks,
      search: s.search,
      priority: s.priority,
      setSearch: s.setSearch,
      setPriority: s.setPriority,
      getFiltered: s.getFiltered,
      loadTasks: s.loadTasks,
    })),
  );

  useEffect(() => {
  const saved = localStorage.getItem(BOARD_KEY);
  loadTasks(saved ? JSON.parse(saved) : []);
}, [BOARD_KEY, loadTasks]);

  useEffect(() => {
    localStorage.setItem(BOARD_KEY, JSON.stringify(tasks));
  }, [tasks, BOARD_KEY]);

  const handleBeforeChange = useCallback(() => {
    dispatch(pushSnapshot(tasks));
  }, [dispatch, tasks]);

  // redux 2. undo/redo
  const handleUndo = () => {
    if (!past.length) return;
    dispatch(undo(tasks));
    if (snapshot !== null) loadTasks(snapshot);
  };

  const handleRedo = () => {
    if (!future.length) return;
    dispatch(redo(tasks));
    if (future[0] !== undefined) loadTasks(future[0]);
  };

  const filtered = useMemo(() => getFiltered(), [getFiltered, tasks, search, priority]);

  const displayed = useMemo(() => {
    const base = starFilter
      ? filtered.filter((t) => starred.includes(t.id))
      : filtered;
    return base
      .slice()
      .sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1),
      );
  }, [filtered, starFilter, starred]);

  const { total, doing, done, high } = useMemo(
    () => ({
      total: tasks.length,
      doing: tasks.filter((t) => t.col === "doing").length,
      done: tasks.filter((t) => t.col === "done").length,
      high: tasks.filter((t) => t.priority === "High").length,
    }),
    [tasks],
  );

  const searchId = useId();

const PRIORITY_BTNS = [
  { key: "all", label: "All", dot: styles.dotAll },
  { key: "High", label: "High", dot: styles.dotHigh },
  { key: "Medium", label: "Medium", dot: styles.dotMedium },
  { key: "Low", label: "Low", dot: styles.dotLow },
];

  return (
    <>
      <Helmet>
        <title>Task Management</title>
        <meta
          name="description"
          content="Manage your tasks across To Do, In Progress, and Done columns."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className={styles.board} aria-label="Task board">
        <div className={styles.toolbar} role="search">
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <input
              id={searchId}
              type="search"
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              aria-label="Search tasks"
            />
          </div>
          <div
            role="group"
            aria-label="Filter by priority"
            style={{ display: "flex", gap: 8 }}
          >
            {PRIORITY_BTNS.map((b) => (
              <button
                key={b.key}
                className={`${styles.filterBtn} ${priority === b.key ? styles.filterBtnActive : ""}`}
                onClick={() => setPriority(b.key)}
                aria-pressed={priority === b.key}
                aria-label={`Filter by ${b.label} priority`}
              >
                {b.dot && (
                  <span
                    className={`${styles.dot} ${b.dot}`}
                    aria-hidden="true"
                  />
                )}
                {b.label}
              </button>
            ))}
            <button
              className={`${styles.filterBtn} ${starFilter ? styles.filterBtnActive : ""}`}
              onClick={() => setStarFilter((v) => !v)}
              aria-pressed={starFilter}
              aria-label="Show starred tasks only"
            >
              ★ Starred
            </button>
          </div>
        </div>

        <div className={styles.mainTabs} role="tablist">
          <button
            role="tab"
            aria-selected={activeMainTab === "tasks"}
            className={`${styles.mainTab} ${activeMainTab === "tasks" ? styles.mainTabActive : ""}`}
            onClick={() => setActiveMainTab("tasks")}
          >
            Tasks
          </button>
          <button
            role="tab"
            aria-selected={activeMainTab === "productivity"}
            className={`${styles.mainTab} ${activeMainTab === "productivity" ? styles.mainTabActive : ""}`}
            onClick={() => setActiveMainTab("productivity")}
          >
            Productivity
          </button>
        </div>

        {activeMainTab === "tasks" && (
          <>
            <div className={styles.undoBar}>
              <button
                className={styles.undoBtn}
                onClick={handleUndo}
                disabled={!past.length}
                aria-label="Undo last action"
              >
                ↩ Undo
              </button>
              <button
                className={styles.undoBtn}
                onClick={handleRedo}
                disabled={!future.length}
                aria-label="Redo last action"
              >
                ↪ Redo
              </button>
              <span className={styles.undoLabel}>
                {past.length
                  ? `${past.length} action${past.length > 1 ? "s" : ""} to undo`
                  : "No actions to undo"}
              </span>
            </div>

            <div className={styles.statsBar}>
              <span>
                <strong>{total}</strong> total tasks
              </span>
              <span>
                <strong>{doing}</strong> in progress
              </span>
              <span>
                <strong>{done}</strong> completed
              </span>
              <span>
                <strong>{high}</strong> high priority
              </span>
            </div>

            <div className={styles.columns}>
              {COLUMNS.map((col, i) => (
                <Column
                  key={col.id}
                  col={col}
                  colIndex={i}
                  filteredTasks={displayed}
                  onBeforeChange={handleBeforeChange}
                />
              ))}
            </div>
          </>
        )}

        {activeMainTab === "productivity" && <ProductivityTab />}
      </main>
    </>
  );
}
