// Velvet Vault — every pixel on screen: the night museum, the cones, the
// actors, the HUD with its alarm meter, and the title and end screens.
// The palette is deliberate: safe cover reads dark red, danger reads amber
// and red, loot reads gold, the exit reads green.
import { CAMERA, GUARD, TILE, VIEW_H, VIEW_W } from './config.js';
import { alarmLabel } from './alarm.js';
import { COLS, ROWS } from './world.js';

const GOLD = '#d8a94e';
const CREAM = '#f2e6c9';

function cone(ctx, x, y, angle, halfAngle, range, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFloor(ctx, time) {
  ctx.fillStyle = '#171423';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if ((c + r) % 2 === 0) {
        ctx.fillStyle = '#1b1829';
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }
  }
  // A narrow crimson carpet runner down the middle of each room.
  ctx.fillStyle = '#431824';
  ctx.fillRect(15 * TILE, 0, TILE, VIEW_H);
  ctx.fillStyle = '#6d2531';
  ctx.fillRect(15 * TILE + 5, 0, 2, VIEW_H);
  ctx.fillRect(16 * TILE - 7, 0, 2, VIEW_H);
  // Warm lantern glow drifting slowly across the hall.
  const glowX = 640 + Math.sin(time * 0.25) * 220;
  const glow = ctx.createRadialGradient(glowX, 300, 40, glowX, 300, 420);
  glow.addColorStop(0, 'rgba(255, 196, 110, 0.10)');
  glow.addColorStop(1, 'rgba(255, 196, 110, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawWallsAndCases(ctx, grid, level) {
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (!grid.solid[r * COLS + c]) continue;
      const x = c * TILE;
      const y = r * TILE;
      ctx.fillStyle = '#2c2640';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#3d3457';
      ctx.fillRect(x, y, TILE, 6);
      ctx.strokeStyle = 'rgba(216, 169, 78, 0.25)';
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    }
  }
  // Gold-framed paintings hang on the top border wall.
  ctx.fillStyle = GOLD;
  for (const [c, r, w] of [[4, 0, 70], [12, 0, 50], [22, 0, 70]]) {
    ctx.fillRect(c * TILE, r * TILE + 8, w, 24);
    ctx.fillStyle = '#3a2c4d';
    ctx.fillRect(c * TILE + 4, r * TILE + 12, w - 8, 16);
    ctx.fillStyle = GOLD;
  }
  for (const cs of level.cases) {
    const x = cs.c * TILE;
    const y = cs.r * TILE;
    ctx.fillStyle = '#241f33';
    ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = 'rgba(180, 210, 255, 0.16)';
    ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3.5, y + 3.5, TILE - 7, TILE - 7);
    ctx.lineWidth = 1;
  }
}

function drawCurtains(ctx, level, thief) {
  for (const cu of level.curtains) {
    const x = cu.c * TILE;
    const y = cu.r * TILE;
    ctx.fillStyle = '#4a1220';
    ctx.fillRect(x, y, TILE * 2, TILE);
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = i % 2 ? '#5d1626' : '#3c0e1a';
      ctx.fillRect(x + i * 10, y, 10, TILE);
    }
    ctx.strokeStyle = GOLD;
    ctx.strokeRect(x + 0.5, y + 0.5, TILE * 2 - 1, TILE - 1);
    if (thief && thief.x > x && thief.x < x + TILE * 2 && thief.y > y - 6 && thief.y < y + TILE + 6) {
      ctx.fillStyle = '#8fe3a0';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HIDDEN', x + TILE, y + TILE + 18);
    }
  }
}

