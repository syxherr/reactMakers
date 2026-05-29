import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, beforeAll } from "vitest";
import WeatherAppPage from "../Weather/WeatherAppPage";
import { getWeatherEmoji } from "../Weather/WeatherAppPage";
import { MemoryRouter } from "react-router-dom";
import Home from "../Home/Home";
import { UserProvider } from "../post/context/UserContext";
import { HelmetProvider } from "react-helmet-async";

beforeAll(() => {
  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

beforeEach(() => {
  localStorage.clear();
});

vi.mock("swr", () => ({ default: vi.fn() }));
import useSWR from "swr";

vi.mock("../style/effect/PixelSnow", () => ({ default: () => null }));
vi.mock("styled-components", () => ({ useTheme: () => ({ snow: "#ffffff" }) }));
vi.mock("react-helmet-async", () => ({
  Helmet: () => null,
  HelmetProvider: ({ children }) => children,
}));
// Data dummy
const mockCurrent = {
  name: "Bandung",
  sys: { country: "ID" },
  main: {
    temp: 300,
    feels_like: 298,
    temp_max: 302,
    temp_min: 296,
    humidity: 80,
  },
  wind: { speed: 3 },
  visibility: 10000,
  weather: [{ id: 800, description: "clear sky" }],
};

// Hanya 3 hari: Mon, Tue, Wed — sisanya "Coming Soon"
const mockForecast = {
  list: [
    {
      dt_txt: "2024-05-20 12:00:00",
      main: { temp: 300 },
      weather: [{ id: 800, description: "clear sky" }],
    }, // Mon
    {
      dt_txt: "2024-05-21 12:00:00",
      main: { temp: 301 },
      weather: [{ id: 800, description: "clear sky" }],
    }, // Tue
    {
      dt_txt: "2024-05-22 12:00:00",
      main: { temp: 302 },
      weather: [{ id: 800, description: "clear sky" }],
    }, // Wed
  ],
};

// Helper mock SWR

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <UserProvider>
          <Home />
        </UserProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function mockSWR({ currentErr = null, loading = false } = {}) {
  useSWR.mockImplementation((url) => {
    if (url.includes("/weather")) {
      return {
        data: loading || currentErr ? undefined : mockCurrent,
        error: currentErr,
        isLoading: loading,
      };
    }
    if (url.includes("/forecast")) {
      return {
        data: loading ? undefined : mockForecast,
        error: null,
        isLoading: loading,
      };
    }
    return { data: undefined, error: null, isLoading: false };
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("HomeScreen", () => {
  it("1. render button and input components", () => {
    renderHome();
    expect(
      screen.getByRole("button", { name: /submit name/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
  });

  it("updates the input value when the user types", () => {
    renderHome();
    const input = screen.getByPlaceholderText(/your name/i);
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(input.value).toBe("John Doe");
  });

  it("clicking enter button after fill name will redirect to home screen", async () => {
  renderHome();
  fireEvent.change(screen.getByPlaceholderText(/your name/i), {
    target: { value: "Shaskia" },
  });
  fireEvent.click(screen.getByRole("button", { name: /submit name/i }));

  expect(
    await screen.findByText(/what would you like to explore/i)
  ).toBeInTheDocument();
  });
});

describe("WeatherAppPage", () => {
  // ── R1: Search input & button
  describe("R1 – search input & button", () => {
    beforeEach(() => mockSWR());

    it("render search input w correct placeholder", () => {
      render(<WeatherAppPage />);
      expect(screen.getByPlaceholderText(/search city/i)).toBeInTheDocument();
    });

    it("render search button", () => {
      render(<WeatherAppPage />);
      expect(
        screen.getByRole("button", { name: /search/i }),
      ).toBeInTheDocument();
    });
  });

  // ── T2: Error message ──────────────────────────────────────────────────────
  describe("T2 – Error message", () => {
    it("render an error message when fetch fail", async () => {
      mockSWR({ currentErr: new Error("Fetch failed") });
      render(<WeatherAppPage />);
      expect(await screen.findByText(/try another city/i)).toBeInTheDocument();
    });
  });

  // ── R5: Data suhu tampil ───────────────────────────────────────────────────
  describe("R5 – Temperature data rendered to DOM", () => {
    beforeEach(() => mockSWR());

    it("temperature data rendered 27 from 300K", async () => {
      render(<WeatherAppPage />);
      expect(await screen.findByText("27")).toBeInTheDocument();
      expect(screen.getByText("°C")).toBeInTheDocument();
    });

    it("renders the city name from the API", async () => {
      render(<WeatherAppPage />);
      expect(await screen.findByText(/Bandung, ID/i)).toBeInTheDocument();
    });
  });

  // ── D5: weeklyData per hari ───────────────────────────────────────────────
  describe("D5 – weeklyData per week", () => {
    const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    function buildWeeklyData(forecastList) {
      const forecastByDay = forecastList.reduce((acc, item) => {
        const d = new Date(item.dt_txt.replace(" ", "T"));
        const name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          d.getDay()
        ];
        if (!acc[name]) acc[name] = item;
        return acc;
      }, {});

      return DAY_ORDER.map((day) => {
        const item = forecastByDay[day];
        return {
          day,
          temp: item ? Math.round(item.main.temp - 273.15) : "Coming Soon",
        };
      });
    }

    it("show exactly 7 days", () => {
      expect(buildWeeklyData(mockForecast.list)).toHaveLength(7); //ganti
    });

    it("days available in the forecast should contain numeric temperatures", () => {
      const result = buildWeeklyData(mockForecast.list);
      const withTemp = result.filter((d) => typeof d.temp === "number");
      expect(withTemp.length).toBeGreaterThan(0);
    });

    it("days that not available in the forecast should display 'Coming Soon'", () => {
      // Forecast hanya punya beberapa hari, sisanya Coming Soon
      const result = buildWeeklyData(mockForecast.list.slice(0, 5));
      const comingSoon = result.filter((d) => d.temp === "Coming Soon");
      expect(comingSoon.length).toBeGreaterThan(0);
    });
  });

  it("show correct emoji based on the weather id", () => {
    expect(getWeatherEmoji(800)).toBe("☀️");
  });
});
