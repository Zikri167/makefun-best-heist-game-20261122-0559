// Velvet Vault — the wall-mounted security cameras. Each one sweeps its
// arc on a fixed rhythm, feeds the alarm when it spots the thief, and
// goes dark for a while after the thief hacks its terminal.
import { CAMERA, STEP } from './config.js';
import { angleDiff, angleTo, dist, hasLineOfSight } from './world.js';

export function makeCamera(def, index) {
  const base = (def.baseDeg * Math.PI) / 180;
  const arc = (def.arcDeg * Math.PI) / 180;
  return {
    x: def.c * 40 + 20,
    y: def.r * 40 + 20,
    base,
    arc,
    angle: base,
    phase: index * 1.7,
    disabledTimer: 0,
    spotted: false,
    blink: 0,
  };
}

export function updateCamera(camera, time, thief, grid, hidden, alarm) {
  camera.blink += STEP;
  if (camera.disabledTimer > 0) {
    camera.disabledTimer -= STEP;
    camera.spotted = false;
    return false;
  }
  camera.angle = camera.base + Math.sin((time / CAMERA.sweepSeconds) * Math.PI * 2 + camera.phase) * (camera.arc / 2);
  const d = dist(camera.x, camera.y, thief.x, thief.y);
  let seen = false;
  if (d <= CAMERA.range && !(hidden && d > 60)) {
    const toThief = angleTo(camera.x, camera.y, thief.x, thief.y);
    if (Math.abs(angleDiff(toThief, camera.angle)) <= CAMERA.coneHalfAngle
      && hasLineOfSight(grid, camera.x, camera.y, thief.x, thief.y)) {
      seen = true;
    }
  }
  camera.spotted = seen;
  if (seen) alarm.value = Math.min(100, alarm.value + CAMERA.alarmPerSecond * STEP);
  return seen;
}
