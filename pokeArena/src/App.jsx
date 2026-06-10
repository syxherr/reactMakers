import { usePokemonList } from "./hooks/usePokemon.jsx";
import { Helmet } from "react-helmet-async";
import { useComparator } from "./hooks/useComparator.jsx";
import { useTheme } from "./style/theme/useTheme.jsx";
import {
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useRef,
  useEffect,
  useState,
} from "react";
import PokemonPicker from "./components/picker/PokemonPicker.jsx";
import styles from "./App.module.css";
import { calcWinner } from "./hooks/useComparator.jsx";
import BattleOverlay from "./components/battle/BattleOverlay.jsx";
import { fetchPokemonDetail } from "./hooks/usePokemon.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Loading from "./components/Loading.jsx";

const History = lazy(() => import("./components/history/History.jsx"));
const StatsSection = lazy(() => import("./components/battle/Statssection.jsx"));

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pokemon Arena",
  description:
    "A web app to compare Pokemon stats in a fun and interactive way.",
  applicationCategory: "Game",
  operatingSystem: "Web",
};

export default function App() {
  const { list, loading: listLoading, error } = usePokemonList();

  const {
    selected,
    statsVisible,
    overlayPhase,
    history,
    selectPokemon,
    compare,
    reset,
    clearHistory,
    onBeginDone,
    onStatsComplete,
    onWinnerDismiss,
  } = useComparator();

  const { theme, setTheme } = useTheme();

  const [randomLoading, setRandomLoading] = useState(false);

  const handleRandom = useCallback(() => {
    if (list.length < 2) return;
    const idxA = Math.floor(Math.random() * list.length);
    let idxB;
    do {
      idxB = Math.floor(Math.random() * list.length);
    } while (idxB === idxA);

    selectPokemon(0, null);
    selectPokemon(1, null);
    setRandomLoading(true);

    Promise.all([
      fetchPokemonDetail(list[idxA].name),
      fetchPokemonDetail(list[idxB].name),
    ])
      .then(([a, b]) => {
        selectPokemon(0, a);
        selectPokemon(1, b);
      })
      .finally(() => {
        setRandomLoading(false);
      });
  }, [list, selectPokemon]);

  const statsRef = useRef(null);
  useEffect(() => {
    if (statsVisible && statsRef.current) {
      const id = setTimeout(() => statsRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  });

  const battleResult = useMemo(() => {
    if (!selected[0] || !selected[1]) return { winsA: 0, winsB: 0 };
    return calcWinner(selected[0], selected[1]);
  }, [selected]);

  const handleThemeToggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  const canCompare = useMemo(
    () => Boolean(selected[0] && selected[1]),
    [selected],
  );

  return (
    <>
      <Helmet>
        <title>Pokemon Arena</title>
        <meta
          name="description"
          content="Pick two Pokémon and start the battle!"
        />
        <meta property="og:title" content="Pokemon Arena" />
        <meta
          property="og:description"
          content="Pick two Pokémon and start the battle!"
        />
        <meta property="og:type" content="website" />
        <link rel="icon" />
        <script type="application/ld+json">
          {JSON.stringify(STRUCTURED_DATA)}
        </script>
      </Helmet>
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <img src="/pokeball.svg" alt="Logo" className={styles.logo} />
            <div className={styles.brandText}>
              <h1 className={styles.title}>Pokemon Arena</h1>
            </div>
          </div>

          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              role="switch"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-checked={theme === "dark"}
              checked={theme === "dark"}
              onChange={handleThemeToggle}
            />
            <span className={styles.toggleTrack} aria-hidden="true">
              <span className={styles.toggleThumb} />
            </span>
          </label>
        </header>

        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            Failed load data: {error}
          </div>
        )}

        <section className={styles.card}>
          <PokemonPicker
            pokemonList={list}
            listLoading={listLoading}
            selected={selected}
            onSelect={selectPokemon}
            randomLoading={randomLoading}
          />

          <div
            className={styles.actions}
            role="group"
            aria-label="Battle actions"
          >
            <button
              className={styles.btnReset}
              onClick={reset}
              aria-label="Reset Pokemon"
            >
              Reset
            </button>
            <button
              className={styles.btnRandom}
              onClick={handleRandom}
              disabled={listLoading}
              aria-label="Pick two random Pokémon"
            >
              {randomLoading}
              Random
            </button>
            <button
              className={styles.btnCompare}
              onClick={compare}
              disabled={!canCompare}
              aria-disabled={!canCompare}
            >
              Start Battle
            </button>
          </div>

          {statsVisible && selected[0] && selected[1] && (
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <div ref={statsRef} tabIndex={-1} aria-label="Battle results">
                  <StatsSection
                    pokemonA={selected[0]}
                    pokemonB={selected[1]}
                    onComplete={onStatsComplete}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>
          )}
        </section>

        {history.length > 0 && (
          <section className={styles.card} aria-label="Battle history">
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <History entries={history} onClear={clearHistory} />
              </Suspense>
            </ErrorBoundary>
          </section>
        )}
      </div>
      <BattleOverlay
        phase={overlayPhase}
        nameA={selected[0]?.name ?? ""}
        nameB={selected[1]?.name ?? ""}
        winsA={battleResult.winsA}
        winsB={battleResult.winsB}
        onBeginDone={overlayPhase === "begin" ? onBeginDone : onWinnerDismiss}
      />
    </>
  );
}
