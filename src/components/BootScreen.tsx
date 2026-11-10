// src/components/BootScreen.tsx
import { useEffect, useRef } from 'react';
import type { StartupPhase } from '../lib/startup';

export function BootScreen({ phase, animated, onSkip }: {
  phase: StartupPhase;
  animated: boolean;
  onSkip: () => void;
}) {
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = screen.current;
    const previousOverflow = document.body.style.overflow;
    let hadFocus = false;
    const trackFocus = (event: FocusEvent) => { hadFocus = event.target instanceof Node && Boolean(element?.contains(event.target)); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('focusin', trackFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('focusin', trackFocus);
      if (hadFocus) document.getElementById('main')?.focus({ preventScroll: true });
    };
  }, []);

  return <div ref={screen} className={`boot-screen ${animated ? 'boot-animated' : ''} ${phase === 'leaving' ? 'boot-leaving' : ''}`}>
    <div className="boot-identity">
      <div className="boot-symbol" aria-hidden="true"><span /><span /><span /></div>
      <div className="boot-wordmark">LUMA</div>
      <div className="boot-subtitle">OS: Gaming</div>
      <div className="boot-status" role="status" aria-live="polite">
        <span className="boot-track" aria-hidden="true"><span /></span>
        <span>{phase === 'leaving' ? 'Votre collection est prête.' : 'Chargement de votre collection…'}</span>
      </div>
    </div>
    <button className="boot-skip" onClick={onSkip}>Passer <span aria-hidden="true">Échap</span></button>
    <div className="boot-signature" aria-hidden="true">SPX <span>/</span> LUMA OS</div>
  </div>;
}
