import { useState, useEffect, memo, useMemo } from "react";
import { motion } from "motion/react";
import styles from "./StatsSection.module.css";

const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];
const MAX_STAT = 255;

const StatsSection = memo(function StatsSection({
  pokemonA,
  pokemonB,
  onComplete,
}) {
  const { winsA, winsB, statResults } = useMemo(
    () => calcResults(pokemonA, pokemonB),
    [pokemonA, pokemonB],
  );
  const listKey = `${pokemonA.name}-${pokemonB.name}`;

  const [visibleCount, setVisibleCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    setVisibleCount(0);
    setAllDone(false);

    // show stat tiap 1 detik
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= STAT_KEYS.length) {
          clearInterval(interval);
          setTimeout(() => setAllDone(true), 100);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pokemonA.name, pokemonB.name]);

  useEffect(() => {
    if (!allDone) return;
    const id = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(id);
  }, [allDone]);

  return (
    <article className={styles.wrapper}>
      <div className={styles.tableHeader}>
        <span className={styles.nameA} aria-hidden="true">
          {capitalize(pokemonA.name)}
        </span>
        <span className={styles.headerCenter} aria-hidden="true">
          Stats
        </span>
        <span className={styles.nameB} aria-hidden="true">
          {capitalize(pokemonB.name)}
        </span>
      </div>

      <div
        key={listKey}
        role="list"
        aria-label={`${visibleCount} of ${STAT_KEYS.length} stats loaded`}
      >
        {statResults
          .slice(0, visibleCount)
          .map(({ key, va, vb, barA, barB, winA, winB }, index) => (
            <AnimatedRow
              key={key}
              index={index}
              allDone={allDone}
              label={key}
              va={va}
              vb={vb}
              barA={barA}
              barB={barB}
              winA={winA}
              winB={winB}
              nameA={pokemonA.name}
              nameB={pokemonB.name}
            />
          ))}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: STAT_KEYS.length * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ResultBanner
            winsA={winsA}
            winsB={winsB}
            nameA={pokemonA.name}
            nameB={pokemonB.name}
          />
        </motion.div>
      )}
    </article>
  );
});

export default StatsSection;

const AnimatedRow = memo(function AnimatedRow({
  index,
  allDone,
  label,
  va,
  vb,
  barA,
  barB,
  winA,
  winB,
  nameA,
  nameB,
}) {
  return (
    <div role="listitem">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          allDone
            ? { duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0 }
        }
      >
        <StatRow
          label={label}
          va={va}
          vb={vb}
          barA={barA}
          barB={barB}
          winA={winA}
          winB={winB}
          allDone={allDone}
          nameA={nameA}
          nameB={nameB}
        />
      </motion.div>
    </div>
  );
});

const StatRow = memo(function StatRow({
  label,
  va,
  vb,
  barA,
  barB,
  winA,
  winB,
  allDone,
  nameA,
  nameB,
}) {
  return (
    <div
      className={styles.statRow}
      aria-label={`${label.toUpperCase()} — ${capitalize(nameA)} ${va}, ${capitalize(nameB)} ${vb}${winA ? `, ${capitalize(nameA)} wins this stat` : winB ? `, ${capitalize(nameB)} wins this stat` : ", tied"}`}
    >
      <div className={styles.valA}>
        {winA && <span className={styles.dotGreen} aria-hidden="true" />}
        <span
          className={winA ? styles.numGreen : styles.numMuted}
          aria-hidden="true"
        >
          {va}
        </span>
      </div>

      <div className={styles.middle}>
        <span className={styles.statLabel} aria-hidden="true">
          {label.toUpperCase()}
        </span>
        <div className={styles.dualBars} aria-hidden="true">
          <div className={styles.barTrack}>
            <motion.div
              className={`${styles.barFill} ${styles.barLeft} ${!winA ? styles.barDim : ""}`}
              initial={{ width: "0%" }}
              animate={{ width: `${barA}%` }}
              transition={
                allDone
                  ? { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0 }
              }
            />
          </div>
          <div className={styles.barTrack}>
            <motion.div
              className={`${styles.barFill} ${styles.barRight} ${!winB ? styles.barDim : ""}`}
              initial={{ width: "0%" }}
              animate={{ width: `${barB}%` }}
              transition={
                allDone
                  ? { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0 }
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.valB}>
        <span
          className={winB ? styles.numOrange : styles.numMuted}
          aria-hidden="true"
        >
          {vb}
        </span>
        {winB && <span className={styles.dotOrange} aria-hidden="true" />}
      </div>
    </div>
  );
});

const ResultBanner = memo(function ResultBanner({
  winsA,
  winsB,
  nameA,
  nameB,
}) {
  if (winsA > winsB)
    return (
      <div className={styles.result} role="status" aria-live="polite">
        <span className={styles.dotGreen} aria-hidden="true" />
        <span className={styles.resultGreen}>{capitalize(nameA)} wins</span>
        <span
          className={styles.resultScore}
          aria-label={`Score: ${winsA} to ${winsB}`}
        >
          {winsA} – {winsB}
        </span>
      </div>
    );

  if (winsB > winsA)
    return (
      <div className={styles.result} role="status" aria-live="polite">
        <span className={styles.dotOrange} aria-hidden="true" />
        <span className={styles.resultOrange}>{capitalize(nameB)} wins</span>
        <span
          className={styles.resultScore}
          aria-label={`Score: ${winsA} to ${winsB}`}
        >
          {winsA} – {winsB}
        </span>
      </div>
    );

  return (
    <div className={styles.result} role="status" aria-live="polite">
      <span className={styles.dotMuted} aria-hidden="true" />
      <span className={styles.resultDraw}>Draw — {winsA} wins each</span>
      <span className={styles.dotMuted} aria-hidden="true" />
    </div>
  );
});

function calcResults(a, b) {
  let winsA = 0,
    winsB = 0;
  const statResults = STAT_KEYS.map((key) => {
    const va = a.stats[key] ?? 0;
    const vb = b.stats[key] ?? 0;
    const winA = va > vb,
      winB = vb > va;
    if (winA) winsA++;
    else if (winB) winsB++;
    return {
      key,
      va,
      vb,
      barA: Math.round((va / MAX_STAT) * 100),
      barB: Math.round((vb / MAX_STAT) * 100),
      winA,
      winB,
    };
  });
  return { winsA, winsB, statResults };
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
