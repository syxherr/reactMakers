import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
 
  body {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    margin: 0;
    transition: background-color 0.25s ease, color 0.25s ease;
    font-family: "DM Sans", "Segoe UI", sans-serif;
  }
 
  /*
    Semua var(--xxx) di bawah langsung dibaca oleh WeatherCard.module.css.
    CSS Module tidak bisa import dari ThemeProvider secara langsung,
    jadi kita inject ke :root di sini — itulah jembatannya.
  */
  :root {
    /* ── Backgrounds ── */
    --bg:              ${({ theme }) => theme.bg};
    --bg-card:         ${({ theme }) => theme.bgCard};
    --bg-card:         ${({ theme }) => theme.bgCard2};
    --bg-card-hover:   ${({ theme }) => theme.bgCardHover};
 
    /* ── Text ── */
    --text:            ${({ theme }) => theme.text};
    --text2:           ${({ theme }) => theme.text2};
    --text-muted:      ${({ theme }) => theme.textMuted};
     --text-muted2:      ${({ theme }) => theme.textMuted2};
     --fab                ${({ theme }) => theme.fab};
    /* ── Accent (primary purple) ── */
    --accent:          ${({ theme }) => theme.accent};
    --accent-hover:    ${({ theme }) => theme.accentHover};
    --accent-light:    ${({ theme }) => theme.accentLight};
    --accent-glow:     ${({ theme }) => theme.accentGlow};
 
    /* ── Accent warm (amber — hi temp) ── */
    --accent-warm:     ${({ theme }) => theme.accentWarm};
 
    /* ── Accent pink (UV card value) ── */
    --accent-pink:     ${({ theme }) => theme.accentPink};
 
    /* ── Borders ── */
    --border:          ${({ theme }) => theme.border};
    --border2:        ${({ theme }) => theme.border2};
     --border3:        ${({ theme }) => theme.border3};

    /* ── Shadows ── */
    --shadow-soft:     ${({ theme }) => theme.shadowSoft};
    --shadow-btn:      ${({ theme }) => theme.shadowBtn};
    --shadow-card:     ${({ theme }) => theme.shadowCard};
 
    --snow:            ${({ theme }) => theme.snow};
    --text-days:       ${({ theme }) => theme.textDays};
    /* ── Shape ── */
    --radius:          16px;
    --radius-sm:       12px;
    --radius-pill:     99px;

    --btn:             ${({ theme }) => theme.btn};

    --bg2:             ${({ theme }) => theme.bg2};

    --navBar:          ${({ theme }) => theme.navBar};

    
    /* ── Motion ── */
    --transition:      0.18s cubic-bezier(0.4, 0, 0.2, 1);
 
    /* ── Typography ── */
    --font-body:       "DM Sans", "Segoe UI", sans-serif;
    --font-mono:       "DM Mono", monospace;
    --font-serif:      "Lora", Georgia, serif;
  }
`;
export default GlobalStyle;
