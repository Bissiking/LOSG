import { useEffect, useRef } from 'react';
import { ArrowLeft, Home, Maximize, Play } from 'lucide-react';
import type { Game } from '../config/games';
import { useGamepad } from '../hooks/useGamepad';

export function SystemMenu({ game, error, onResume, onHome, onFullscreen }: {
  game: Game; error?: string; onResume: () => void; onHome: () => void; onFullscreen: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    element?.querySelector<HTMLButtonElement>('[data-menu-action]')?.focus();
    return () => element?.close();
  }, []);

  useGamepad(true, (action) => {
    if (action === 'pause') return;
    if (action === 'back') { onResume(); return; }
    const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('[data-menu-action]') ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (action === 'accept') { buttons[index < 0 ? 0 : index]?.click(); return; }
    if (['up', 'left', 'down', 'right'].includes(action)) {
      const step = action === 'up' || action === 'left' ? -1 : 1;
      buttons[(index + step + buttons.length) % buttons.length]?.focus();
    }
  });

  return <dialog ref={dialog} className="system-menu" aria-labelledby="system-menu-title"
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onResume(); }}
    onKeyDown={(event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('[data-menu-action]') ?? []);
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      event.preventDefault(); buttons[next]?.focus();
    }}>
    <div className="system-menu-heading">
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <strong>LUMA OS: Gaming</strong>
      <button className="icon-button" onClick={onResume} aria-label="Reprendre le jeu"><ArrowLeft size={20} /></button>
    </div>
    <h2 id="system-menu-title">{game.name}</h2>
    <p>{game.local && game.id !== 'fouria' ? 'Jeu en pause.' : game.id === 'fouria'
      ? 'Solo en pause. Une partie en ligne continue pendant ce menu.'
      : 'Le jeu externe peut continuer pendant ce menu.'}</p>
    <div className="system-menu-actions">
      <button data-menu-action className="system-menu-resume" onClick={onResume}><Play size={20} /> Reprendre le jeu</button>
      <button data-menu-action onClick={onFullscreen}><Maximize size={20} /> Basculer le plein écran</button>
      <button data-menu-action onClick={onHome}><Home size={20} /> Quitter vers l’accueil LOSG</button>
    </div>
    {error && <p role="alert">{error}</p>}
    <p className="system-menu-hint">LB + RB + LT + RT / L1 + R1 + L2 + R2 : maintenir pour ouvrir ou fermer · F1 au clavier<br />Bouton inférieur (A / Croix) : valider · Bouton droit (B / Rond) : reprendre</p>
  </dialog>;
}
