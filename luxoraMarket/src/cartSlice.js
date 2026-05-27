import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],        
  filter: "All",
  search: "",
  isCartOpen: false,
  notification: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    //menerima action/mengubah state
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...product, qty: 1 });
      }
      state.notification = {
        message: `${product.name} ditambahkan ke keranjang!`,
      };
    },

    removeFromCart(state, action) {
      const id = action.payload;
      const removedItem = state.items.find((item) => item.id === id);
      state.items = state.items.filter((item) => item.id !== id);
      state.notification = {
        message: removedItem
          ? `${removedItem.name} dihapus dari keranjang!`
          : "Produk dihapus!",
      };
    },

    changeQuantity(state, action) {
      const { id, delta } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (!item) return;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        item.qty = newQty;
      }
    },

    setFilter(state, action) {
      state.filter = action.payload;
    },

    setSearch(state, action) {
      state.search = action.payload;
    },

    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },

    clearNotification(state) {
      state.notification = null;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  changeQuantity,
  setFilter,
  setSearch,
  toggleCart,
  clearNotification,
} = cartSlice.actions;

export const selectItems = (state) => state.cart.items;
export const selectFilter = (state) => state.cart.filter;
export const selectSearch = (state) => state.cart.search;
export const selectIsCartOpen = (state) => state.cart.isCartOpen;
export const selectNotification = (state) => state.cart.notification;
export const selectTotalItems = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0);

export default cartSlice.reducer;
