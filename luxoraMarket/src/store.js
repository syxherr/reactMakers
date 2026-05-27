import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

//menyimpan semua state global
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});