import { lazy, useMemo, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { useState, useEffect } from "react";
import { darkTheme, lightTheme } from "./style/theme/Theme";
import GlobalStyle from "./style/theme/GlobalStyle";
import { UserProvider } from "./post/context/UserContext";
import Navbar from "./Navbar";

import LoadingPage from "./style/LoadingPage";
const Home = lazy(() => import("./Home/Home"));
const TodoPage = lazy(() => import("./Todo/TodoPage"));
const WeatherApp = lazy(() => import("./Weather/WeatherAppPage"));
const PostPage = lazy(() => import("./post/post/PostPage"));
const LuxoraShop = lazy(() => import("./luxora/Pages/Luxora"));

function App() {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    const dark = storedTheme
      ? storedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark", dark); // ← tambah ini
    return dark;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.body.classList.toggle("dark", isDark); // ← tambah ini
  }, [isDark]);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <UserProvider>

        <Navbar toggleTheme={toggleTheme} isDark={isDark} />
        <Suspense fallback={<LoadingPage />}>

          <Routes>
            <Route path="/" element={<Home toggleTheme={toggleTheme} isDark={isDark} />}
            />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/weather" element={<WeatherApp />} />
            <Route path="/post" element={<PostPage />} />
            <Route path="/luxora" element={<LuxoraShop />} />
          </Routes>
        </Suspense>

      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
