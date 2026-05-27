import React from "react";
import styles from "../Todo/Todo.module.css";
import { IoIosClose } from "react-icons/io";

function TodoList({ todos, onDelete }) {
  if (todos.length === 0) {
    return <p className={styles.emptyTask}>No Task Yet</p>;
  }

  return (
    <ul className={styles.ul}>
      {todos.map((todo, index) => (
        <li key={index} className={styles.li}>
          <span className={styles.bullet}>•</span>
          <span className={styles.todoText}>{todo}</span>
          <button className={styles.buttondelete} onClick={() => onDelete(index)}>
            <IoIosClose />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default React.memo(TodoList);