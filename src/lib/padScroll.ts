import { isSystemChord } from './gamepad';

/** Right-stick scrolling, with per-device neutral gates and bounded frame time. */
export function createPadScrollReader() {
  const states = new Map<number, { id: string; ready: boolean }>();
  let previousTime: number | undefined;
  return (pads: readonly Gamepad[], time: number): number => {
    const delta = previousTime === undefined ? 0 : Math.max(0, Math.min(time - previousTime, 50));
    previousTime = time;
    for (const index of states.keys()) if (!pads.some((pad) => pad.connected && pad.index === index)) states.delete(index);
    let velocity = 0;
    for (const pad of pads) {
      if (!pad.connected || pad.mapping !== 'standard') continue;
      let state = states.get(pad.index);
      if (!state || state.id !== pad.id) {
        state = { id: pad.id, ready: false };
        states.set(pad.index, state);
      }
      if (isSystemChord(pad)) { state.ready = false; continue; }
      if (!state.ready) {
        state.ready = !pad.buttons.some((button) => button.pressed || button.value > 0.2)
          && !pad.axes.some((axis) => Math.abs(axis) > 0.18);
        continue;
      }
      const y = pad.axes[3] ?? 0;
      const amount = Math.abs(y) <= 0.18 ? 0 : Math.sign(y) * Math.min(1, (Math.abs(y) - 0.18) / 0.82);
      // Multiple controllers must not multiply scroll speed.
      if (Math.abs(amount) > Math.abs(velocity)) velocity = amount;
    }
    return velocity * delta * 0.9;
  };
}
