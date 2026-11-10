export type PadAction = 'left' | 'right' | 'up' | 'down' | 'accept' | 'back' | 'previous' | 'next' | 'pause';

export function readGamepads(): Gamepad[] {
  try {
    return Array.from(navigator.getGamepads?.() ?? []).filter((pad): pad is Gamepad => Boolean(pad?.connected));
  } catch { return []; }
}
export function isSystemChord(pad: Gamepad): boolean {
  return [4, 5, 6, 7].every((i) => pad.buttons[i]?.pressed || pad.buttons[i]?.value > 0.75);
}
export function controllerType(id: string): string {
  if (/dualsense|054c.*0ce6/i.test(id)) return 'PlayStation · DualSense';
  if (/dualshock|054c.*(05c4|09cc)/i.test(id)) return 'PlayStation · DualShock 4';
  if (/playstation|sony|054c/i.test(id)) return 'PlayStation';
  if (/xbox|xinput|045e/i.test(id)) return 'Xbox';
  if (/nintendo|switch|057e/i.test(id)) return 'Nintendo';
  if (/steam|valve|28de/i.test(id)) return 'Steam';
  return 'Manette générique';
}
export interface ControllerInfo { index: number; player: number; name: string; type: string; supported: boolean; }
/** Browser ports stay stable when another controller disconnects. */
export function describeControllers(pads: readonly Gamepad[]): ControllerInfo[] {
  return [...pads].sort((a, b) => a.index - b.index).map((pad) => ({
    index: pad.index, player: pad.index + 1, name: pad.id || 'Manette sans nom',
    type: controllerType(pad.id), supported: pad.mapping === 'standard',
  }));
}
export function padActions(pad: Gamepad): Set<PadAction> {
  const actions = new Set<PadAction>();
  if (pad.mapping !== 'standard' || isSystemChord(pad)) return actions;
  const pressed = (i: number) => pad.buttons[i]?.pressed;
  const x = pad.axes[0] ?? 0, y = pad.axes[1] ?? 0;
  if (pressed(14) || x < -0.55) actions.add('left');
  if (pressed(15) || x > 0.55) actions.add('right');
  if (pressed(12) || y < -0.55) actions.add('up');
  if (pressed(13) || y > 0.55) actions.add('down');
  if (pressed(0)) actions.add('accept');
  if (pressed(1)) actions.add('back');
  if (pressed(4)) actions.add('previous');
  if (pressed(5)) actions.add('next');
  if (pressed(9)) actions.add('pause');
  return actions;
}
/** Per-device edges, neutral gate on mount/resume and bounded directional repeat. */
export function createPadActionReader(repeat = true) {
  const states = new Map<number, { id: string; held: Set<PadAction>; ready: boolean; direction?: PadAction; repeatAt: number }>();
  return (pads: readonly Gamepad[], time: number) => {
    const result: { pad: Gamepad; actions: PadAction[] }[] = [];
    for (const index of states.keys()) if (!pads.some((pad) => pad.index === index)) states.delete(index);
    for (const pad of pads) {
      if (!pad.connected || pad.mapping !== 'standard') continue;
      let state = states.get(pad.index);
      if (!state || state.id !== pad.id) {
        state = { id: pad.id, held: new Set(), ready: false, repeatAt: 0 };
        states.set(pad.index, state);
      }
      const held = padActions(pad);
      if (!state.ready) {
        state.ready = held.size === 0 && !isSystemChord(pad);
        state.held = held;
        continue;
      }
      const actions = [...held].filter((action) => !state.held.has(action));
      const direction = (['left', 'right', 'up', 'down'] as const).find((action) => held.has(action));
      if (direction !== state.direction) {
        state.direction = direction;
        state.repeatAt = time + 380;
      } else if (repeat && direction && time >= state.repeatAt) {
        actions.push(direction);
        state.repeatAt = time + 150;
      }
      state.held = held;
      if (actions.length) result.push({ pad, actions });
    }
    return result;
  };
}
export function driveInput(pad?: Gamepad) {
  if (!pad || isSystemChord(pad)) return { throttle: 0, tilt: 0 };
  const value = (i: number) => pad.buttons[i]?.value ?? (pad.buttons[i]?.pressed ? 1 : 0);
  const axis = (i: number) => Math.abs(pad.axes[i] ?? 0) > 0.18 ? pad.axes[i] : 0;
  return {
    throttle: Math.max(-1, Math.min(1, value(7) - value(6) + value(15) - value(14))),
    tilt: Math.max(-1, Math.min(1, axis(0) + value(13) - value(12))),
  };
}

export function controllerForTurn(pads: readonly Gamepad[], turn: 0 | 1): number | undefined {
  const connected = pads.filter((pad) => pad.connected && pad.mapping === 'standard').sort((a, b) => a.index - b.index);
  return connected[connected.length > 1 ? turn : 0]?.index;
}

export function adjustPadAim(angle: number, power: number, pad: Gamepad, delta: number) {
  const actions = padActions(pad);
  const dt = Math.max(0, Math.min(delta, 50)) / 1000;
  return {
    angle: Math.max(0, Math.min(90, angle + (Number(actions.has('up')) - Number(actions.has('down'))) * dt * 45)),
    power: Math.max(3, Math.min(100, power + (Number(actions.has('right')) - Number(actions.has('left'))) * dt * 55)),
  };
}
