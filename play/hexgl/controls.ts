import { isSystemChord } from '../../src/lib/gamepad';

export interface ShipInput { forward: boolean; steering: number; leftBrake: boolean; rightBrake: boolean; restart: boolean; }
const neutral = (): ShipInput => ({ forward: false, steering: 0, leftBrake: false, rightBrake: false, restart: false });

/** Neutral gate on connection/resume; one restart per press; analog steering. */
export function createShipInputReader() {
  let port: number | undefined;
  let id = '';
  let ready = false;
  let restartHeld = false;
  return (pad?: Gamepad): ShipInput => {
    if (!pad?.connected || pad.mapping !== 'standard') {
      port = undefined; ready = false; restartHeld = false; return neutral();
    }
    if (port !== pad.index || id !== pad.id) { port = pad.index; id = pad.id; ready = false; restartHeld = false; }
    const value = (i: number) => pad.buttons[i]?.value ?? (pad.buttons[i]?.pressed ? 1 : 0);
    const held = (i: number) => pad.buttons[i]?.pressed || value(i) > 0.2;
    if (!ready) {
      ready = !pad.buttons.some((b) => b.pressed || b.value > 0.2) && !pad.axes.some((a) => Math.abs(a) > 0.18);
      return neutral();
    }
    if (isSystemChord(pad)) { ready = false; return neutral(); }
    const x = pad.axes[0] ?? 0;
    const restart = Boolean(held(2)) && !restartHeld;
    restartHeld = Boolean(held(2));
    return {
      forward: Boolean(held(0) || held(7) || held(12)),
      steering: Math.abs(x) > 0.18 ? Math.max(-1, Math.min(1, x)) : Number(Boolean(held(15))) - Number(Boolean(held(14))),
      leftBrake: Boolean(held(4) || held(6) || held(13)),
      rightBrake: Boolean(held(5) || held(6) || held(13)),
      restart,
    };
  };
}
