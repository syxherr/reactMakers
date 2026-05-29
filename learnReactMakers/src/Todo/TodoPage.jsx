import {useState, useCallback,
  useMemo,
  useEffect,
  useContext,
  useRef,
  useId,
} from "react";
import "../style/index.css";
import styles from "./Todo.module.css";
import TodoList from "./component/TodoList";
import { Helmet } from "react-helmet-async";
import { UserContext } from "../post/context/UserContext";

function TodoPage() {
  const { user } = useContext(UserContext);
  const TODO_KEY = `todos_${user.name}`;

  const [todos, setTodos] = useState(() =>
    JSON.parse(localStorage.getItem(TODO_KEY) || "[]").map((text) => ({
      id: crypto.randomUUID(),
      text,
    })),
  );

  const [input, setInput] = useState("");

  const inputId = useId();
  const inputRef = useRef(null);

  const capitalizeFirst = useMemo(
    () => (text) => text.charAt(0).toUpperCase() + text.slice(1),
    [],
  );

  useEffect(() => {
  const timeout = setTimeout(() => {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
  }, 300);
  return () => clearTimeout(timeout);
}, [todos, TODO_KEY]);

  const handleAddTodos = useCallback(
    (e) => {
      e.preventDefault();
      if (input.trim() === "") return;
      setTodos((prev) => [
        { id: crypto.randomUUID(), text: capitalizeFirst(input.trim()) },
        ...prev,
      ]);
      setInput("");
    },
    [input, capitalizeFirst],
  );

  const handleDeleteTodos = useCallback((index) => {
    setTodos((prevTodos) => prevTodos.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }, []);

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  });

  return (
    <>
      <Helmet>
        <title>{`(${todos.length}) Todo App — ${user.name}`}</title>
        <meta
          name="description"
          content={`Manage your tasks on Todo App. ${todos.length} task${todos.length !== 1 ? "s" : ""} remaining.`}
        />
        <meta property="og:title" content="Todo App — Manage Your Tasks" />
        <meta
          property="og:description"
          content="A simple and accessible todo app to keep track of your daily tasks."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.yourdomain.com/todo" />
      </Helmet>

      <div className={styles.page}>
        <main className={styles.card} aria-label="Todo application">
          <header className={styles.header}>
            <p className={styles.workspace}>To Do</p>
            <h1 className={styles.h1}>{greeting}</h1>
          </header>

          <form
            onSubmit={handleAddTodos}
            className={styles.form}
            aria-label="Add a new task"
          >
            <label htmlFor={inputId} className="sr-only">
              New task
            </label>
            <input
              id={inputId}
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Add new task…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-required="true"
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              className={styles.button}
              aria-label="Add task"
            >
              Add
            </button>
          </form>

          <section
            aria-label="Task list"
            aria-live="polite"
            aria-atomic="false"
          >
            <TodoList todos={todos} onDelete={handleDeleteTodos} />
          </section>
        </main>
      </div>
    </>
  );
}

export default TodoPage;
