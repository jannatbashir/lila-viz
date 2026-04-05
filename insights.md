# INSIGHTS.md — What the Data Revealed

---

## Insight 1: PvP Combat is Nearly Absent — This is an Accidental PvE Game

### What caught my eye
Across 796 matches and 339 players over 5 days, there were only **3 human vs human kills** total. Meanwhile, players killed bots 2,415 times. The game is marketed as an extraction shooter where other players are the biggest threat — but the data says otherwise.

### The evidence
| Event | Count |
|-------|-------|
| Kill (human kills human) | 3 |
| Killed (human killed by human) | 3 |
| BotKill (human kills bot) | 2,415 |
| BotKilled (human killed by bot) | 700 |

That's a **805:1 ratio** of bot kills to human kills. In a game with 796 matches, only 3 ended in a human-vs-human kill.

### Why a level designer should care
The maps may be too large or too sparse for human players to encounter each other. If players never meet, the extraction tension collapses — you're just doing a PvE farming run. The level designer should look at:
- Are there natural choke points that force player encounters?
- Are the extraction zones contested enough?
- Is the map size appropriate for the current player count?

### Actionable items
- **Shrink the playable zone** on AmbroseValley to increase forced encounters
- **Add high-value loot** near extraction points to create contested areas
- **Track** "player encounter rate" as a new metric — target at least 1 human encounter per match

---

## Insight 2: GrandRift is a Ghost Town — 8% of Activity vs 68% for AmbroseValley

### What caught my eye
Looking at the map distribution across all 89,104 events, GrandRift accounts for only 6,853 events — just 8% of total activity. AmbroseValley dominates at 61,013 (68%). Players are clearly avoiding GrandRift.

### The evidence
| Map | Events | Share |
|-----|--------|-------|
| AmbroseValley | 61,013 | 68% |
| Lockdown | 21,238 | 24% |
| GrandRift | 6,853 | 8% |

GrandRift has the tightest coordinate range (scale 581) suggesting it's a smaller, more compact map — yet it has the least activity. Even Lockdown, which is explicitly described as a "smaller/close-quarters map", gets 3x more play.

### Why a level designer should care
A map that players avoid wastes development resources and shrinks the effective player pool. If everyone is on AmbroseValley, matchmaking for GrandRift suffers — leading to longer queue times and more bot-filled matches which further discourages the map.

### Actionable items
- **Audit loot distribution** on GrandRift — is it rewarding enough to justify queuing?
- **Check if GrandRift is even in the map rotation** equally or if it's being selected less
- **Metrics to watch:** map selection rate, average match duration per map, player return rate per map

---

## Insight 3: Engagement is Collapsing — 86% Drop in 5 Days

### What caught my eye
The daily event volume tells a stark story. Day 1 had 33,687 events. By Day 4 it was down to 11,106. Day 5 (partial) had only 4,647. Even accounting for February 14 being a partial day, the trend is severe.

### The evidence
| Date | Events | Drop from Day 1 |
|------|--------|----------------|
| February 10 | 33,687 | — |
| February 11 | 21,235 | -37% |
| February 12 | 18,429 | -45% |
| February 13 | 11,106 | -67% |
| February 14 | 4,647 | -86% |

### Why a level designer should care
Retention collapse this steep within a single week suggests players are trying the game and not coming back. Map design directly affects this — if the maps feel repetitive, offer no new discovery, or don't reward exploration, players have no reason to return.

### The heatmap tells part of the story
The AmbroseValley heatmap shows extreme clustering in the center of the map — players are converging on the same areas every match. The outer regions of the map are almost completely dark. Players have "solved" the map in just a few sessions — they know where the loot is, where the action is, and they run the same route every time. There's no discovery left.

### Actionable items
- **Rotate loot spawn locations** to force players to explore different parts of the map each match
- **Add dynamic elements** — events, objectives, or high-value drops in underplayed zones
- **Metrics to watch:** Day 1 vs Day 7 retention, unique areas visited per match, average match count per player per week

---

## Summary for the Level Design Team

| Insight | Severity | Recommended Action |
|---------|----------|-------------------|
| PvP combat absent | 🔴 Critical | Redesign choke points and extraction zones |
| GrandRift ignored | 🟠 High | Audit loot and map rotation weighting |
| Retention collapsing | 🔴 Critical | Add map dynamism, rotate loot spawns |