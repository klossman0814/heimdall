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
| Weather | [Open-Meteo](https://open-meteo.com) (free, no API key) |
| Docker | `node:20-alpine` → `nginx:alpine` multi-stage build |
| Port | `8086` |
