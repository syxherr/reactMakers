import React from "react";
import styles from "../Todo.module.css";
import { IoIosClose } from "react-icons/io";
import { IoCheckboxOutline } from "react-icons/io5";

function TodoList({ todos, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className={styles.emptyState} role="status" aria-live="polite">
        <div className={styles.emptyIcon} aria-hidden="true">
          <IoCheckboxOutline size={24} color="#7F77DD" />
        </div>
        <p className={styles.emptyTask}>No tasks yet</p>
      </div>
    );
  }

  return (
    <ul
      className={styles.ul}
      aria-label={`${todos.length} task${todos.length !== 1 ? "s" : ""}`}
      itemScope
      itemType="https://schema.org/ItemList"
    >
      {todos.map((todo, index) => (
        <li
          key={index}
          className={styles.li}
          itemScope
          itemType="https://schema.org/ListItem"
          itemProp="itemListElement"
        >
          <meta itemProp="position" content={index + 1} />
          <span className={styles.bullet} aria-hidden="true">•</span>
          <span className={styles.todoText} itemProp="name">{todo}</span>
          <button
            className={styles.buttondelete}
            onClick={() => onDelete(index)}
            aria-label={`Delete task: ${todo}`}
          >
            <IoIosClose aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default React.memo(TodoList);