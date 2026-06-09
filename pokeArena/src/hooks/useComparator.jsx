import { useEffect, useState } from "react";

const STAT_KEYS = [
  "hp", "attack", "defense",
  "special-attack", "special-defense", "speed",
];

export function useComparator() {
  const [selected, setSelected]             = useState([null, null]);
  const [statsVisible, setStatsVisible]     = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [overlayPhase, setOverlayPhase]     = useState(null);
  const [history, setHistory]               = useState(() => {
    try {
      const saved = localStorage.getItem("battle_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })

  useEffect(() => {
    localStorage.setItem("battle_history", JSON.stringify(history));
  }, [history]);

  function selectPokemon(slot, pokemon) {
    setSelected((prev) => {
      const next = [...prev];
      next[slot] = pokemon;
      return next;
    });
    setStatsVisible(false);
    setHistoryVisible(false);
    setOverlayPhase(null);
  }

  function compare() {
    const [a, b] = selected;
    if (!a || !b) return;

    setOverlayPhase("begin");
    setStatsVisible(false);
    setHistoryVisible(false);

  }

  function onBeginDone() {
    setOverlayPhase(null);
    setStatsVisible(true);
  }

  function onStatsComplete() {
    setOverlayPhase("winner");
  }

  // 6. history 
  function onWinnerDismiss() {
    setOverlayPhase(null);
    setHistoryVisible(true);
    const [a, b] = selected;
    const { statusA, statusB } = calcWinner(a, b);
    setHistory((prev) => [ // hasil battle masuk ke history
      { nameA: a.name, nameB: b.name, statusA, statusB },
      ...prev,
    ]);
  }

  // 7. reset pokemon
  function reset() {
    setSelected([null, null]);
    setStatsVisible(false);
    setHistoryVisible(true);
    setOverlayPhase(null);
  }

  // 7. reset history
  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("battle_history")
  }

  return {
    selected,
    statsVisible,
    historyVisible,
    overlayPhase,
    history,
    selectPokemon,
    compare,
    reset,
    clearHistory,
    onBeginDone,
    onStatsComplete,
    onWinnerDismiss,
  };
}

// 4. hitung compare stat pokemon
export function calcWinner(a, b) {
  let winsA = 0;
  let winsB = 0;

  STAT_KEYS.forEach((key) => {
    const va = a.stats[key] ?? 0;
    const vb = b.stats[key] ?? 0;
    if (va > vb) winsA++;
    else if (vb > va) winsB++;
  });

  let statusA, statusB;
  if (winsA > winsB)      { statusA = "Win";  statusB = "Lose"; }
  else if (winsB > winsA) { statusA = "Lose"; statusB = "Win";  }
  else                    { statusA = "Draw"; statusB = "Draw"; }

  return { winsA, winsB, statusA, statusB };
}