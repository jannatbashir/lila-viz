# LILA BLACK — Level Designer Visualization Tool

A web-based tool for LILA Games' level design team to explore player behavior across maps using 5 days of production telemetry data.

## Live Demo
🔗 https://lilablack.netlify.app/

## What it does
- Visualizes 89,104 player events across 3 maps (AmbroseValley, GrandRift, Lockdown)
- Heatmaps showing where players spend time
- Event markers for kills, deaths, loot pickups, and storm deaths
- Distinguishes human players from bots visually
- Filter by map, date, and individual match
- Match playback with timeline scrubber to watch matches unfold

## Tech Stack
- React + Vite
- HTML5 Canvas for map rendering
- Python + PyArrow for data preprocessing
- Netlify for hosting

## Setup
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`
4. Open `localhost:5173`

## Data Pipeline
Raw parquet files → Python export script → JSON files in `/public` → React app renders on canvas