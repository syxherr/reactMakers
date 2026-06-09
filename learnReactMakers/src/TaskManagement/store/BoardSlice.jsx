import { createSlice } from "@reduxjs/toolkit";

const MAX_HISTORY = 30;

const boardSlice = createSlice({
  name: "board",
  initialState: {
    starred: [],
    past: [],
    future: [],
    snapshot: null,
    doneDates: {},
  },
  reducers: {
    toggleStar(state, action) {
      const id = action.payload;
      const idx = state.starred.indexOf(id);
      if (idx === -1) state.starred.push(id);
      else state.starred.splice(idx, 1);
    },

    pushSnapshot(state, action) {
      state.past.push(action.payload);
      if (state.past.length > MAX_HISTORY) state.past.shift();
      state.future = [];
    },

    undo(state, action) {
      if (!state.past.length) return;
      state.future.unshift(action.payload);
      state.snapshot = state.past.pop();
    },

    redo(state, action) {
      if (!state.future.length) return;
      state.past.push(action.payload);
      state.snapshot = state.future.shift();
    },

    recordDone(state) {
      const key = new Date().toISOString().slice(0, 10);
      state.doneDates[key] = (state.doneDates[key] || 0) + 1;
    },
  },
});

export const { toggleStar, pushSnapshot, undo, redo, recordDone } =
  boardSlice.actions;

export default boardSlice.reducer;