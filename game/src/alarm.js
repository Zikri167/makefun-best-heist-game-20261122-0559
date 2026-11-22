// Velvet Vault — the alarm meter. It climbs while any guard or camera can
// see the thief, cools off while hidden, and trips a lockdown at 100.
import { ALARM, STEP } from './config.js';

export function makeAlarm() {
  return { value: 0, floor: 0, lockdownTimer: 0, tripped: false };
}

export function updateAlarm(alarm, anySeen) {
  if (alarm.lockdownTimer > 0) {
    alarm.lockdownTimer -= STEP;
    alarm.value = 100;
    if (alarm.lockdownTimer <= 0) alarm.value = ALARM.afterLockdown;
    return;
  }
  // Crossed thresholds lock in: a mistake leaves a permanent mark, so the
  // getaway always carries the weight of what happened before it.
  if (alarm.value >= 70) alarm.floor = 70;
  else if (alarm.value >= 35) alarm.floor = 35;
  if (!anySeen) {
    alarm.value = Math.max(alarm.floor, alarm.value - ALARM.decayPerSecond * STEP);
  }
  if (alarm.value >= 100 && !alarm.tripped) {
    alarm.tripped = true;
    alarm.lockdownTimer = ALARM.lockdownSeconds;
  }
  if (alarm.value < 100) alarm.tripped = false;
}

export function alarmLabel(value) {
  if (value >= 100) return 'ALARM!';
  if (value >= 70) return 'HOT';
  if (value >= 35) return 'WARY';
  return 'CALM';
}
