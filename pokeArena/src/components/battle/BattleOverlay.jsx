import { useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./BattleOverlay.module.css";

const PHASES = {
  begin: "begin",
  winner: "winner",
};

const BattleOverlay = memo(function BattleOverlay({
  phase,
  nameA,
  nameB,
  winsA,
  winsB,
  onBeginDone,
}) {
  const visible = phase === PHASES.begin || phase === PHASES.winner;

  useEffect(() => {
    if (phase !== PHASES.begin) return;
    const id = setTimeout(() => onBeginDone?.(), 3000);
    return () => clearTimeout(id);
  }, [phase]);

  const winner = winsA > winsB ? nameA : winsB > winsA ? nameB : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={phase === PHASES.winner ? onBeginDone : undefined}
          role="status"
          aria-live="assertive"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            {phase === PHASES.begin && (
              <motion.div
                key="begin"
                className={styles.content}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className={styles.main}>Battle Begin!</span>
                <div className={styles.vsRow}>
                  <span className={styles.fighterA}>{capitalize(nameA)}</span>
                  <span className={styles.vs}>VS</span>
                  <span className={styles.fighterB}>{capitalize(nameB)}</span>
                </div>
              </motion.div>
            )}

            {phase === PHASES.winner && (
              <motion.div
                key="winner"
                className={styles.content}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                aria-label="Click to dismiss"
              >
                {winner ? (
                  <>
                    <span className={styles.sub}>The Winner Is</span>
                    <span className={styles.mainWinner}>
                      {capitalize(winner)}
                    </span>
                    <span className={styles.score}>
                      {winsA} – {winsB}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.sub}>It's A</span>
                    <span className={styles.mainDraw}>Draw</span>
                    <span className={styles.score}>
                      {winsA} – {winsB}
                    </span>
                  </>
                )}
                <span className={styles.dismiss}>tap to continue</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BattleOverlay;

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}