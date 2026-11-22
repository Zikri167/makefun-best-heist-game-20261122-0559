// Velvet Vault — guard patrol, suspicion, investigation and chase.
// A guard never teleports: it walks its waypoints, turns toward what it
// watches, and only runs when it is sure it saw the thief.
import { GUARD, STEP, tileCenter } from './config.js';
import { angleDiff, angleTo, dist, hasLineOfSight, moveCircle } from './world.js';

export function makeGuard(def) {
  const points = def.waypoints.map(([c, r]) => tileCenter(c, r));
  return {
    x: points[0].x,
    y: points[0].y,
    facing: 0,
    waypoints: points,
    waypointIndex: 1 % points.length,
    state: 'patrol',
    suspicion: 0,
    stareTimer: 0,
    investigateTimer: 0,
    investigateX: 0,
    investigateY: 0,
    walkPhase: 0,
  };
}

function seesThief(guard, thief, grid, hidden) {
  const d = dist(guard.x, guard.y, thief.x, thief.y);
  if (d > GUARD.coneRange) return 0;
  if (hidden && d > 60) return 0;
  const toThief = angleTo(guard.x, guard.y, thief.x, thief.y);
  if (Math.abs(angleDiff(toThief, guard.facing)) > GUARD.coneHalfAngle) return 0;
  if (!hasLineOfSight(grid, guard.x, guard.y, thief.x, thief.y)) return 0;
  // Closer and louder is easier to spot; sneaking halves the rate.
  const closeness = 1.35 - (d / GUARD.coneRange) * 0.85;
  return GUARD.suspicionPerSecond * closeness * (thief.sneaking ? 0.5 : 1);
}

function walkToward(guard, grid, tx, ty, speed) {
  const d = dist(guard.x, guard.y, tx, ty);
  if (d < 2) return true;
  const vx = ((tx - guard.x) / d) * speed * STEP;
  const vy = ((ty - guard.y) / d) * speed * STEP;
  guard.facing = angleTo(guard.x, guard.y, tx, ty);
  moveCircle(grid, guard, vx, vy, GUARD.radius);
  guard.walkPhase += STEP * speed * 0.06;
  return d < speed * STEP * 1.5;
}

export function updateGuard(guard, thief, grid, hidden, alarm) {
  const seen = seesThief(guard, thief, grid, hidden);
  if (seen > 0) {
    guard.suspicion = Math.min(100, guard.suspicion + seen * STEP);
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - GUARD.suspicionDecayPerSecond * STEP);
  }

  if (guard.state === 'patrol') {
    const target = guard.waypoints[guard.waypointIndex];
    if (walkToward(guard, grid, target.x, target.y, GUARD.patrolSpeed)) {
      guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    }
    if (guard.suspicion >= 35) {
      guard.state = 'stare';
      guard.stareTimer = GUARD.stareSeconds;
    }
  } else if (guard.state === 'stare') {
    guard.facing = angleTo(guard.x, guard.y, thief.x, thief.y);
    guard.stareTimer -= STEP;
    if (guard.suspicion >= 100) {
      guard.state = 'chase';
    } else if (guard.stareTimer <= 0) {
      guard.state = 'investigate';
      guard.investigateTimer = GUARD.investigateSeconds;
      guard.investigateX = thief.x;
      guard.investigateY = thief.y;
    }
  } else if (guard.state === 'investigate') {
    guard.investigateTimer -= STEP;
    const arrived = walkToward(guard, grid, guard.investigateX, guard.investigateY, GUARD.investigateSpeed);
    if (guard.suspicion >= 100) {
      guard.state = 'chase';
    } else if (arrived || guard.investigateTimer <= 0) {
      guard.state = 'patrol';
      guard.suspicion = Math.min(guard.suspicion, 30);
    }
  } else if (guard.state === 'chase') {
    walkToward(guard, grid, thief.x, thief.y, GUARD.chaseSpeed);
    if (guard.suspicion < 25 && alarm.value < 100) guard.state = 'patrol';
  }

  // A tripped alarm sends every guard after the thief.
  if (alarm.value >= 100 && guard.state !== 'chase') {
    guard.state = 'chase';
    guard.suspicion = 100;
  }
  return seen > 0;
}

export function guardCaught(guard, thief) {
  return guard.state === 'chase' && dist(guard.x, guard.y, thief.x, thief.y) < GUARD.catchDistance;
}
