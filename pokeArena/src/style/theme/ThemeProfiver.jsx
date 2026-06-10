import { useState } from "react";
import { ThemeContext } from "./ThemeContext"
import { applyTheme } from "./theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const t = localStorage.getItem("poke-theme") || "dark";
    applyTheme(t);
    return t;
  });

  function changeTheme(next) {
    applyTheme(next);
    localStorage.setItem("poke-theme", next);
    setTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}