function drawLoot(ctx, loot, time) {
  for (const item of loot) {
    if (item.taken) continue;
    const pulse = 0.5 + Math.sin(time * 3 + item.x) * 0.2;
    const glow = ctx.createRadialGradient(item.x, item.y, 4, item.x, item.y, 46);
    glow.addColorStop(0, `rgba(255, 214, 110, ${0.5 + pulse * 0.3})`);
    glow.addColorStop(1, 'rgba(255, 214, 110, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd66e';
    if (item.kind === 'gem') {
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 14);
      ctx.lineTo(item.x + 11, item.y);
      ctx.lineTo(item.x, item.y + 14);
      ctx.lineTo(item.x - 11, item.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 14);
      ctx.lineTo(item.x + 11, item.y);
      ctx.lineTo(item.x, item.y);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'crown') {
      ctx.beginPath();
      ctx.moveTo(item.x - 13, item.y + 8);
      ctx.lineTo(item.x - 13, item.y - 6);
      ctx.lineTo(item.x - 6, item.y + 1);
      ctx.lineTo(item.x, item.y - 12);
      ctx.lineTo(item.x + 6, item.y + 1);
      ctx.lineTo(item.x + 13, item.y - 6);
      ctx.lineTo(item.x + 13, item.y + 8);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(item.x - 12, item.y - 14, 24, 28);
      ctx.fillStyle = '#7a4a1f';
      ctx.fillRect(item.x - 8, item.y - 10, 16, 20);
      ctx.fillStyle = '#ffd66e';
      ctx.fillRect(item.x - 8, item.y - 10, 16, 3);
    }
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name.toUpperCase(), item.x, item.y - 24);
    ctx.fillStyle = CREAM;
    ctx.font = '11px sans-serif';
    ctx.fillText(`$${item.value.toLocaleString('en-US')}`, item.x, item.y + 30);
  }
}

