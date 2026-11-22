# Velvet Vault — A Midnight Heist

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Zikri167/makefun-best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Zikri167/makefun-best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A complete, original top-down heist game built for make.fun's "Make the best heist game" bounty ($50 in USDC). You are MOTH, a cat-burglar: steal every loot target in three museum rooms, dodge guards with vision cones and sweeping security cameras, watch the alarm meter, and slip out the green EXIT.

## Play

```sh
node serve.ts
```

Open http://localhost:8080 in desktop Chrome. No network, no build step — the game is static files under `game/`.

- **WASD / arrows** — move · **Shift** — sneak (slow, harder to spot)
- **E** — grab loot, or hold near a terminal to hack a camera off
- **Q or click** — throw a coin to lure a guard away
- **R** — retry the room · **M** — mute · **P** — pause

## The rooms

1. **The Gallery** — the Star Sapphire, one camera, two guards.
2. **The Vault Hall** — two paintings, two cameras, three guards.
3. **The Crown Room** — the Velvet Crown and two more treasures, three cameras.

Guards patrol, grow suspicious in stages (stare, investigate, chase), and run for you when the alarm hits 100%. Velvet curtains hide you. The HUD shows loot value, lives, time, coins, and the big ALARM meter.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the output directory and writes `dossier.json`.
- `game/index.html` + `game/src/` — the game itself, one job per file: `config.js` (rooms and tuning), `world.js` (grid, sight, movement), `guard.js` (patrol AI), `camera.js` (sweeping cameras), `thief.js` (movement, coins, hacking), `alarm.js` (the meter), `audio.js` (synthesized sound), `render.js` (all drawing and the HUD), `input.js`, `shots.js` (the four screenshot scenes), `main.js` (loop and screens).
- `screenshots/` — four real renders of the game's own code, taken in headless Chrome.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
