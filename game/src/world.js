// Velvet Vault — the room grid: walls, display cases, curtains, and the
// line-of-sight and movement tests every actor shares.
import { TILE, VIEW_W, VIEW_H } from './config.js';

export const COLS = VIEW_W / TILE;
export const ROWS = VIEW_H / TILE;

// Build the solid grid for one level definition: border walls plus the
// level's wall rectangles and display cases. Curtains are not solid.
export function buildGrid(level) {
  const solid = new Uint8Array(COLS * ROWS);
  const blockSight = new Uint8Array(COLS * ROWS);
  const set = (c, r) => {
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
      solid[r * COLS + c] = 1;
      blockSight[r * COLS + c] = 1;
    }
  };
  for (let c = 0; c < COLS; c += 1) { set(c, 0); set(c, ROWS - 1); }
  for (let r = 0; r < ROWS; r += 1) { set(0, r); set(COLS - 1, r); }
  for (const w of level.walls) {
    for (let r = w.r; r < w.r + w.h; r += 1) {
      for (let c = w.c; c < w.c + w.w; c += 1) set(c, r);
    }
  }
  for (const cs of level.cases) set(cs.c, cs.r);
  return { solid, blockSight };
}

export function tileAt(grid, x, y) {
  const c = Math.floor(x / TILE);
  const r = Math.floor(y / TILE);
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return 1;
  return grid.solid[r * COLS + c];
}

// Circle-vs-grid movement: slide along one axis at a time so the thief and
// the guards never tunnel through a wall corner.
export function moveCircle(grid, pos, dx, dy, radius) {
  const nx = pos.x + dx;
  if (!hits(grid, nx, pos.y, radius)) pos.x = nx;
  const ny = pos.y + dy;
  if (!hits(grid, pos.x, ny, radius)) pos.y = ny;
}

function hits(grid, x, y, radius) {
  const c0 = Math.floor((x - radius) / TILE);
  const c1 = Math.floor((x + radius) / TILE);
  const r0 = Math.floor((y - radius) / TILE);
  const r1 = Math.floor((y + radius) / TILE);
  for (let r = r0; r <= r1; r += 1) {
    for (let c = c0; c <= c1; c += 1) {
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
      if (!grid.solid[r * COLS + c]) continue;
      const cx = Math.max(c * TILE, Math.min(x, c * TILE + TILE));
      const cy = Math.max(r * TILE, Math.min(y, r * TILE + TILE));
      const ddx = x - cx;
      const ddy = y - cy;
      if (ddx * ddx + ddy * ddy < radius * radius) return true;
    }
  }
  return false;
}

// Bresenham line of sight on the sight-blocking grid. A cone only sees
// the thief when this returns true.
export function hasLineOfSight(grid, x0, y0, x1, y1) {
  let c0 = Math.floor(x0 / TILE);
  let r0 = Math.floor(y0 / TILE);
  const c1 = Math.floor(x1 / TILE);
  const r1 = Math.floor(y1 / TILE);
  const dc = Math.abs(c1 - c0);
  const dr = Math.abs(r1 - r0);
  const sc = c0 < c1 ? 1 : -1;
  const sr = r0 < r1 ? 1 : -1;
  let err = dc - dr;
  for (;;) {
    if (c0 === c1 && r0 === r1) return true;
    if (grid.blockSight[r0 * COLS + c0]) return false;
    const e2 = 2 * err;
    if (e2 > -dr) { err -= dr; c0 += sc; }
    if (e2 < dc) { err += dc; r0 += sr; }
  }
}

export function dist(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

// Smallest signed difference between two angles, in (-PI, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}
