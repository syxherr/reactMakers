import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePokemonStore = create(
  persist(
    (set) => ({
      history: [],
      addHistory: (entry) =>
        set((state) => ({ history: [entry, ...state.history] })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "battle_history" },
  ),
);
