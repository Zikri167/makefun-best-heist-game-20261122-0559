// Velvet Vault — the game loop and state machine: title, play, caught,
// room clear, win and game over. Fixed 60 Hz steps, so the same inputs
// always replay the same room.
import { CAMERA, LEVELS, STEP, tileCenter } from './config.js';
import { buildGrid } from './world.js';
import { guardCaught, makeGuard, updateGuard } from './guard.js';
import { makeCamera, updateCamera } from './camera.js';
import { makeAlarm, updateAlarm } from './alarm.js';
import { makeThief, nearestLoot, nearestTerminal, throwCoin, updateThief } from './thief.js';
import { clearEdgeTriggers, makeInput } from './input.js';
import { makeAudio, playAlarm, playCaught, playCoin, playHack, playPickup, playStep, playWin } from './audio.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export function buildLevel(levelIndex) {
  const def = LEVELS[levelIndex];
  const grid = buildGrid(def);
  const loot = def.loot.map((item) => {
    const p = tileCenter(item.c, item.r);
    return { ...item, x: p.x, y: p.y, taken: false };
  });
  const terminals = def.terminals.map((t) => tileCenter(t.c, t.r));
  const exitPos = tileCenter(def.exit.c, def.exit.r);
  return {
    levelDef: { ...def, loot },
    grid,
    guards: def.guards.map(makeGuard),
    cameras: def.cameras.map(makeCamera),
    terminals,
    exitPos,
    exitOpen: false,
    coins: [],
  };
}

export function newRun() {
  return {
    screen: 'title',
    levelIndex: 0,
    lives: 3,
    time: 0,
    totalLoot: 0,
    levelLootTaken: 0,
    levelsCleared: 0,
    alarm: makeAlarm(),
    thief: null,
    clearTimer: 0,
    caughtTimer: 0,
    ...buildLevel(0),
  };
}

function startLevel(state, levelIndex) {
  const built = buildLevel(levelIndex);
  Object.assign(state, built, {
    levelIndex,
    thief: makeThief(LEVELS[levelIndex].start),
    alarm: makeAlarm(),
    levelLootTaken: 0,
    screen: 'play',
  });
}

function isHidden(state) {
  const t = state.thief;
  for (const cu of state.levelDef.curtains) {
    const x = cu.c * 40;
    const y = cu.r * 40;
    if (t.x > x && t.x < x + 80 && t.y > y - 6 && t.y < y + 46) return true;
  }
  return false;
}

function stepGame(state, input, audio) {
  if (state.screen !== 'play') return;
  state.time += STEP;
  const thief = state.thief;

  if (input.mutePressed) audio.muted = !audio.muted;
  if (input.pausePressed) { state.screen = 'paused'; return; }
  if (input.restartPressed) {
    state.totalLoot -= state.levelLootTaken;
    startLevel(state, state.levelIndex);
    return;
  }

  updateThief(thief, input, state.grid);
  if (thief.moving) playStep(audio, state.time, thief.sneaking);

  if (input.throwPressed) {
    const tx = input.throwX || thief.x + Math.cos(thief.facing) * 120;
    const ty = input.throwY || thief.y + Math.sin(thief.facing) * 120;
    if (throwCoin(thief, tx, ty, state)) playCoin(audio);
  }

  // Grab loot or hack a terminal with E.
  const loot = nearestLoot(thief, state.levelDef.loot);
  const terminal = nearestTerminal(thief, state.terminals);
  if (input.interactPressed && loot) {
    loot.taken = true;
    state.levelLootTaken += loot.value;
    state.totalLoot += loot.value;
    playPickup(audio);
  }
  if (input.interact && terminal && !loot) {
    thief.hackProgress += STEP / CAMERA.hackSeconds;
    thief.hacking = terminal;
    if (thief.hackProgress >= 1) {
      let nearest = null;
      let bestD = Infinity;
      for (const cam of state.cameras) {
        const d = Math.hypot(cam.x - terminal.x, cam.y - terminal.y);
        if (d < bestD) { bestD = d; nearest = cam; }
      }
      if (nearest) nearest.disabledTimer = CAMERA.disabledSeconds;
      thief.hackProgress = 0;
      thief.hacking = null;
      playHack(audio);
    }
  } else {
    thief.hackProgress = 0;
    thief.hacking = null;
  }

  for (const coin of state.coins) coin.timer -= STEP;
  state.coins = state.coins.filter((c) => c.timer > 0);

  const hidden = isHidden(state);
  let anySeen = false;
  for (const guard of state.guards) {
    if (updateGuard(guard, thief, state.grid, hidden, state.alarm)) anySeen = true;
  }
  for (const camera of state.cameras) {
    if (updateCamera(camera, state.time, thief, state.grid, hidden, state.alarm)) anySeen = true;
  }
  if (anySeen) {
    state.alarm.value = Math.min(100, state.alarm.value + 21 * STEP * 0.4);
  }
  const wasTripped = state.alarm.value >= 100;
  updateAlarm(state.alarm, anySeen);
  if (state.alarm.value >= 100 && !wasTripped) playAlarm(audio);

  state.exitOpen = state.levelDef.loot.every((l) => l.taken);

  for (const guard of state.guards) {
    if (guardCaught(guard, thief)) {
      state.lives -= 1;
      state.totalLoot -= state.levelLootTaken;
      playCaught(audio);
      if (state.lives <= 0) {
        state.screen = 'gameover';
      } else {
        state.screen = 'caught';
        state.caughtTimer = 1.4;
      }
      return;
    }
  }

  if (state.exitOpen && Math.hypot(thief.x - state.exitPos.x, thief.y - state.exitPos.y) < 34) {
    state.levelsCleared += 1;
    if (state.levelIndex >= LEVELS.length - 1) {
      state.screen = 'win';
      playWin(audio);
    } else {
      state.screen = 'clear';
      state.clearTimer = 1.4;
    }
  }
}

function stepScreens(state, input) {
  if (state.screen === 'title' && (input.startPressed || input.throwPressed)) {
    startLevel(state, 0);
  } else if (state.screen === 'paused' && input.pausePressed) {
    state.screen = 'play';
  } else if ((state.screen === 'win' || state.screen === 'gameover') && input.restartPressed) {
    const fresh = newRun();
    Object.assign(state, fresh);
    startLevel(state, 0);
  } else if (state.screen === 'caught') {
    state.caughtTimer -= STEP;
    if (state.caughtTimer <= 0) startLevel(state, state.levelIndex);
  } else if (state.screen === 'clear') {
    state.clearTimer -= STEP;
    if (state.clearTimer <= 0) startLevel(state, state.levelIndex + 1);
  }
}

function main() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const input = makeInput(canvas);
  const audio = makeAudio();
  const state = newRun();
  // A tiny read-only handle for automated playtests; the game never reads it.
  window.__velvet = state;

  if (shot) {
    // Screenshot mode: stage one fixed scene and render it once.
    const levelIndex = shot === 'camera' || shot === 'getaway' ? 1 : 0;
    startLevel(state, levelIndex);
    stageShot(state, shot);
    render(ctx, state);
    window.__shotDone = true;
    document.title = `Velvet Vault — shot ${shot}`;
    return;
  }

  state.thief = makeThief(LEVELS[0].start);
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      acc -= STEP;
      stepScreens(state, input);
      stepGame(state, input, audio);
      clearEdgeTriggers(input);
    }
    render(ctx, state);
    if (state.screen === 'clear') {
      ctx.fillStyle = 'rgba(8, 7, 16, 0.7)';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = '#8fe3a0';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROOM CLEARED — NICE WORK, MOTH', 640, 360);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
