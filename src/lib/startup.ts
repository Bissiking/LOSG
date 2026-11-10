// src/lib/startup.ts
export type StartupPhase = 'loading' | 'leaving' | 'done';

/** Bounded startup sequence. Readiness, skip and cancellation never depend on CSS events. */
export function createStartupSequence(onPhase: (phase: StartupPhase) => void, animated: boolean) {
  const startedAt = Date.now();
  let phase: StartupPhase = 'loading';
  let ready = false;
  let cancelled = false;
  let transition: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;

  const clearTimers = () => { clearTimeout(transition); clearTimeout(deadline); };
  const finish = () => {
    if (cancelled || phase === 'done') return;
    clearTimers();
    phase = 'done';
    onPhase(phase);
  };
  const leave = () => {
    if (cancelled || phase !== 'loading') return;
    clearTimers();
    if (!animated) { finish(); return; }
    phase = 'leaving';
    onPhase(phase);
    transition = setTimeout(finish, 280);
  };
  const scheduleReady = () => {
    if (cancelled || phase !== 'loading' || !ready) return;
    clearTimeout(transition);
    const remaining = Math.max(0, (animated ? 1100 : 0) - (Date.now() - startedAt));
    if (!remaining) leave();
    else transition = setTimeout(leave, remaining);
  };
  deadline = setTimeout(leave, 4000);

  return {
    ready() { ready = true; scheduleReady(); },
    setAnimations(value: boolean) {
      animated = value;
      if (!animated && phase === 'leaving') finish();
      else scheduleReady();
    },
    skip: finish,
    cancel() { cancelled = true; clearTimers(); },
  };
}
