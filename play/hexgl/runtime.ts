export interface HexGame {
  active: boolean;
  update(): void;
  manager: { time: number };
  gameplay?: { timer: { time: { start: number; current: number; previous: number } } };
  components: { shipControls?: { key: Record<string, boolean> } };
}
interface AudioContextLike { state: string; suspend(): Promise<unknown>; resume(): Promise<unknown>; }

/** Own the legacy render loop so pause freezes physics, audio and race time together. */
export function createHexRuntime(getAudio: () => AudioContextLike | undefined, clearInput: () => void) {
  let hex: HexGame | undefined;
  let frame = 0;
  let paused = false;
  let pausedAt = 0;
  let resumeAudio = false;
  const tick = () => {
    frame = 0;
    if (paused || !hex?.active) return;
    hex.update();
    if (hex.active) frame = requestAnimationFrame(tick);
  };
  const resetKeys = () => {
    clearInput();
    const keys = hex?.components.shipControls?.key;
    if (keys) for (const key of Object.keys(keys)) keys[key] = false;
  };
  const suspendAudio = () => {
    const audio = getAudio();
    if (audio?.state === 'running') { resumeAudio = true; void audio.suspend().catch(() => {}); }
  };
  return {
    attach(game: HexGame) {
      hex = game;
      // A race may finish loading while the system menu is already open.
      if (paused) { pausedAt = Date.now(); resetKeys(); suspendAudio(); }
      else tick();
    },
    loop: {
      sleep() {
        if (paused) return;
        paused = true; pausedAt = Date.now(); cancelAnimationFrame(frame); frame = 0;
        resetKeys(); suspendAudio();
      },
      wake() {
        if (!paused) return;
        const elapsed = Date.now() - pausedAt;
        const time = hex?.gameplay?.timer.time;
        if (time) { time.start += elapsed; time.current += elapsed; time.previous += elapsed; }
        if (hex) hex.manager.time = performance.now();
        paused = false;
        if (resumeAudio) { resumeAudio = false; void getAudio()?.resume().catch(() => {}); }
        tick();
      },
    },
    input: { keyboard: { resetKeys } },
  };
}
