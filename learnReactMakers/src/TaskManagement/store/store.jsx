import { configureStore } from "@reduxjs/toolkit"
import boardReducer from "./BoardSlice"


export const store = configureStore({
  reducer: {
    board: boardReducer,
  },
})