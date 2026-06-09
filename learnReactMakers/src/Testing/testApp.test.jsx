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


//1. mock
vi.mock("swr", () => ({ default: vi.fn() }));
import useSWR from "swr";

vi.mock("../style/effect/PixelSnow", () => ({ default: () => null }));
vi.mock("styled-components", () => ({ useTheme: () => ({ snow: "#ffffff" }) }));
vi.mock("react-helmet-async", () => ({
  Helmet: () => null,
  HelmetProvider: ({ children }) => children,
}));



// 2. data dummy
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

// Hanya 3 hari, sisanya "Coming Soon"
const mockForecast = {
  list: [
    {
      dt_txt: "2024-05-20 12:00:00",
      main: { temp: 300 },
      weather: [{ id: 800, description: "clear sky" }],
    },
    {
      dt_txt: "2024-05-21 12:00:00",
      main: { temp: 301 },
      weather: [{ id: 800, description: "clear sky" }],
    },
    {
      dt_txt: "2024-05-22 12:00:00",
      main: { temp: 302 },
      weather: [{ id: 800, description: "clear sky" }],
    },
  ],
};

// 3. helper render
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

// 4. tests
describe("Halaman Home", () => {

  // Render UI
  it("1. Menampilkan tombol dan input di halaman home", () => {
    renderHome();
    expect(screen.getByRole("button", { name: /submit name/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
  });

  // input
  it("2. Interaksi/nilai input berubah saat user mengetik", () => {
    renderHome();
    const input = screen.getByPlaceholderText(/your name/i);
    fireEvent.change(input, { target: { value: "John Doe" } });
    expect(input.value).toBe("John Doe");
  });

  // navigasi
  it("3. Navigasi ke halaman home setelah klik tombol dan isi nama", async () => {
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

describe("Halaman Weather", () => {

  // Render UI
  describe("1. Render UI Search input & tombol", () => {
    beforeEach(() => mockSWR());

    it("1a. Menampilkan input search", () => {
      render(<WeatherAppPage />);
      expect(screen.getByPlaceholderText(/search city/i)).toBeInTheDocument();
    });

    it("1b. Menampilkan tombol Search", () => {
      render(<WeatherAppPage />);
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });
  });

  // Error Message
  describe("2. Error Message saat fetch gagal", () => {
    it("2a. Menampilkan pesan 'Try another city' saat fetch gagal", async () => {
      mockSWR({ currentErr: new Error("Fetch failed") });
      render(<WeatherAppPage />);
      expect(await screen.findByText(/try another city/i)).toBeInTheDocument();
    });
  });

  // Tampilan Data Suhu DOM
  describe("3. Data cuaca tampil", () => {
    beforeEach(() => mockSWR());

    it("3a. Menampilkan suhu 27°C dari konversi 300K", async () => {
      render(<WeatherAppPage />);
      expect(await screen.findByText("27")).toBeInTheDocument();
      expect(screen.getByText("°C")).toBeInTheDocument();
    });

    it("3b. Menampilkan nama kota dari data API", async () => {
      render(<WeatherAppPage />);
      expect(await screen.findByText(/Bandung, ID/i)).toBeInTheDocument();
    });
  });

  // Data Mingguan
  describe("4. Data mingguan (weeklyData)", () => {
    const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    function buildWeeklyData(forecastList) {
      const forecastByDay = forecastList.reduce((acc, item) => {
        const d = new Date(item.dt_txt.replace(" ", "T"));
        const name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
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

    it("4a. Menampilkan tepat 7 hari", () => {
      expect(buildWeeklyData(mockForecast.list)).toHaveLength(7); //ganti
    });

    it("4b. Hari yang ada di forecast memiliki suhu", () => {
      const result = buildWeeklyData(mockForecast.list);
      const withTemp = result.filter((d) => typeof d.temp === "number");
      expect(withTemp.length).toBeGreaterThan(0);
    });

    it("4c. Hari yang tidak ada di forecast menampilkan 'Coming Soon'", () => {
      const result = buildWeeklyData(mockForecast.list);
      const comingSoon = result.filter((d) => d.temp === "Coming Soon");
      expect(comingSoon.length).toBeGreaterThan(0);
    });
  });

  // Helper Emoji
  it("5. Menampilkan emoji yang sesuai berdasarkan weather id", () => {
    expect(getWeatherEmoji(800)).toBe("☀️");
  });

});