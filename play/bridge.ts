import { createGamePauseController, type GameRuntime } from './pause';

// Shared lifecycle only; each game keeps ownership of its inputs, audio and saves.
export async function startGame(load: () => Promise<unknown>): Promise<void> {
  const embedded = window.parent !== window;
  const pause = createGamePauseController();
  let resumeFrame = 0;
  const notify = (paused: boolean) => {
    document.documentElement.dataset.losgPaused = String(paused);
    window.dispatchEvent(new Event('losg:pause-change'));
  };
  const resumeWhenReleased = () => {
    let held = false;
    try {
      held = Array.from(navigator.getGamepads?.() ?? []).some((pad) => pad?.connected
        && pad.mapping === 'standard' && (pad.buttons.some((button) => button.pressed)
          || pad.axes.some((axis) => Math.abs(axis) > 0.3)));
    } catch { /* Keyboard/touch resume remains available if gamepad access is denied. */ }
    if (held) { resumeFrame = requestAnimationFrame(resumeWhenReleased); return; }
    resumeFrame = 0;
    pause.resume();
    notify(false);
  };
  window.addEventListener('message', (event) => {
    if (!embedded || event.source !== window.parent || event.origin !== window.location.origin) return;
    if (event.data?.type === 'losg:pause') {
      cancelAnimationFrame(resumeFrame);
      resumeFrame = 0;
      pause.pause();
      notify(true);
    } else if (event.data?.type === 'losg:resume') {
      cancelAnimationFrame(resumeFrame);
      resumeWhenReleased();
    }
  });
  const send = (type: string) => {
    if (embedded) window.parent.postMessage({ type }, window.location.origin);
  };
  window.addEventListener('keydown', (event) => {
    if (event.key === 'F1' && embedded) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) send('losg:menu');
      return;
    }
    if (event.key !== 'Escape' || !event.shiftKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (embedded) send('losg:close');
    else window.location.assign('/');
  }, true);
  if (!embedded) {
    const back = document.createElement('a');
    back.className = 'losg-return';
    back.href = '/';
    back.textContent = 'Retour à LOSG';
    back.title = 'Retour à LOSG (Maj + Échap)';
    document.body.append(back);
  }
  try {
    const loaded = await load() as { game?: GameRuntime } | undefined;
    pause.attach(loaded?.game);
    send('losg:ready');
  } catch (error) {
    console.error('LOSG: chargement du jeu impossible', error);
    send('losg:error');
    const message = document.createElement('p');
    message.className = 'losg-load-error';
    message.setAttribute('role', 'alert');
    message.textContent = 'Le jeu n’a pas pu démarrer. Revenez à LOSG puis réessayez.';
    document.body.append(message);
  }
}
