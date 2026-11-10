import { createPadActionReader, isSystemChord, readGamepads, type PadAction } from '../src/lib/gamepad';

export function gameInputActive(): boolean {
  return !document.hidden && document.hasFocus() && document.documentElement.dataset.losgPaused !== 'true';
}

/** Capture before legacy document handlers so LOSG pause also blocks native input. */
export function installLegacyInputGate(): void {
  const gate = (event: Event) => {
    if (gameInputActive()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  for (const name of ['keydown', 'keyup', 'click', 'pointerdown', 'touchstart', 'touchmove', 'touchend']) {
    window.addEventListener(name, gate, { capture: true, passive: false });
  }
}

export function pollLegacyGamepad(
  onActions: (actions: PadAction[], pad: Gamepad) => void,
  onFrame?: (pad: Gamepad | undefined) => void,
): void {
  let read = createPadActionReader();
  const tick = (time: number) => {
    if (!gameInputActive()) { read = createPadActionReader(); onFrame?.(undefined); }
    else {
      const pad = readGamepads().filter((pad) => pad.mapping === 'standard').sort((a, b) => a.index - b.index)[0];
      onFrame?.(pad);
      for (const event of read(pad ? [pad] : [], time)) {
        if (!isSystemChord(event.pad)) onActions(event.actions, event.pad);
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
