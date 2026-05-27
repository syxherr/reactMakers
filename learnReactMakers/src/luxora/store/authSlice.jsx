import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    login(state, action) {
      const { username, password } = action.payload;
      // Simulasi cek kredensial
      if (username === "admin" && password === "1234") {
        state.user = { username };
        state.isAuthenticated = true;
        state.error = null;
      } else {
        state.error = "Username atau password salah!";
      }
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;