// src/hooks/useStartup.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { createStartupSequence, type StartupPhase } from '../lib/startup';

export function useStartup(animated: boolean) {
  const [phase, setPhase] = useState<StartupPhase>('loading');
  const sequence = useRef<ReturnType<typeof createStartupSequence>>();
  const ready = useRef(false);
  const animations = useRef(animated);
  animations.current = animated;

  useEffect(() => {
    const current = createStartupSequence(setPhase, animations.current);
    sequence.current = current;
    if (ready.current) current.ready();
    return () => { current.cancel(); sequence.current = undefined; };
  }, []);
  useEffect(() => { sequence.current?.setAnimations(animated); }, [animated]);

  const markReady = useCallback(() => { ready.current = true; sequence.current?.ready(); }, []);
  const skip = useCallback(() => { sequence.current?.skip(); }, []);
  return { phase, markReady, skip, booting: phase !== 'done' };
}
