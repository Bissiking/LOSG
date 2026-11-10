interface PlayingSound { pause(): unknown; resume(): unknown; }
export interface GameRuntime {
  loop: { sleep(): unknown; wake(): unknown };
  sound?: { getAllPlaying(): PlayingSound[] };
  input?: { keyboard?: { resetKeys(): unknown } | null };
  events?: { once(event: string, callback: () => void): unknown };
}

/** Pause only running sounds, so user-muted or already paused audio stays so. */
export function createGamePauseController() {
  let runtime: GameRuntime | undefined;
  let paused = false;
  let sounds: PlayingSound[] = [];
  const freeze = () => {
    runtime?.loop.sleep();
    runtime?.input?.keyboard?.resetKeys();
    const playing = runtime?.sound?.getAllPlaying() ?? [];
    sounds.push(...playing);
    playing.forEach((sound) => sound.pause());
  };
  return {
    attach(game?: GameRuntime) {
      runtime = game;
      if (paused) freeze();
      // Phaser may finish booting after the overlay was opened.
      runtime?.events?.once('ready', () => queueMicrotask(() => { if (paused) freeze(); }));
    },
    pause() { if (!paused) { paused = true; freeze(); } },
    resume() {
      if (!paused) return;
      paused = false;
      runtime?.loop.wake();
      sounds.forEach((sound) => sound.resume());
      sounds = [];
    },
  };
}
