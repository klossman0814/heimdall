<div align="center">
  <img src="./public/favicon.svg" alt="" width="64" height="64">

  # Heimdall

  **A self-hosted homelab dashboard — start page for your services**

  [![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![React](https://img.shields.io/badge/React-19-087ea4?style=flat-square&logo=react&logoColor=white)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
  [![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

  ⭐ If you like this project, star it on GitHub — it helps a lot!

  [Features](#features) • [Getting started](#getting-started) • [Run with Docker](#run-with-docker) • [Configuration](#configuration) • [Tech stack](#tech-stack)

</div>

A modern replacement for the [original Heimdall](https://github.com/linuxserver/Heimdall) dashboard. No backend, no database — everything runs in your browser with data persisted to `localStorage`. Drop it behind a reverse proxy and you've got a clean start page for all your self-hosted services.

## Features

- **App tiles** — Add links to your services with auto-resolved icons (110+ apps via Simple Icons), custom colors, and Small/Medium/Large sizes
- **Icons pulled from the app's own website** — One click reads the site's `apple-touch-icon` / `rel="icon"` / web-manifest and embeds the real logo in your dashboard
- **Launch several sites at once** — Build one tile that opens a whole set of services in new tabs from a single click; hover it to open just one
- **Categories** — Organize apps into collapsible groups; rename or delete as needed
- **Drag & drop** — Reorder apps within a category by long-pressing and dragging
- **Smart suggestions** — Type an app name and get instant suggestions with icon preview; "Guess" button auto-fills the URL
- **Search bar** — Search via Google, Bing, DuckDuckGo, or a custom URL. `Ctrl+K` to focus
- **Weather forecast** — 7-day forecast powered by Open-Meteo (free, no API key). Type a city, get geocoded suggestions with current conditions, humidity, wind, and precipitation
- **Clock widget** — Live clock in 12h or 24h format
- **Notes widget** — Inline editable sticky notes persisted to localStorage
- **Dark / Light / System theme** — Full dark mode with System option that follows OS preference
- **Custom backgrounds** — Solid colors, gradients, curated Unsplash images, or custom upload with live preview
- **Backup & restore** — Export everything (apps, categories, settings) to a JSON file and import it back
- **PWA ready** — Installable with standalone display, theme color, and app icons
- **Docker** — Multi-stage build with nginx, ready to deploy on port 8086

## Getting started

### Prerequisites

- [Node.js LTS](https://nodejs.org/en/download) (v20 or later)

### Install and run

```bash
# Clone the repo
git clone https://github.com/klossman0814/heimdall.git
cd heimdall

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server starts on `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

## Run with Docker

```bash
docker build -t heimdall .
docker run -d --name heimdall -p 8086:8086 heimdall
```

Open `http://localhost:8086` in your browser.

> [!TIP]
> All data is stored in `localStorage`. To preserve your dashboard across container restarts, use the built-in **Export** feature from the settings panel to download a JSON backup.

## Configuration

### Adding apps

1. Click the **+** button to open the app form
2. Type a name — suggestions appear with matching apps and icon previews
3. The icon URL auto-fills from Simple Icons CDN; you can override it
4. Optionally set a color, category, and tile size

### Opening several sites with one click

Tick **Open several sites with one click** in the app form to turn a tile into a
launcher for a whole set of services — handy for entries that should always come
up together.

Each row is one site:

- **Add URL** for anything you want to paste in directly.
- **Add an existing app…** reuses a tile you already have. Those rows follow that
  app, so renaming it or fixing its URL updates every launcher pointing at it.
  If you later delete the app, the saved name and URL are kept so the launcher
  still works.

Clicking the tile opens every site in its own tab. Hover it and use the button in
the corner to open just one, or to check what is in there — the badge in the
bottom-left shows how many sites it launches.

- A launcher counts as one click against its own entry only, so launching a stack
  never floods **Top Items** with every app it started.
- The sites a launcher opens keep their own tiles on the dashboard; a launcher is
  purely additive.
- Sites are stored with the tile, so they survive a restart and are included in
  **Export**.
- Opening many tabs at once is your browser's popup-blocker decision. Chrome and
  Firefox allow a batch you triggered yourself; if a browser trims it, allow
  popups for your dashboard's address.

### Pulling an icon from the app's website

Enter the app's URL and hit **Fetch from site** next to the Icon field. Heimdall
asks the bundled server to open that URL, read the icons the page declares
(`apple-touch-icon`, `rel="icon"`, the web manifest, falling back to
`/favicon.ico`) and embed the winner straight into the tile — so the icon keeps
working even when the service is offline.

- Works for LAN-only addresses such as `http://192.168.1.5:8096` or `plex.lan`, because the server does the fetching — the browser alone cannot read another origin's HTML (CORS).
- The lookup is deliberately bounded: 8 second timeout, ≤4 redirects, and an icon larger than 512KB is refused so your saved data stays small.
- Link-local/metadata addresses (`169.254.0.0/16`) and multicast targets are rejected.
- If the server is not in front of the page (plain `npm run dev` without it, or static hosting), Heimdall falls back to a public favicon service by hostname. That only works for internet-reachable domains, and stores a remote URL instead of an embedded image.

In development the Vite dev server proxies `/api/fetch-icon` to
`http://localhost:8086` (override with `HEIMDALL_API_URL`), so run
`node server/index.js` alongside `npm run dev` to exercise the real lookup. Only
that one endpoint is proxied, so the dev server never touches a running
container's stored dashboard data.

### Search provider

Open the settings panel (gear icon in the top-right) and choose between Google, Bing, DuckDuckGo, or enter a custom search URL.

### Backgrounds

Choose from solid colors, gradients, or pre-selected Unsplash images. You can also upload your own image — it's stored as a data URL in `localStorage`.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build | [Vite 8](https://vitejs.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + CSS custom properties |
| State | [Zustand 5](https://github.com/pmndrs/zustand) |
| Drag & drop | [@dnd-kit](https://dndkit.com) |
| Icons | [Lucide](https://lucide.dev) (UI) + [Simple Icons](https://simpleicons.org) CDN (app icons) |
| Website icons | `GET /api/fetch-icon` (Express) with a Google favicon-service fallback |
| Weather | [Open-Meteo](https://open-meteo.com) (free, no API key) |
| Docker | `node:20-alpine` → `nginx:alpine` multi-stage build |
| Port | `8086` |
