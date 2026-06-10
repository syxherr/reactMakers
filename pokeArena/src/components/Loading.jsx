import styles from "./Loading.module.css";

export default function StatsLoading() {
  return (
    <div className={styles.wrap} role="status" aria-label="Loading Battle">
      <img
        src="/pokeball.svg"
        alt=""
        className={styles.pokeball}
        width={48}
        height={48}
      />
      <p className={styles.text}>Catching Pokemon</p>
    </div>
  );
}