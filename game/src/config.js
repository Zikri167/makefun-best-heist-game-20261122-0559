// Velvet Vault — tuning constants and the three rooms.
// One tile is 40 px; the canvas is 1280 x 720 (32 x 18 tiles).
// Rooms are built from rectangles and placed objects, never from text maps,
// so every coordinate below is a tile column / row the builder can trust.
export const TILE = 40;
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 64;
export const STEP = 1 / 60;

export const THIEF = {
  walkSpeed: 165,
  sneakSpeed: 88,
  radius: 13,
  coins: 3,
};

export const GUARD = {
  patrolSpeed: 56,
  investigateSpeed: 78,
  chaseSpeed: 108,
  radius: 14,
  coneRange: 245,
  coneHalfAngle: 0.66,
  catchDistance: 22,
  suspicionPerSecond: 46,
  suspicionDecayPerSecond: 26,
  stareSeconds: 0.7,
  investigateSeconds: 3.2,
};

export const CAMERA = {
  range: 285,
  coneHalfAngle: 0.38,
  alarmPerSecond: 17,
  sweepSeconds: 5.2,
  hackSeconds: 2.5,
  disabledSeconds: 20,
};

export const ALARM = {
  guardPerSecond: 21,
  decayPerSecond: 7,
  lockdownSeconds: 6,
  afterLockdown: 55,
  caughtReset: 35,
};

export const COIN = { throwRange: 190, lureRadius: 290, ringSeconds: 3 };

// A wall rectangle: {c, r, w, h} in tiles. A case is a solid 1x1 block that
// also blocks sight; a curtain is a 2x1 hide spot the thief can stand in.
function room(def) {
  return def;
}

export const LEVELS = [
  room({
    name: 'The Gallery',
    sub: 'Level 1 — steal the Star Sapphire',
    loot: [{ c: 22, r: 6, name: 'Star Sapphire', value: 12000, kind: 'gem' }],
    walls: [
      { c: 14, r: 3, w: 1, h: 5 },
      { c: 20, r: 11, w: 8, h: 1 },
      { c: 6, r: 11, w: 1, h: 4 },
    ],
    cases: [
      { c: 10, r: 5 }, { c: 21, r: 5 }, { c: 16, r: 12 }, { c: 24, r: 13 },
    ],
    curtains: [{ c: 4, r: 8 }, { c: 26, r: 8 }],
    guards: [
      { waypoints: [[8, 9], [24, 9]] },
      { waypoints: [[24, 4], [24, 14]] },
    ],
    cameras: [{ c: 30, r: 2, baseDeg: 135, arcDeg: 70 }],
    terminals: [{ c: 2, r: 3 }],
    exit: { c: 29, r: 15 },
    start: { c: 2, r: 15 },
  }),
  room({
    name: 'The Vault Hall',
    sub: 'Level 2 — two paintings, two cameras',
    loot: [
      { c: 8, r: 4, name: 'Portrait of the Fox', value: 9000, kind: 'painting' },
      { c: 25, r: 13, name: 'The Gilded Mare', value: 14000, kind: 'painting' },
    ],
    walls: [
      { c: 10, r: 3, w: 1, h: 6 },
      { c: 18, r: 9, w: 1, h: 6 },
      { c: 22, r: 3, w: 7, h: 1 },
    ],
    cases: [
      { c: 14, r: 6 }, { c: 6, r: 12 }, { c: 26, r: 6 }, { c: 12, r: 14 },
    ],
    curtains: [{ c: 3, r: 6 }, { c: 28, r: 11 }],
    guards: [
      { waypoints: [[5, 9], [15, 9], [15, 14], [5, 14]] },
      { waypoints: [[20, 5], [28, 5]] },
      { waypoints: [[27, 10], [27, 15]] },
    ],
    cameras: [
      { c: 1, r: 2, baseDeg: 55, arcDeg: 60 },
      { c: 30, r: 9, baseDeg: 185, arcDeg: 70 },
    ],
    terminals: [{ c: 2, r: 13 }, { c: 29, r: 3 }],
    exit: { c: 15, r: 16 },
    start: { c: 2, r: 15 },
  }),
  room({
    name: 'The Crown Room',
    sub: 'Level 3 — the Crown, then the skylight',
    loot: [
      { c: 16, r: 8, name: 'The Velvet Crown', value: 25000, kind: 'crown' },
      { c: 6, r: 5, name: 'Moon Pearl', value: 11000, kind: 'gem' },
      { c: 26, r: 12, name: 'Emerald Idol', value: 16000, kind: 'gem' },
    ],
    walls: [
      { c: 11, r: 4, w: 1, h: 5 },
      { c: 20, r: 9, w: 1, h: 6 },
      { c: 5, r: 12, w: 6, h: 1 },
    ],
    cases: [
      { c: 16, r: 4 }, { c: 9, r: 9 }, { c: 23, r: 7 }, { c: 14, r: 14 },
    ],
    curtains: [{ c: 3, r: 9 }, { c: 28, r: 5 }],
    guards: [
      { waypoints: [[6, 8], [14, 8]] },
      { waypoints: [[18, 13], [26, 13]] },
      { waypoints: [[25, 4], [25, 10]] },
    ],
    cameras: [
      { c: 1, r: 2, baseDeg: 60, arcDeg: 65 },
      { c: 30, r: 2, baseDeg: 120, arcDeg: 65 },
      { c: 16, r: 16, baseDeg: 270, arcDeg: 60 },
    ],
    terminals: [{ c: 2, r: 15 }, { c: 29, r: 14 }],
    exit: { c: 16, r: 2 },
    start: { c: 16, r: 15 },
  }),
];

export function tileCenter(c, r) {
  return { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
}
