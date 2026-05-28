import { useState, useMemo } from "react";
import useSWR from "swr";
import styles from "./WeatherAppPage.module.css";
import PixelSnow from "../style/effect/PixelSnow";
import { useTheme } from "styled-components";
import { Helmet } from "react-helmet-async";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const fetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Gagal fetch data cuaca");
    return r.json();
  });

function kelvinToCelsius(k) {
  return Math.round(k - 273.15);
}

export function getWeatherEmoji(id) {
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return "☀️";
  if (id > 800) return "⛅";
  return "🌡️";
}

function formatHour(dtTxt) {
  return dtTxt.slice(11, 16);
}

// ─── Icon helpers (sama seperti sebelumnya) ───────────────────────────────────
function IconPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconDroplet() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}
function IconWind() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconSun() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Skeleton sederhana saat loading ─────────────────────────────────────────
function Skeleton({ width = "100%", height = "1rem", style = {} }) {
  return (
    <span
      style={{
        display: "inline-block",
        width,
        height,
        borderRadius: 6,
        background: "rgba(255,255,255,0.15)",
        animation: "pulse 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WeatherAppPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("perjam");
  // cityInput: apa yang sedang diketik; city: yang aktif di-fetch
  const [cityInput, setCityInput] = useState("Bandung");
  const [city, setCity] = useState("Bandung");

  const snowColor = useMemo(() => theme.snow, [theme.snow]);

  // ── SWR: current weather ──────────────────────────────────────────────────
  // Key berubah kalau `city` berubah → SWR otomatis re-fetch
  // revalidateOnFocus: false → tidak re-fetch tiap kali tab aktif (cukup tiap 10 menit)
  const {
    data: current,
    error: currentErr,
    isLoading: currentLoading,
  } = useSWR(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`,

    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10 * 60 * 1000 }, // cache 10 menit
  );

  // ── SWR: 5-day forecast (per 3 jam) ──────────────────────────────────────
  const {
    data: forecast,
    error: forecastErr,
    isLoading: forecastLoading,
  } = useSWR(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10 * 60 * 1000 },
  );

  // ── Proses data forecast ──────────────────────────────────────────────────
  // Hourly: ambil 7 slot pertama (setiap 3 jam)
  const hourlyData = forecast
    ? forecast.list.slice(0, 7).map((item, i) => ({
        label: i === 0 ? "Now" : formatHour(item.dt_txt),
        icon: getWeatherEmoji(item.weather[0].id),
        temp: kelvinToCelsius(item.main.temp),
        now: i === 0,
      }))
    : [];

  // Weekly: ambil 1 data per hari (noon / 12:00 kalau ada, fallback index pertama)
  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date().getDay()
  ];

  const forecastByDay = forecast
    ? forecast.list.reduce((acc, item) => {
        const d = new Date(item.dt_txt.replace(" ", "T"));
        const name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          d.getDay()
        ];
        if (!acc[name]) acc[name] = item;
        return acc;
      }, {})
    : {};

  const weeklyData = DAY_ORDER.map((day) => {
    const item = forecastByDay[day];
    return {
      day,
      icon: item ? getWeatherEmoji(item.weather[0].id) : " ",
      temp: item ? kelvinToCelsius(item.main.temp) : "Coming Soon",
      isToday: day === todayName,
    };
  });

  // ── Handler search ────────────────────────────────────────────────────────
  function handleSearch() {
    if (cityInput.trim()) setCity(cityInput.trim());
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  // ── Derived values dari current ───────────────────────────────────────────
  const tempNow = current ? kelvinToCelsius(current.main.temp) : null;
  const feelsLike = current ? kelvinToCelsius(current.main.feels_like) : null;
  const tempMax = current ? kelvinToCelsius(current.main.temp_max) : null;
  const tempMin = current ? kelvinToCelsius(current.main.temp_min) : null;
  const humidity = current?.main.humidity;
  const windSpeed = current ? Math.round(current.wind.speed * 3.6) : null; // m/s → km/h
  const visibility = current ? Math.round(current.visibility / 1000) : null; // m → km
  const weatherDesc = current?.weather[0].description;
  const weatherId = current?.weather[0].id;
  const cityName = current ? `${current.name}, ${current.sys.country}` : city;

  const isError = currentErr || forecastErr;

  // Tanggal lokal
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <Helmet>
        <title>Weather App</title>
        <meta name="description" content="Check the weather" />
      </Helmet>
      <div className={styles.container}>
        =
        <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
        {/* ── PixelSnow background ── */}
        <div className={styles.snowWrap} aria-hidden="true">
          <PixelSnow
            color={snowColor}
            flakeSize={0.01}
            minFlakeSize={1.25}
            pixelResolution={200}
            speed={1.25}
            density={0.3}
            direction={125}
            brightness={1}
            depthFade={8}
            farPlane={20}
            gamma={0.4545}
            variant="square"
          />
        </div>
        {/* ── Konten utama ── */}
        <div className={styles.root}>
          <div className={styles.wrapper}>
            {/* Search */}
            <div className={styles.searchRow}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                  <IconSearch />
                </span>
                <input
                  className={styles.searchInput}
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search city…"
                />
              </div>
              <button className={styles.searchBtn} onClick={handleSearch}>
                Search
              </button>
            </div>

            {/* Error state */}
            {isError && (
              <div
                style={{
                  color: "#ffaaaa",
                  padding: "0.5rem 0",
                  fontSize: "0.85rem",
                }}
              >
                Try another city
              </div>
            )}

            {/* Top grid */}
            <div className={styles.topGrid}>
              {/* Main panel */}
              <div className={styles.mainPanel}>
                <div className={styles.locationMeta}>
                  <span className={styles.pinIcon}>
                    <IconPin />
                  </span>
                  {currentLoading ? (
                    <Skeleton width="120px" height="0.85rem" />
                  ) : (
                    cityName
                  )}
                  <span className={styles.metaDot} />
                  {today}
                </div>
                <div className={styles.tempBlock}>
                  <div className={styles.tempRow}>
                    <span className={styles.tempEmoji}>
                      {currentLoading ? " " : getWeatherEmoji(weatherId)}
                    </span>
                    <span className={styles.tempValue}>
                      {currentLoading ? (
                        <Skeleton width="60px" height="3rem" />
                      ) : (
                        tempNow
                      )}
                    </span>
                    <span className={styles.tempDeg}>°C</span>
                  </div>
                  <div className={styles.tempDesc}>
                    {currentLoading ? (
                      <Skeleton width="180px" height="0.9rem" />
                    ) : (
                      <>
                        {weatherDesc} &nbsp;·&nbsp; Feels like {feelsLike}°C
                      </>
                    )}
                  </div>
                  <div className={styles.hiLo}>
                    <span className={styles.hi}>
                      ↑ {currentLoading ? " " : `${tempMax}°`}
                    </span>
                    <span className={styles.lo}>
                      ↓ {currentLoading ? " " : `${tempMin}°`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Humidity */}
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <IconDroplet />
                </span>
                <div className={styles.statValRow}>
                  <span className={styles.statValue}>
                    {currentLoading ? (
                      <Skeleton width="40px" height="1.5rem" />
                    ) : (
                      humidity
                    )}
                  </span>
                  <span className={styles.statUnit}>%</span>
                </div>
                <div className={styles.statLabel}>Humidity</div>
              </div>

              {/* Wind */}
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <IconWind />
                </span>
                <div className={styles.statValRow}>
                  <span className={styles.statValue}>
                    {currentLoading ? (
                      <Skeleton width="40px" height="1.5rem" />
                    ) : (
                      windSpeed
                    )}
                  </span>
                  <span className={styles.statUnit}>km/h</span>
                </div>
                <div className={styles.statLabel}>Wind Speed</div>
              </div>

              {/* Visibility */}
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <IconEye />
                </span>
                <div className={styles.statValRow}>
                  <span className={styles.statValue}>
                    {currentLoading ? (
                      <Skeleton width="40px" height="1.5rem" />
                    ) : (
                      visibility
                    )}
                  </span>
                  <span className={styles.statUnit}>km</span>
                </div>
                <div className={styles.statLabel}>Visibility</div>
              </div>

              {/* UV — accent (OpenWeather free tier tidak punya UV, pakai placeholder) */}
              <div className={`${styles.statCard} ${styles.accentCard}`}>
                <span className={styles.statIcon}>
                  <IconSun />
                </span>
                <div className={styles.statValRow}>
                  <span className={styles.statValue}>UV —</span>
                </div>
                <div className={styles.statLabel}>UV Index</div>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabRow}>
              <div className={styles.blurLayer}>
                <button
                  className={`${styles.tab} ${activeTab === "perjam" ? styles.active : ""}`}
                  onClick={() => setActiveTab("perjam")}
                >
                  Hourly
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "7hari" ? styles.active : ""}`}
                  onClick={() => setActiveTab("7hari")}
                >
                  7 Days
                </button>
              </div>
            </div>

            {/* Hourly */}
            {activeTab === "perjam" && (
              <div className={styles.hourlyScroll}>
                {forecastLoading
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className={styles.hourSlot}>
                        <Skeleton width="36px" height="0.75rem" />
                        <Skeleton
                          width="24px"
                          height="24px"
                          style={{ borderRadius: 4, margin: "4px 0" }}
                        />
                        <Skeleton width="32px" height="0.75rem" />
                      </div>
                    ))
                  : hourlyData.map((h) => (
                      <div
                        key={h.label}
                        className={`${styles.hourSlot} ${h.now ? styles.now : ""}`}
                      >
                        <span className={styles.hourLabel}>{h.label}</span>
                        <span className={styles.hourIcon}>{h.icon}</span>
                        <span
                          className={styles.hourTemp}
                          style={{
                            fontSize: h.temp === null ? "0.6rem" : undefined,
                          }}
                        >
                          {h.temp !== null ? `${h.temp}°` : "No data"}
                        </span>
                      </div>
                    ))}
              </div>
            )}

            {/* 7 Days */}
            {activeTab === "7hari" && (
              <div className={styles.hourlyScroll}>
                {forecastLoading
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className={styles.hourSlot}>
                        <Skeleton width="36px" height="0.75rem" />
                        <Skeleton
                          width="24px"
                          height="24px"
                          style={{ borderRadius: 4, margin: "4px 0" }}
                        />
                        <Skeleton width="32px" height="0.75rem" />
                      </div>
                    ))
                  : weeklyData.map((w) => (
                      <div
                        key={w.day}
                        className={`${styles.hourSlot} ${w.isToday ? styles.now : ""}`}
                      >
                        <span className={styles.hourLabel}>{w.day}</span>
                        <span className={styles.hourIcon}>{w.icon}</span>
                        <span
                          className={styles.hourTemp}
                          style={{
                            fontSize:
                              w.temp === "Coming Soon" ? "1rem" : undefined,
                            textAlign:
                              w.temp === "Coming Soon" ? "center" : undefined,
                            width:
                              w.temp === "Coming Soon" ? "100%" : undefined,
                            display:
                              w.temp === "Coming Soon" ? "block" : undefined,
                            fontFamily:
                              w.temp === "Coming Soon"
                                ? "Arial, sans-serif"
                                : undefined,
                          }}
                        >
                          {typeof w.temp === "number" ? `${w.temp}°` : w.temp}
                        </span>
                      </div>
                    ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
