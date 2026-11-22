// Velvet Vault — the thief, Moth. Walks, sneaks, grabs loot, throws coins
// to lure guards, and hacks camera terminals. Movement is axis-separated
// against the room grid, so walls always feel solid.
import { COIN, STEP, THIEF, tileCenter } from './config.js';
import { dist, moveCircle } from './world.js';

export function makeThief(start) {
  const p = tileCenter(start.c, start.r);
  return {
    x: p.x,
    y: p.y,
    facing: -Math.PI / 2,
    sneaking: false,
    moving: false,
    walkPhase: 0,
    coins: THIEF.coins,
    hackProgress: 0,
    hacking: null,
  };
}

export function updateThief(thief, input, grid) {
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  thief.moving = dx !== 0 || dy !== 0;
  thief.sneaking = !!input.sneak;
  if (thief.moving) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
    thief.facing = Math.atan2(dy, dx);
    const speed = thief.sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
    moveCircle(grid, thief, dx * speed * STEP, dy * speed * STEP, THIEF.radius);
    thief.walkPhase += STEP * speed * 0.06;
  }
}

// A thrown coin arcs to its landing spot and rings there; guards in earshot
// walk over to look. Returns the new coin or null when there is none to throw.
export function throwCoin(thief, targetX, targetY, state) {
  if (thief.coins <= 0) return null;
  const d = dist(thief.x, thief.y, targetX, targetY);
  const range = Math.min(d, COIN.throwRange);
  const angle = Math.atan2(targetY - thief.y, targetX - thief.x);
  thief.coins -= 1;
  const coin = {
    x: thief.x + Math.cos(angle) * range,
    y: thief.y + Math.sin(angle) * range,
    timer: COIN.ringSeconds,
  };
  state.coins.push(coin);
  for (const guard of state.guards) {
    if (dist(guard.x, guard.y, coin.x, coin.y) < COIN.lureRadius && guard.state !== 'chase') {
      guard.state = 'investigate';
      guard.investigateTimer = COIN.ringSeconds + 0.8;
      guard.investigateX = coin.x;
      guard.investigateY = coin.y;
      guard.suspicion = Math.max(guard.suspicion, 36);
    }
  }
  return coin;
}

export function nearestLoot(thief, loot) {
  let best = null;
  let bestD = 52;
  for (const item of loot) {
    if (item.taken) continue;
    const d = dist(thief.x, thief.y, item.x, item.y);
    if (d < bestD) { bestD = d; best = item; }
  }
  return best;
}

export function nearestTerminal(thief, terminals) {
  let best = null;
  let bestD = 56;
  for (const term of terminals) {
    const d = dist(thief.x, thief.y, term.x, term.y);
    if (d < bestD) { bestD = d; best = term; }
  }
  return best;
}