function drawTerminal(ctx, term, thief, cameras, time) {
  // A glowing floor cable links the terminal to the camera it controls,
  // so the hack reads as a plan, not a gamble.
  if (cameras && cameras.length) {
    let nearest = cameras[0];
    let bestD = Infinity;
    for (const cam of cameras) {
      const d = Math.hypot(cam.x - term.x, cam.y - term.y);
      if (d < bestD) { bestD = d; nearest = cam; }
    }
    const near = Math.hypot(thief.x - term.x, thief.y - term.y) < 90;
    if (near) {
      ctx.save();
      ctx.strokeStyle = 'rgba(95, 224, 138, 0.4)';
      ctx.setLineDash([6, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(term.x, term.y);
      ctx.lineTo(nearest.x, nearest.y);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.fillStyle = '#1d2b22';
  ctx.fillRect(term.x - 14, term.y - 14, 28, 28);
  ctx.strokeStyle = '#5fe08a';
  ctx.strokeRect(term.x - 14.5, term.y - 14.5, 29, 29);
  ctx.fillStyle = '#5fe08a';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CAM', term.x, term.y - 2);
  ctx.fillText('HACK', term.x, term.y + 9);
  const near = Math.hypot(thief.x - term.x, thief.y - term.y) < 56;
  if (near && thief.hackProgress > 0) {
    // The progress ring circles the thief doing the hacking.
    ctx.strokeStyle = '#5fe08a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * thief.hackProgress);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#5fe08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('HACKING…', term.x, term.y - 34);
  } else if (near) {
    ctx.fillStyle = '#5fe08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Hold E — HACK CAMERA', term.x, term.y - 24);
  }
}

function drawExit(ctx, exit, open, time) {
  const pulse = open ? 0.6 + Math.sin(time * 4) * 0.25 : 0;
  ctx.fillStyle = open ? `rgba(80, 220, 130, ${pulse})` : 'rgba(220, 80, 80, 0.35)';
  ctx.beginPath();
  ctx.arc(exit.x, exit.y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = open ? '#12351f' : '#3a1214';
  ctx.fillRect(exit.x - 20, exit.y - 20, 40, 40);
  ctx.strokeStyle = open ? '#4be389' : '#e05a5a';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x - 20.5, exit.y - 20.5, 41, 41);
  ctx.lineWidth = 1;
  ctx.fillStyle = open ? '#4be389' : '#e05a5a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT' : 'LOCKED', exit.x, exit.y + 5);
  if (open) {
    ctx.fillStyle = '#c9ffdd';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('GETAWAY — GO!', exit.x, exit.y - 44);
  }
}

function drawGuard(ctx, guard, time) {
  const color = guard.state === 'chase' ? '#ff5a4e' : guard.suspicion >= 35 ? '#ffb347' : '#f5a623';
  cone(ctx, guard.x, guard.y, guard.facing, GUARD.coneHalfAngle, GUARD.coneRange, color, guard.state === 'chase' ? 0.34 : 0.26);
  const bob = Math.sin(guard.walkPhase) * 2;
  ctx.fillStyle = '#232c4a';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y + bob * 0.3, GUARD.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#31406e';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y + bob * 0.3, GUARD.radius - 5, 0, Math.PI * 2);
  ctx.fill();
  // Cap brim points where the guard looks.
  ctx.strokeStyle = '#d8a94e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y + bob * 0.3);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 18, guard.y + bob * 0.3 + Math.sin(guard.facing) * 18);
  ctx.stroke();
  ctx.lineWidth = 1;
  if (guard.suspicion > 2 && guard.state !== 'chase') {
    // Suspicion reads as a small bar under the guard, never on top of the
    // "?" / "!" mark above its head.
    const barW = 30;
    ctx.fillStyle = 'rgba(8, 7, 16, 0.7)';
    ctx.fillRect(guard.x - barW / 2, guard.y + 18, barW, 5);
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(guard.x - barW / 2, guard.y + 18, (barW * guard.suspicion) / 100, 5);
  }
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  if (guard.state === 'chase') {
    drawAlertMark(ctx, guard.x, guard.y - 26, '!');
  } else if (guard.state === 'stare' || guard.state === 'investigate') {
    drawAlertMark(ctx, guard.x, guard.y - 26, '?');
  }
}

// Suspicion and chase marks drawn as vector strokes, so they stay legible
// at any size and in any browser font set: a "?" hook with its dot, and
// a "!" bar with its dot.
function drawAlertMark(ctx, x, y, mark) {
  ctx.save();
  ctx.strokeStyle = mark === '!' ? '#ff5a4e' : '#ffb347';
  ctx.fillStyle = mark === '!' ? '#ff5a4e' : '#ffb347';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  if (mark === '!') {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x, y + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + 8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // A "?" hook: a dome over the top, then a stem curving down to the dot.
    ctx.beginPath();
    ctx.arc(x, y - 4, 7, (200 * Math.PI) / 180, (340 * Math.PI) / 180);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6.6, y - 6.4);
    ctx.quadraticCurveTo(x + 6, y + 1, x + 1, y + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + 8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCamera(ctx, camera) {
  const disabled = camera.disabledTimer > 0;
  const color = disabled ? '#8a8f98' : camera.spotted ? '#ff3b30' : '#ff6b5e';
  if (!disabled) cone(ctx, camera.x, camera.y, camera.angle, CAMERA.coneHalfAngle, CAMERA.range, color, camera.spotted ? 0.36 : 0.2);
  ctx.fillStyle = '#20242e';
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = disabled ? '#5a5f68' : '#ff3b30';
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = disabled ? '#9aa0aa' : '#ff8a80';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(disabled ? 'CAM OFF' : 'CAM', camera.x, camera.y - 18);
}

function drawThief(ctx, thief, time, hidden) {
  const crouch = thief.sneaking ? 0.82 : 1;
  const bob = thief.moving ? Math.sin(thief.walkPhase) * 2 : 0;
  // Hidden in a curtain, Moth reads as a faint silhouette, not a solid body.
  ctx.save();
  if (hidden) ctx.globalAlpha = 0.55;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(thief.x, thief.y + 12, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b3fa0';
  ctx.beginPath();
  ctx.arc(thief.x, thief.y + bob * 0.3, 13 * crouch + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.arc(thief.x, thief.y + bob * 0.3 - 3, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1025';
  ctx.beginPath();
  ctx.arc(thief.x + Math.cos(thief.facing) * 4, thief.y + bob * 0.3 - 3 + Math.sin(thief.facing) * 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd66e';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MOTH', thief.x, thief.y - 22);
  ctx.restore();
}

function drawPatrolTracks(ctx, guards) {
  // Faint dotted tracks join each guard's waypoints, so the routes a
  // player can learn are readable on the floor itself.
  ctx.save();
  ctx.strokeStyle = 'rgba(216, 169, 78, 0.30)';
  ctx.setLineDash([2, 9]);
  ctx.lineWidth = 2;
  for (const guard of guards) {
    const pts = guard.waypoints;
    if (!pts || pts.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoins(ctx, coins, time) {
  for (const coin of coins) {
    const pulse = 1 + Math.sin(time * 6) * 0.15;
    ctx.strokeStyle = 'rgba(255, 214, 110, 0.7)';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 16 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffd66e';
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, state) {
  const level = state.levelDef;
  const lootGot = level.loot.filter((l) => l.taken).length;
  const lootValue = level.loot.filter((l) => l.taken).reduce((s, l) => s + l.value, 0);
  const lootTotal = level.loot.reduce((s, l) => s + l.value, 0);
  ctx.fillStyle = 'rgba(8, 7, 16, 0.88)';
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 64, VIEW_W, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`LEVEL ${state.levelIndex + 1} — ${level.name.toUpperCase()}`, 16, 26);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#ffd66e';
  ctx.fillText(`LOOT  $${lootValue.toLocaleString('en-US')} / $${lootTotal.toLocaleString('en-US')}  (${lootGot}/${level.loot.length})`, 16, 48);
  // Alarm meter: the widest, brightest element in the HUD.
  const meterX = 470;
  const meterW = 300;
  const pct = Math.round(state.alarm.value);
  const label = alarmLabel(state.alarm.value);
  ctx.textAlign = 'left';
  ctx.fillStyle = state.alarm.value >= 70 ? '#ff6b5e' : state.alarm.value >= 35 ? '#ffb347' : '#8fe3a0';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`ALARM  ${label}  ${pct}%`, meterX, 26);
  ctx.fillStyle = '#241f33';
  ctx.fillRect(meterX, 34, meterW, 18);
  ctx.fillStyle = state.alarm.value >= 70 ? '#ff3b30' : state.alarm.value >= 35 ? '#ff9f1c' : '#37c978';
  ctx.fillRect(meterX, 34, (meterW * state.alarm.value) / 100, 18);
  ctx.strokeStyle = CREAM;
  ctx.strokeRect(meterX + 0.5, 34.5, meterW, 18);
  ctx.textAlign = 'right';
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('♥'.repeat(state.lives) + '♡'.repeat(Math.max(0, 3 - state.lives)), 1180, 26);
  ctx.font = '15px sans-serif';
  const mins = Math.floor(state.time / 60);
  const secs = Math.floor(state.time % 60).toString().padStart(2, '0');
  ctx.fillText(`TIME ${mins}:${secs}   COINS ${state.thief.coins}`, 1180, 48);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(8, 7, 16, 0.72)';
  ctx.fillRect(0, VIEW_H - 26, VIEW_W, 26);
  ctx.fillStyle = 'rgba(242, 230, 201, 0.75)';
  ctx.font = '13px sans-serif';
  const objective = state.exitOpen
    ? 'All loot taken — reach the green EXIT!'
    : `Steal the loot — ${level.loot.length - lootGot} left — then reach the EXIT.`;
  ctx.fillText(objective, 16, VIEW_H - 12);
  ctx.textAlign = 'right';
  ctx.fillText('WASD move · Shift sneak · E grab / hack · Q / click throw coin · R retry · M mute', VIEW_W - 16, VIEW_H - 12);
  if (state.alarm.value >= 100) {
    const flash = Math.sin(state.time * 12) > 0;
    ctx.fillStyle = flash ? '#ff3b30' : '#ffb347';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ ALARM — HIDE! ⚠', VIEW_W / 2, 116);
  } else if (state.guards.some((g) => g.state === 'chase')) {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED — RUN!', VIEW_W / 2, 112);
  }
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(8, 7, 16, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('VELVET VAULT', VIEW_W / 2, 190);
  ctx.fillStyle = CREAM;
  ctx.font = '22px Georgia, serif';
  ctx.fillText('A midnight heist in three rooms', VIEW_W / 2, 232);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#c9bda1';
  const lines = [
    'You are MOTH, a cat-burglar. Steal every loot target, then slip out the green EXIT.',
    'Guards patrol with amber vision cones — suspicion grows while they see you.',
    'Cameras sweep red cones and feed the ALARM meter. Hack a terminal (hold E) to switch one off.',
    'Hide in the velvet curtains. Throw a coin (Q or click) to lure a guard away.',
    'Sneak with Shift. If the alarm hits 100%, every guard runs for you.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 300 + i * 30));
  ctx.fillStyle = '#ffd66e';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER or click to begin the heist', VIEW_W / 2, 500);
  ctx.fillStyle = 'rgba(242, 230, 201, 0.6)';
  ctx.font = '14px sans-serif';
  ctx.fillText('WASD / arrows move · Shift sneak · E grab / hack · Q / click coin · R retry · M mute · P pause', VIEW_W / 2, 540);
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(8, 7, 16, 0.85)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  if (state.screen === 'win') {
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('CLEAN GETAWAY!', VIEW_W / 2, 280);
    ctx.fillStyle = CREAM;
    ctx.font = '22px sans-serif';
    ctx.fillText(`Loot $${state.totalLoot.toLocaleString('en-US')}  ·  ${state.levelsCleared} rooms  ·  ${Math.floor(state.time / 60)}:${Math.floor(state.time % 60).toString().padStart(2, '0')}`, VIEW_W / 2, 330);
    ctx.fillStyle = '#8fe3a0';
    ctx.font = '18px sans-serif';
    ctx.fillText('Press R to run it again', VIEW_W / 2, 380);
  } else {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('CAUGHT!', VIEW_W / 2, 280);
    ctx.fillStyle = CREAM;
    ctx.font = '22px sans-serif';
    ctx.fillText('The museum keeps its treasures — this time.', VIEW_W / 2, 330);
    ctx.fillStyle = '#ffd66e';
    ctx.font = '18px sans-serif';
    ctx.fillText('Press R to try the heist again', VIEW_W / 2, 380);
  }
}

export function render(ctx, state) {
  const time = state.time;
  const thief = state.thief;
  let hidden = false;
  if (thief) {
    for (const cu of state.levelDef.curtains) {
      const x = cu.c * TILE;
      const y = cu.r * TILE;
      if (thief.x > x && thief.x < x + TILE * 2 && thief.y > y - 6 && thief.y < y + TILE + 6) hidden = true;
    }
  }
  drawFloor(ctx, time);
  drawPatrolTracks(ctx, state.guards);
  drawCurtains(ctx, state.levelDef, state.screen === 'play' ? thief : null);
  drawWallsAndCases(ctx, state.grid, state.levelDef);
  drawLoot(ctx, state.levelDef.loot, time);
  for (const term of state.terminals) drawTerminal(ctx, term, thief, state.cameras, time);
  drawExit(ctx, state.exitPos, state.exitOpen, time);
  drawCoins(ctx, state.coins, time);
  for (const camera of state.cameras) drawCamera(ctx, camera);
  for (const guard of state.guards) drawGuard(ctx, guard, time);
  if (state.screen === 'play' || state.screen === 'paused' || state.screen === 'caught') {
    drawThief(ctx, thief, time, hidden);
  }
  drawHud(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'win' || state.screen === 'gameover') drawEnd(ctx, state);
  if (state.screen === 'paused') {
    ctx.fillStyle = 'rgba(8, 7, 16, 0.7)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = CREAM;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', VIEW_W / 2, 360);
  }
  if (state.screen === 'caught') {
    ctx.fillStyle = 'rgba(120, 10, 10, 0.25)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#ff8a80';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUGHT!  A guard grabbed you.', VIEW_W / 2, 120);
  }
}

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
