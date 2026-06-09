import { useState } from "react";
import { ThemeContext } from "./ThemeContext"
import { applyTheme } from "./theme";

const initialTheme = localStorage.getItem("poke-theme") || "dark";

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(initialTheme);

    function changeTheme(next) {
        applyTheme(next);
        localStorage.setItem("poke-theme", next);
        setTheme(next);
    }

    return(
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
        {children}
    </ThemeContext.Provider>
    );
}