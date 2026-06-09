import { useRef } from "react";
import { motion, useInView } from "motion/react";
import styles from "./History.module.css";

function AnimatedItem({ children, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default function History({ entries, onClear }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>History</h2>
          <span className={styles.count}>{entries.length}</span>
        </div>
        <button className={styles.btnClear} onClick={onClear}>
          🗑 Clear
        </button>
      </div>

      {entries.length === 0 ? (
        <p className={styles.empty}>No history yet.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.colHeaders}>
            <div className={styles.colRound}>Round</div>
            <div className={styles.colA}>Challenger 1</div>
            <div />
            <div className={styles.colB}>Challenger 2</div>
          </div>

          <div className={styles.list}>
            {entries.map((entry, i) => (
              <AnimatedItem key={i} index={i}>
                <HistoryItem entry={entry} index={entries.length - i} />
              </AnimatedItem>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ entry, index }) {
  const { nameA, nameB, statusA, statusB, spriteA, spriteB } = entry;

  const nameClassA =
    statusA === "Win"
      ? styles.nameWin
      : statusA === "Lose"
        ? styles.nameLose
        : styles.nameDraw;
  const nameClassB =
    statusB === "Win"
      ? styles.nameWin
      : statusB === "Lose"
        ? styles.nameLose
        : styles.nameDraw;

  return (
    <div className={styles.row}>
      <div className={styles.roundNum}>{index}</div>

      <div className={styles.sideA}>
        {spriteA && <img className={styles.sprite} src={spriteA} alt={nameA} />}
        <div className={styles.pokeInfo}>
          <span className={`${styles.pokeName} ${nameClassA}`}>
            {capitalize(nameA)}
          </span>
          <div className={styles.status}>
            <span
              className={`${styles.dot} ${statusA === "Win" ? styles.dotWin : statusA === "Lose" ? styles.dotLose : styles.dotDraw}`}
            />
            <span
              className={`${styles.statusText} ${statusA === "Win" ? styles.statusWin : statusA === "Lose" ? styles.statusLose : styles.statusDraw}`}
            >
              {statusA}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sword}>⚔️</div>

      <div className={styles.sideB}>
        <div className={styles.pokeInfo} style={{ alignItems: "flex-end" }}>
          <span className={`${styles.pokeName} ${nameClassB}`}>
            {capitalize(nameB)}
          </span>
          <div className={styles.status}>
            <span
              className={`${styles.statusText} ${statusB === "Win" ? styles.statusWin : statusB === "Lose" ? styles.statusLose : styles.statusDraw}`}
            >
              {statusB}
            </span>
            <span
              className={`${styles.dot} ${statusB === "Win" ? styles.dotWin : statusB === "Lose" ? styles.dotLose : styles.dotDraw}`}
            />
          </div>
        </div>
        {spriteB && <img className={styles.sprite} src={spriteB} alt={nameB} />}
      </div>
    </div>
  );
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}