import {
  useState,
  useRef,
  useEffect,
  useContext,
  useId,
  useCallback,
} from "react";
import { useShallow } from "zustand/react/shallow";
import useTaskStore from "./useTaskStore";
import styles from "./Board.module.css";
import { Helmet } from "react-helmet-async";
import { UserContext } from "../post/context/UserContext";

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

  const handleSave = () => {
    if (!form.title.trim()) {
      inputRef.current?.focus();
      return;
    }
    onSave({ ...form, title: form.title.trim(), col: colId ?? initial?.col });
    triggerRef?.current?.focus();
  };

  return (
    <div className={styles.page}>
      <div
        className={styles.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
            triggerRef?.current?.focus();
          }
        }}
        aria-hidden="true"
      />
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
          <button className={styles.btnPrimary} onClick={handleSave}>
            {initial ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, colIndex }) {
  const editTask = useTaskStore((s) => s.editTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const moveTask = useTaskStore((s) => s.moveTask);
  const [editing, setEditing] = useState(false);
  const dl = deadlineStatus(task.deadline);

  const editBtnRef = useRef();
  const deleteBtnRef = useRef();

  const handleDelete = useCallback(() => {
    deleteBtnRef.current
      ?.closest("[data-column]")
      ?.querySelector("button")
      ?.focus();
    deleteTask(task.id);
  }, [deleteTask, task.id]);

  return (
    <>
      <article className={styles.card} aria-label={`Task: ${task.title}`}>
        <span
          className={`${styles.cardCategory} ${CAT_CLASS[task.category] ?? styles.categoryOther}`}
        >
          {task.category}
        </span>

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

        <div className={styles.cardFooter}>
          {dl ? (
            <span
              className={`${styles.deadline} ${dl.cls}`}
              aria-label={`Deadline: ${dl.label}`}
            >
              <span aria-hidden="true">● </span>
              {dl.label}
            </span>
          ) : (
            <span />
          )}

          <div
            className={styles.cardActions}
            role="group"
            aria-label={`Actions for "${task.title}"`}
          >
            {colIndex > 0 && (
              <button
                className={styles.iconBtn}
                aria-label={`Move "${task.title}" to previous column`}
                onClick={() => moveTask(task.id, -1)}
              >
                <span aria-hidden="true">←</span>
              </button>
            )}
            {colIndex < 2 && (
              <button
                className={styles.iconBtn}
                aria-label={`Move "${task.title}" to next column`}
                onClick={() => moveTask(task.id, 1)}
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
            editTask(task.id, patch);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function Column({ col, colIndex, filteredTasks }) {
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
          <TaskCard key={t.id} task={t} colIndex={colIndex} />
        ))}

        <button
          ref={addBtnRef}
          className={styles.addBtn}
          aria-label={`Add task to ${col.label}`}
          onClick={() => setAdding(true)}
        >
          + Add Task
        </button>
      </section>

      {adding && (
        <TaskModal
          colId={col.id}
          triggerRef={addBtnRef}
          onSave={(data) => {
            addTask(data);
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

  const { search, priority, setSearch, setPriority, getFiltered, loadTasks } =
    useTaskStore(
      useShallow((s) => ({
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
  }, [BOARD_KEY]);

  const tasks = useTaskStore(useShallow((s) => s.tasks));
  const filtered = getFiltered();

  useEffect(() => {
    localStorage.setItem(BOARD_KEY, JSON.stringify(tasks));
  }, [tasks, BOARD_KEY]);

  const total = tasks.length;
  const doing = tasks.filter((t) => t.col === "doing").length;
  const done = tasks.filter((t) => t.col === "done").length;
  const high = tasks.filter((t) => t.priority === "High").length;

  const PRIORITY_BTNS = [
    { key: "all", label: "All", dot: styles.dotAll },
    { key: "High", label: "High", dot: styles.dotHigh },
    { key: "Medium", label: "Medium", dot: styles.dotMedium },
    { key: "Low", label: "Low", dot: styles.dotLow },
  ];

  const searchId = useId();

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
        <div
          className={styles.toolbar}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
          role="search"
        >
          <div className={styles.searchWrap} style={{ flex: 1 }}>
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
          </div>
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
              filteredTasks={filtered}
            />
          ))}
        </div>
      </main>
    </>
  );
}
