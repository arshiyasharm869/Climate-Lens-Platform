# 🌍 ClimateLens — Climate Change Data Platform

Understand a changing planet. Explore climate data. Discover insights for a sustainable future.

ClimateLens is an interactive climate data platform for exploring global climate indicators, comparing regional trends, visualizing environmental changes, and generating AI-powered climate insights.

🔗 **Live Demo:** https://climatelens-platform.onrender.com

---

## ✨ Features

- 🏠 **Climate Dashboard** — Explore key climate indicators and global trends.
- 🗺️ **World Map** — Navigate climate-related information across the globe.
- 📊 **Data Explorer** — Explore climate indicators and their trends.
- ⚖️ **Compare** — Compare regions and climate-related data.
- ⚠️ **Climate Risks** — Explore environmental risks and potential impacts.
- 💬 **Climate AI chat** — Type any city or country for live weather, 24h/7-day forecast and air quality (Open-Meteo, no key needed; optional Gemini summaries).
- 🌍 **3D Earth** — NASA Blue Marble imagery, day/night shading, place labels, search + fly-to, click for weather.
- ⛅ **Weather & Forecast** — Search any place, hourly chart, 7-day forecast, sunrise/sunset, UV, air quality, saved cities.
- 🗺️ **Live Climate Map** — Temperature, feels-like, rain, humidity, wind, cloud, pressure and PM2.5 layers (Open-Meteo, 15° grid); click for local conditions.
- 📈 **Climate Analytics** — NASA GISTEMP temperature anomaly and NOAA Mauna Loa CO₂ records.
- 📰 **Climate News** — Recent articles via GDELT with topic, country and date filters.
- 🎨 **Settings** — Light/Dark/System theme, accent colour, density, animations, °C/°F, km/mi (saved in the browser).
- 🤖 **AI Insights** — Generate climate insights using Google's Gemini API.
- 📰 **Articles** — Access climate-related educational content.
- 📱 **Responsive Interface** — Works on supported desktop and mobile screens.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| Express.js | Backend API server |
| Google Gemini API | AI-powered climate insights |
| D3 (d3-geo) | Map projections |
| Three.js | 3D globe |

## 📁 Project Structure

```text
ClimateLens-Platform/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── services/
│   ├── types/
│   ├── views/
│   ├── App.tsx
│   ├── config.ts
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Google Gemini API key (optional — the app falls back to offline text without it)

### Installation

```bash
git clone <your-repository-url>
cd ClimateLens-Platform
npm install
```

Create a local `.env` file (see `.env.example`) and add your own key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the development server:

```bash
npm run dev
```

### Production Build

```bash
npm run build
NODE_ENV=production npm run start
```

## 🔐 Environment Variables

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | API key used by the backend for Gemini-powered insights |
| `FIRMS_MAP_KEY` | Optional free NASA FIRMS key for wildfire hotspots on the Live Climate Map |
| `PORT` | Server port (default 3000) |

> **Security:** Never commit real API keys or `.env` files. Configure production secrets through your hosting provider's environment settings.

## ☁️ Deployment

Deployed on Render as a Node.js/Express server serving the Vite-built frontend.
Set `NODE_ENV=production` and `GEMINI_API_KEY` in the Render environment settings.

## 🎯 Project Goals

- Make climate-related information easier to explore.
- Support comparison and visualization of environmental indicators.
- Encourage climate awareness through accessible data and AI-assisted explanations.

## 🔮 Future Improvements

- Integrate additional authoritative climate data sources.
- Add historical trends and richer interactive charts.
- Improve data provenance and source attribution.
- Expand regional comparison and climate-risk analysis.
- Improve accessibility, performance, and automated testing.

---

*ClimateLens — Explore the data. Understand the change. Shape a sustainable future.*
