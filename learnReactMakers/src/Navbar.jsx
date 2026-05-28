import { useUser } from "./hooks/useUser";
import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ toggleTheme, isDark }) {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  if (!user.isLoggedIn) return null;

  return (
    <nav className={styles.navbar}>
      {!isHomePage ? (
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          ← Kembali
        </button>
      ) : (
        <div />
      )}

      <div className={styles.userInfo}>
        <button className={styles.toggleTrack} onClick={toggleTheme}>
          <span className={`${styles.toggleThumb} ${isDark ? styles.thumbDark : ""}`}/>
          <span className={styles.toggleIcon}>{isDark ? " " : " "}</span>
        </button>

        <span className={styles.greeting}>
          Halo, <strong>{user.name}</strong>!
        </span>

          <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Keluar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>      
          </button>
      </div>
    </nav>
  );
}
