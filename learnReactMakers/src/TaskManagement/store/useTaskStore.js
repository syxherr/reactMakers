import { create } from "zustand";
import { persist } from "zustand/middleware";

const uid = () => Math.random().toString(36).slice(2, 9);

const SAMPLE_TASKS = [];

const useTaskStore = create( //1. bikin stor
  
  persist( // disimpan di local storage
    (set, get) => ({
      tasks: SAMPLE_TASKS,
      search: "",
      priority: "all",

      setSearch: (v) => set({ search: v }),
      setPriority: (v) => set({ priority: v }),


      //3. addTask di zustand store dijalankan
      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, { id: uid(), ...task }] })),

      loadTasks: (tasks) => set({ tasks }), //load task sesuai local storage user

      editTask: (
        id,
        patch, //edit tugas by id
      ) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      moveTask: (
        id,
        dir, //pindah ke progres
      ) =>
        set((state) => {
          const cols = ["todo", "doing", "done"];
          return {
            tasks: state.tasks.map((t) => {
              if (t.id !== id) return t;
              const next = cols[cols.indexOf(t.col) + dir];
              return next ? { ...t, col: next } : t;
            }),
          };
        }),

      // filter sesuai search dan priority
      getFiltered: () => {
        const { tasks, search, priority } = get();
        return tasks.filter((t) => {
          const matchSearch = t.title
            .toLowerCase()
            .includes(search.toLowerCase());
          const matchPriority = priority === "all" || t.priority === priority;
          return matchSearch && matchPriority;
        });
      },
    }),
    { name: "kanban-v2" },
  ),
);

export default useTaskStore;
