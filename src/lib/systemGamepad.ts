import { isSystemChord } from './gamepad';
/** Hold LB + RB + LT + RT (L1 + R1 + L2 + R2) for 400 ms. Never use Guide. */
export function createSystemButtonTracker() {
  const states = new Map<number, { since: number; fired: boolean }>();
  return (pads: readonly (Gamepad | null)[], time = performance.now()): boolean => {
    let trigger = false;
    for (const index of states.keys()) if (!pads.some((pad) => pad?.connected && pad.index === index)) states.delete(index);
    for (const pad of pads) {
      if (!pad?.connected || pad.mapping !== 'standard') continue;
      if (!isSystemChord(pad)) { states.delete(pad.index); continue; }
      let state = states.get(pad.index);
      if (!state) { state = { since: time, fired: false }; states.set(pad.index, state); }
      if (!state.fired && time - state.since >= 400) { state.fired = true; trigger = true; }
    }
    return trigger;
  };
}
