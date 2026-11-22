// Velvet Vault — the four screenshot scenes. Each one stages a real,
// reachable game state (actors placed, alarm and suspicion set to values
// the game itself produces), then the page renders it once with no
// further updates, so the same scene always gives the same frame.
import { tileCenter } from './config.js';
import { angleTo } from './world.js';

function place(state, c, r) {
  const p = tileCenter(c, r);
  return { x: p.x, y: p.y };
}

function aimCameraAt(camera, x, y) {
  camera.angle = angleTo(camera.x, camera.y, x, y);
}

function aimGuardAt(guard, x, y) {
  guard.facing = angleTo(guard.x, guard.y, x, y);
}

// The cover: one frame holding everything the bounty asks for — the
// thief crossing the room, a guard with its amber cone, a sweeping
// camera, the glowing loot, and the alarm meter reading 34%.
function stageCover(state) {
  state.time = 6.0;
  const thiefAt = place(state, 17, 8);
  state.thief.x = thiefAt.x;
  state.thief.y = thiefAt.y;
  state.thief.sneaking = true;
  state.thief.facing = angleTo(thiefAt.x, thiefAt.y, state.levelDef.loot[0].x, state.levelDef.loot[0].y);
  const guard = state.guards[0];
  const guardAt = place(state, 13, 9);
  guard.x = guardAt.x;
  guard.y = guardAt.y;
  guard.state = 'stare';
  guard.suspicion = 55;
  aimGuardAt(guard, thiefAt.x, thiefAt.y);
  const guard2 = state.guards[1];
  const guard2At = place(state, 24, 11);
  guard2.x = guard2At.x;
  guard2.y = guard2At.y;
  guard2.facing = Math.PI;
  aimCameraAt(state.cameras[0], thiefAt.x, thiefAt.y);
  state.alarm.value = 34;
}

// The thief pressed flat inside a velvet curtain while a guard walks
// past, suspicious, asking where the footsteps went.
function stageSneak(state) {
  state.time = 9.0;
  const thiefAt = place(state, 5, 8);
  state.thief.x = thiefAt.x;
  state.thief.y = thiefAt.y;
  state.thief.sneaking = true;
  state.thief.facing = 0;
  const guard = state.guards[0];
  const guardAt = place(state, 8, 9);
  guard.x = guardAt.x;
  guard.y = guardAt.y;
  guard.state = 'stare';
  guard.suspicion = 42;
  aimGuardAt(guard, thiefAt.x, thiefAt.y);
  const guard2 = state.guards[1];
  const guard2At = place(state, 24, 7);
  guard2.x = guard2At.x;
  guard2.y = guard2At.y;
  guard2.facing = -Math.PI / 2;
  state.cameras[0].angle = state.cameras[0].base + 0.4;
  state.alarm.value = 52;
}

// Mid-hack: the thief holds E at a terminal while a camera cone washes
// over them and the alarm climbs.
function stageCamera(state) {
  state.time = 12.0;
  const term = state.terminals[0];
  // The thief works the terminal from its blind side, below the console,
  // so the hack reads as smart positioning, not tanking a cone.
  state.thief.x = term.x;
  state.thief.y = term.y + 54;
  state.thief.facing = angleTo(state.thief.x, state.thief.y, term.x, term.y);
  state.thief.hackProgress = 0.62;
  state.thief.hacking = term;
  const camera = state.cameras[0];
  camera.spotted = true;
  aimCameraAt(camera, state.thief.x, state.thief.y);
  const guard = state.guards[0];
  const guardAt = place(state, 7, 11);
  guard.x = guardAt.x;
  guard.y = guardAt.y;
  guard.state = 'investigate';
  guard.suspicion = 48;
  guard.investigateX = state.thief.x;
  guard.investigateY = state.thief.y;
  aimGuardAt(guard, state.thief.x, state.thief.y);
  state.alarm.value = 68;
}

// The getaway: both paintings taken, the exit open and green, a guard
// in full chase, the alarm at 86%.
function stageGetaway(state) {
  state.time = 15.0;
  for (const item of state.levelDef.loot) {
    item.taken = true;
    state.levelLootTaken += item.value;
    state.totalLoot += item.value;
  }
  state.exitOpen = true;
  const thiefAt = place(state, 13, 15);
  state.thief.x = thiefAt.x;
  state.thief.y = thiefAt.y;
  state.thief.facing = angleTo(thiefAt.x, thiefAt.y, state.exitPos.x, state.exitPos.y);
  const guard = state.guards[1];
  const guardAt = place(state, 10, 14);
  guard.x = guardAt.x;
  guard.y = guardAt.y;
  guard.state = 'chase';
  guard.suspicion = 100;
  aimGuardAt(guard, thiefAt.x, thiefAt.y);
  const guard0 = state.guards[0];
  const guard0At = place(state, 8, 10);
  guard0.x = guard0At.x;
  guard0.y = guard0At.y;
  guard0.state = 'investigate';
  guard0.suspicion = 60;
  aimCameraAt(state.cameras[1], thiefAt.x, thiefAt.y);
  state.cameras[1].spotted = true;
  state.alarm.value = 86;
}

const SCENES = { cover: stageCover, sneak: stageSneak, camera: stageCamera, getaway: stageGetaway };

export function stageShot(state, name) {
  const stage = SCENES[name];
  if (!stage) throw new Error(`unknown shot: ${name}`);
  stage(state);
}
