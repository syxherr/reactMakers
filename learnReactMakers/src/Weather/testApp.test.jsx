import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import WeatherAppPage from "./WeatherAppPage";
import { getWeatherEmoji } from "./WeatherAppPage";

vi.mock("swr", () => ({ default: vi.fn() }));
import useSWR from "swr";

vi.mock("../components/effect/PixelSnow", () => ({ default: () => null }));
vi.mock("styled-components", () => ({ useTheme: () => ({ snow: "#ffffff" }) }));

// ─── Data dummy ───────────────────────────────────────────────────────────────

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

// Hanya 3 hari: Mon, Tue, Wed — sisanya (Thu-Sun) akan jadi "Coming Soon"
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

// ─── Helper mock SWR ──────────────────────────────────────────────────────────

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

describe("WeatherAppPage", () => {
  // ── R1: Search input & button ──────────────────────────────────────────────
  describe("R1 – Search input & button", () => {
    beforeEach(() => mockSWR());

    it("menampilkan input search dengan placeholder yang benar", () => {
      render(<WeatherAppPage />);
      expect(screen.getByPlaceholderText(/search city/i)).toBeInTheDocument();
    });

    it("menampilkan tombol Search", () => {
      render(<WeatherAppPage />);
      expect(
        screen.getByRole("button", { name: /search/i }),
      ).toBeInTheDocument();
    });
  });

  // ── T2: Error message ──────────────────────────────────────────────────────
  describe("T2 – Error message", () => {
    it("menampilkan pesan error saat fetch gagal", async () => {
      mockSWR({ currentErr: new Error("Fetch failed") });
      render(<WeatherAppPage />);
      expect(await screen.findByText(/try another city/i)).toBeInTheDocument();
    });
  });

  // ── R5: Data suhu tampil ───────────────────────────────────────────────────
  describe("R5 – Data suhu render ke DOM", () => {
    beforeEach(() => mockSWR());

    it("menampilkan suhu 27 dari 300K", async () => {
      render(<WeatherAppPage />);
      expect(await screen.findByText("27")).toBeInTheDocument();
      expect(screen.getByText("°C")).toBeInTheDocument();
    });

    it("menampilkan nama kota dari API", async () => {
      render(<WeatherAppPage />);
      expect(await screen.findByText(/Bandung, ID/i)).toBeInTheDocument();
    });
  });


  // ── D5: weeklyData per hari ───────────────────────────────────────────────
  describe("D5 – weeklyData per minggu", () => {
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

    it("menghasilkan tepat 7 hari", () => {
      expect(buildWeeklyData(mockForecast.list)).toHaveLength(7); //ganti
    });

    it("hari yang ada di forecast punya suhu angka", () => {
      const result = buildWeeklyData(mockForecast.list);
      const withTemp = result.filter((d) => typeof d.temp === "number");
      expect(withTemp.length).toBeGreaterThan(0);
    });

    it("hari yang tidak ada di forecast bertuliskan 'Coming Soon'", () => {
      // Forecast hanya punya beberapa hari, sisanya Coming Soon
      const result = buildWeeklyData(mockForecast.list.slice(0, 5));
      const comingSoon = result.filter((d) => d.temp === "Coming Soon");
      expect(comingSoon.length).toBeGreaterThan(0);
    });
  });

  it("mengembalikan emoji sesuai weather id", () => {
    expect(getWeatherEmoji(800)).toBe("☀️");
  });
});
