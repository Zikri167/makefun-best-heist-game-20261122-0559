// Velvet Vault — synthesized sound. No audio files: every effect is an
// oscillator or filtered noise built in WebAudio, so the game stays
// offline and silent until the player first presses a key.
export function makeAudio() {
  return { ctx: null, muted: false, lastStep: 0 };
}

function ensure(audio) {
  if (!audio.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audio.ctx = new AC();
  }
  if (audio.ctx.state === 'suspended') audio.ctx.resume();
  return audio.ctx;
}

function tone(audio, freq, seconds, type, gainValue, when = 0) {
  if (audio.muted) return;
  const ctx = ensure(audio);
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.02);
}

export function playStep(audio, time, sneaking) {
  if (audio.muted || time - audio.lastStep < (sneaking ? 0.42 : 0.3)) return;
  audio.lastStep = time;
  tone(audio, sneaking ? 150 : 190, 0.05, 'triangle', sneaking ? 0.015 : 0.03);
}

export function playPickup(audio) {
  tone(audio, 880, 0.12, 'sine', 0.09);
  tone(audio, 1318, 0.18, 'sine', 0.07, 0.08);
}

export function playCoin(audio) {
  tone(audio, 2093, 0.09, 'square', 0.04);
  tone(audio, 1568, 0.14, 'square', 0.03, 0.07);
}

export function playAlarm(audio) {
  tone(audio, 620, 0.22, 'sawtooth', 0.06);
  tone(audio, 466, 0.26, 'sawtooth', 0.06, 0.22);
}

export function playCaught(audio) {
  tone(audio, 220, 0.3, 'sawtooth', 0.08);
  tone(audio, 110, 0.5, 'sawtooth', 0.08, 0.25);
}

export function playWin(audio) {
  [523, 659, 784, 1046].forEach((f, i) => tone(audio, f, 0.22, 'sine', 0.08, i * 0.12));
}

export function playHack(audio) {
  tone(audio, 1200, 0.06, 'square', 0.03);
  tone(audio, 900, 0.06, 'square', 0.03, 0.09);
}
