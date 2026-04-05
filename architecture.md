# ARCHITECTURE.md

## What I Built
A browser-based visualization tool for LILA BLACK's level design team. It turns raw parquet telemetry files into an interactive map explorer — heatmaps, event markers, match playback, and filters — all running in the browser with no backend.

## Tech Stack & Why
| Tool | Why |
|------|-----|
| React + Vite | Fast to build, component-based UI, instant hot reload |
| HTML5 Canvas | Best for rendering thousands of points on a map image |
| Python + PyArrow | Fastest way to parse parquet files and export to JSON |
| Netlify | Free, instant deploy from GitHub, no config needed |

## Data Flow
Raw .nakama-0 parquet files (1,243 files, ~89k rows)
↓
Python export script (export.py) reads all files and combines them
↓
Clean JSON files saved to /public folder:
- summary.json — overall stats (89k events, 339 players, 796 matches)
- matches.json — list of all matches with metadata
- map_AmbroseValley.json, map_GrandRift.json, map_Lockdown.json — events per map
- matches/match_id.json — 796 individual match files for playback
↓
React app fetches these JSON files when the page loads
↓
HTML5 Canvas draws dots, heatmaps, and paths on top of the minimap image

## Coordinate Mapping
Each game event has a world position (x, z). To plot it on the 1024x1024 minimap image, I used this formula from the README:

u = (x - origin_x) / scale
v = (z - origin_z) / scale
pixel_x = u * 1024
pixel_y = (1 - v) * 1024

The Y axis is flipped because images count pixels from the top-left, but game coordinates count from the bottom-left. The y column in the data is elevation — ignored for 2D mapping.

## Assumptions Made
| Ambiguity | Decision |
|-----------|----------|
| Bot detection | UUID user_id = human, numeric ID = bot |
| Timestamps | Match-relative not wall-clock, sorted within match_id |
| Feb 14 partial day | Included but labeled clearly in filters |
| Heatmap performance | Sampled 5,000 positions per map instead of all 51k |

## Tradeoffs
| Decision | Alternative | Why I chose this |
|----------|-------------|-----------------|
| Pre-process to JSON | Query parquet at runtime | Faster load, no backend needed |
| Canvas rendering | SVG or WebGL | Simpler, sufficient for this data size |
| Static hosting on Netlify | Node.js server | No backend means free hosting and zero maintenance |

## Three Things I Learned About the Game
1. PvP is almost non-existent — only 3 human kills across 796 matches. Players are effectively playing PvE.
2. GrandRift is being ignored — only 8% of activity vs 68% for AmbroseValley. A map design or rotation problem.
3. Retention collapses fast — 86% drop in engagement from Day 1 to Day 4. The heatmap shows players have "solved" the map and run the same routes every time.