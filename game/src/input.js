// Velvet Vault — keyboard and mouse input. WASD or arrows to move, Shift
// to sneak, E to grab or hack, Q or a mouse click to throw a coin, R to
// retry the room, M to mute, P to pause, Enter to start.
export function makeInput(canvas) {
  const input = {
    up: false, down: false, left: false, right: false,
    sneak: false, interact: false, interactPressed: false,
    throwPressed: false, throwX: 0, throwY: 0,
    restartPressed: false, mutePressed: false, pausePressed: false,
    startPressed: false, mouseX: 0, mouseY: 0,
  };
  const keys = {};
  const down = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (e.repeat) return;
    keys[e.key.toLowerCase()] = true;
    sync();
    if (e.key.toLowerCase() === 'e') input.interactPressed = true;
    if (e.key.toLowerCase() === 'q') input.throwPressed = true;
    if (e.key.toLowerCase() === 'r') input.restartPressed = true;
    if (e.key.toLowerCase() === 'm') input.mutePressed = true;
    if (e.key.toLowerCase() === 'p') input.pausePressed = true;
    if (e.key === 'Enter') input.startPressed = true;
  };
  const up = (e) => { keys[e.key.toLowerCase()] = false; sync(); };
  function sync() {
    input.up = !!(keys.w || keys.arrowup);
    input.down = !!(keys.s || keys.arrowdown);
    input.left = !!(keys.a || keys.arrowleft);
    input.right = !!(keys.d || keys.arrowright);
    input.sneak = !!(keys.shift);
    input.interact = !!keys.e;
  }
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) / rect.width) * 1280;
    input.mouseY = ((e.clientY - rect.top) / rect.height) * 720;
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.throwX = ((e.clientX - rect.left) / rect.width) * 1280;
    input.throwY = ((e.clientY - rect.top) / rect.height) * 720;
    input.throwPressed = true;
  });
  return input;
}

export function clearEdgeTriggers(input) {
  input.interactPressed = false;
  input.throwPressed = false;
  input.restartPressed = false;
  input.mutePressed = false;
  input.pausePressed = false;
  input.startPressed = false;
}
