import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useTaskStore = create(
  persist(
    (set, get) => ({
      // VIEW
      view: "board",
      setView: (view) => set({ view }),

      // FILTERS
      filters: {
        priority: "all",
        assignee: "all",
        tag: "all",
        search: "",
      },

      setFilters: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),

      resetFilters: () =>
        set({
          filters: {
            priority: "all",
            assignee: "all",
            tag: "all",
            search: "",
          },
        }),

      // SIDEBAR
      sidebarOpen: true,

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      // CALENDAR
      calendarMonth: new Date().toISOString(),

      setCalendarMonth: (date) =>
        set({
          calendarMonth: date,
        }),

      // DRAG & DROP
      draggingCardId: null,
      dragOverColumn: null,

      setDraggingCard: (id) =>
        set({
          draggingCardId: id,
        }),

      setDragOverColumn: (col) =>
        set({
          dragOverColumn: col,
        }),

      clearDrag: () =>
        set({
          draggingCardId: null,
          dragOverColumn: null,
        }),
    }),
    {
      name: "taskboard-ui",

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        view: state.view,
        filters: state.filters,
        sidebarOpen: state.sidebarOpen,
        calendarMonth: state.calendarMonth,
      }),
    },
  ),
);

export const useModalStore = create(
  (set) => ({
    isOpen: false,
    mode: "create",
    defaultColumn: 'todo',
    editingTask: null,

    openCreate: (column = 'todo') =>
      set({
        isOpen: true,
        mode: "create",
        defaultColumn: column,
        editingTask: null,
      }),
    openEdit: (task) =>
      set({
        isOpen: true,
        mode: "edit",
        editingTask: task,
      }),
    openDetail: (task) =>
      set({
        isOpen: true,
        mode: "detail",
        editingTask: task,
      }),
    close: () =>
      set({
        isOpen: false,
        editingTask: null,
      }),
  }));


  export const useOptimisticStore = create((set, get) => ({
    pendingMoves: {},
    addPendingMove: (taskId, column) =>
      set((state) => ({
        pendingMoves: {
          ...state.pendingMoves,
          [taskId]: column,
        },
      })),

    removePendingMove: (taskId) =>
      set((state) => {
        const newMoves = { ...state.pendingMoves };
        delete newMoves[taskId];
        return { pendingMoves: newMoves };
      }),
      clearPendingMoves: () =>
        set({
          pendingMoves: {},
        }),
  }));