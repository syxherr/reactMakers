import { useState, useMemo, useId } from "react";
import useSWR from "swr";
import styles from "./WeatherAppPage.module.css";
import PixelSnow from "../style/effect/PixelSnow";
import { useTheme } from "styled-components";
import { Helmet } from "react-helmet-async";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const fetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch weather data");
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

export function getWeatherLabel(id) {
  if (id >= 200 && id < 300) return "Thunderstorm";
  if (id >= 300 && id < 400) return "Drizzle";
  if (id >= 500 && id < 600) return "Rain";
  if (id >= 600 && id < 700) return "Snow";
  if (id >= 700 && id < 800) return "Fog";
  if (id === 800) return "Clear sky";
  if (id > 800) return "Partly cloudy";
  return "Unknown";
}

function formatHour(dtTxt) {
  return dtTxt.slice(11, 16);
}

function IconPin() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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
      aria-hidden="true"
      focusable="false"
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

function Skeleton({ width = "100%", height = "1rem", style = {} }) {
  return (
    <span
      aria-hidden="true"
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

function StatCard({ icon, value, unit, label, accent, loading }) {
  return (
    <div
      className={`${styles.statCard}${accent ? ` ${styles.accentCard}` : ""}`}
      aria-label={`${label}: ${loading ? "loading" : `${value}${unit ? " " + unit : ""}`}`}
    >
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statValRow} aria-hidden="true">
        <span className={styles.statValue}>
          {loading ? <Skeleton width="40px" height="1.5rem" /> : value}
        </span>
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </div>
      <div className={styles.statLabel} aria-hidden="true">
        {label}
      </div>
    </div>
  );
}

export default function WeatherAppPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("hourly");
  //city yang aktif di-fetch
  const [cityInput, setCityInput] = useState("Bandung");
  const [city, setCity] = useState("Bandung");

  const tabsId = useId();
  const hourlyTabId = `${tabsId}-tab-hourly`;
  const weeklyTabId = `${tabsId}-tab-weekly`;
  const hourlyPanelId = `${tabsId}-panel-hourly`;
  const weeklyPanelId = `${tabsId}-panel-weekly`;

  const snowColor = useMemo(() => theme.snow, [theme.snow]);

  // Key berubah kalau `city` berubah
  // tidak re-fetch tiap kali tab aktif (cukup tiap 10 menit)
  const {
    data: current,
    error: currentErr,
    isLoading: currentLoading,
  } = useSWR(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`,

    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10 * 60 * 1000 }, // cache 10 menit
  );

  // 5-day forecast (per 3 jam) ──────────────────────────────────────
  const {
    data: forecast,
    error: forecastErr,
    isLoading: forecastLoading,
  } = useSWR(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10 * 60 * 1000 },
  );

  // Hourlysetiap 3 jam
  const hourlyData = forecast
    ? forecast.list.slice(0, 7).map((item, i) => ({
        label: i === 0 ? "Now" : formatHour(item.dt_txt),
        icon: getWeatherEmoji(item.weather[0].id),
        weatherLabel: getWeatherLabel(item.weather[0].id),
        temp: kelvinToCelsius(item.main.temp),
        now: i === 0,
      }))
    : [];

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
      weatherLabel: item ? getWeatherLabel(item.weather[0].id) : "No data",
      temp: item ? kelvinToCelsius(item.main.temp) : "Coming Soon",
      isToday: day === todayName,
    };
  });

  function handleSearch() {
    if (cityInput.trim()) setCity(cityInput.trim());
  }
  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const pageTitle = currentLoading
    ? `Loading… — Weather App`
    : isError
      ? `City Not Found — Weather App`
      : `${cityName} · ${tempNow}°C ${weatherDesc ?? ""} — Weather App`;

  const pageDescription = currentLoading
    ? "Loading current weather conditions."
    : isError
      ? "Weather data not available. Try searching for another city."
      : `Current weather in ${cityName}: ${tempNow}°C, ${weatherDesc}. Humidity ${humidity}%, wind ${windSpeed} km/h.`;

  return (
    <>
      <Helmet>
        <title>Real-Time Weather Forecast</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className={styles.container} aria-label="Weather application">
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
        <div className={styles.root}>
          <div className={styles.wrapper}>
            <div className={styles.searchRow} role="search">
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                  <IconSearch />
                </span>

                <input
                  id="city-search"
                  className={styles.searchInput}
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search city…"
                  type="search"
                  autoComplete="off"
                  aria-label="City name"
                />
              </div>
              <button
                className={styles.searchBtn}
                onClick={handleSearch}
                aria-label={`Search weather for ${cityInput || "city"}`}
              >
                Search
              </button>
            </div>

            {isError && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  color: "#ffaaaa",
                  padding: "0.5rem 0",
                  fontSize: "0.85rem",
                }}
              >
                City not found. Please try another city name.
              </div>
            )}

            {/* ✅ aria-busy during loading so screen readers know content is updating */}
            <div
              className={styles.topGrid}
              aria-busy={currentLoading}
              aria-label="Current weather conditions"
            >
              {/* Main panel */}
              <div className={styles.mainPanel}>
                <div className={styles.locationMeta}>
                  <span className={styles.pinIcon} aria-hidden="true">
                    <IconPin />
                  </span>
                  {/* ✅ visually-hidden text for location + date gives full context */}
                  <span
                    aria-label={`Location: ${currentLoading ? "loading" : cityName}, ${today}`}
                  >
                    {currentLoading ? (
                      <Skeleton width="120px" height="0.85rem" />
                    ) : (
                      cityName
                    )}
                    <span className={styles.metaDot} aria-hidden="true" />
                    {today}
                  </span>
                </div>

                <div className={styles.tempBlock}>
                  <div className={styles.tempRow}>
                    {/* ✅ emoji aria-hidden; weather label is in tempDesc below */}
                    <span className={styles.tempEmoji} aria-hidden="true">
                      {currentLoading ? " " : getWeatherEmoji(weatherId)}
                    </span>
                    <span
                      className={styles.tempValue}
                      aria-label={
                        currentLoading
                          ? "Loading temperature"
                          : `Temperature: ${tempNow} degrees Celsius`
                      }
                    >
                      {currentLoading ? (
                        <Skeleton width="60px" height="3rem" />
                      ) : (
                        tempNow
                      )}
                    </span>
                    <span className={styles.tempDeg} aria-hidden="true">
                      °C
                    </span>
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
                    <span
                      className={styles.hi}
                      aria-label={
                        currentLoading
                          ? "Loading high temperature"
                          : `High: ${tempMax} degrees`
                      }
                    >
                      <span aria-hidden="true">↑</span>{" "}
                      {currentLoading ? " " : `${tempMax}°`}
                    </span>
                    <span
                      className={styles.lo}
                      aria-label={
                        currentLoading
                          ? "Loading low temperature"
                          : `Low: ${tempMin} degrees`
                      }
                    >
                      <span aria-hidden="true">↓</span>{" "}
                      {currentLoading ? " " : `${tempMin}°`}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ StatCard components with aria-label */}
              <StatCard
                icon={<IconDroplet />}
                value={humidity}
                unit="%"
                label="Humidity"
                loading={currentLoading}
              />
              <StatCard
                icon={<IconWind />}
                value={windSpeed}
                unit="km/h"
                label="Wind Speed"
                loading={currentLoading}
              />
              <StatCard
                icon={<IconEye />}
                value={visibility}
                unit="km"
                label="Visibility"
                loading={currentLoading}
              />
              <StatCard
                icon={<IconSun />}
                value="—"
                label="UV Index"
                accent
                loading={false}
              />
            </div>

            {/* ✅ Tabs — full ARIA tab pattern */}
            <div className={styles.tabRow}>
              <div
                className={styles.blurLayer}
                role="tablist"
                aria-label="Forecast view"
              >
                <button
                  id={hourlyTabId}
                  role="tab"
                  aria-selected={activeTab === "hourly"}
                  aria-controls={hourlyPanelId}
                  className={`${styles.tab} ${activeTab === "hourly" ? styles.active : ""}`}
                  onClick={() => setActiveTab("hourly")}
                  // ✅ keyboard: only the active tab is in tab order; arrows switch tabs
                  tabIndex={activeTab === "hourly" ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                      setActiveTab("weekly");
                    }
                    if (e.key === "ArrowLeft") {
                      setActiveTab("hourly");
                    }
                  }}
                >
                  Hourly
                </button>
                <button
                  id={weeklyTabId}
                  role="tab"
                  aria-selected={activeTab === "weekly"}
                  aria-controls={weeklyPanelId}
                  className={`${styles.tab} ${activeTab === "weekly" ? styles.active : ""}`}
                  onClick={() => setActiveTab("weekly")}
                  tabIndex={activeTab === "weekly" ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                      setActiveTab("weekly");
                    }
                    if (e.key === "ArrowLeft") {
                      setActiveTab("hourly");
                    }
                  }}
                >
                  7 Days
                </button>
              </div>
            </div>

            {/* ✅ Tab panels — role="tabpanel" with proper labelling */}
            <div
              id={hourlyPanelId}
              role="tabpanel"
              aria-labelledby={hourlyTabId}
              hidden={activeTab !== "hourly"}
              aria-busy={forecastLoading}
            >
              <div className={styles.hourlyScroll}>
                {forecastLoading
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={styles.hourSlot}
                        aria-hidden="true"
                      >
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
                        // ✅ gives each slot a full readable label
                        aria-label={`${h.label}: ${h.weatherLabel}, ${h.temp !== null ? h.temp + " degrees" : "no data"}`}
                      >
                        <span className={styles.hourLabel} aria-hidden="true">
                          {h.label}
                        </span>
                        <span className={styles.hourIcon} aria-hidden="true">
                          {h.emoji}
                        </span>
                        <span className={styles.hourTemp} aria-hidden="true">
                          {h.temp !== null ? `${h.temp}°` : "No data"}
                        </span>
                      </div>
                    ))}
              </div>
            </div>

            <div
              id={weeklyPanelId}
              role="tabpanel"
              aria-labelledby={weeklyTabId}
              hidden={activeTab !== "weekly"}
              aria-busy={forecastLoading}
            >
              <div className={styles.hourlyScroll}>
                {forecastLoading
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={styles.hourSlot}
                        aria-hidden="true"
                      >
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
                        aria-label={`${w.isToday ? "Today, " : ""}${w.day}: ${w.weatherLabel}, ${typeof w.temp === "number" ? w.temp + " degrees" : w.temp}`}
                      >
                        <span className={styles.hourLabel} aria-hidden="true">
                          {w.day}
                        </span>
                        <span className={styles.hourIcon} aria-hidden="true">
                          {w.emoji}
                        </span>
                        <span
                          className={styles.hourTemp}
                          aria-hidden="true"
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
