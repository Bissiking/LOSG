// src/components/Player.tsx
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, Gamepad2, Maximize, RotateCcw, X } from 'lucide-react';
import type { Game } from '../config/games';
import { openGameTab } from '../lib/launch';
import { useSystemButton } from '../hooks/useSystemButton';
import { SystemMenu } from './SystemMenu';
import { GameCredits } from './GameCredits';

export function Player({ game, onClose }: { game: Game; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'slow' | 'failed'>('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useSystemButton(() => setMenuOpen((open) => !open));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'F1') return;
      event.preventDefault();
      if (!event.repeat) setMenuOpen((open) => !open);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!game.local) return;
    frame.current?.contentWindow?.postMessage({ type: menuOpen ? 'losg:pause' : 'losg:resume' }, window.location.origin);
    if (!menuOpen) frame.current?.focus();
  }, [menuOpen, game.local]);

  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    close.current?.focus();
    return () => {
      element?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setState((s) => s === 'loading' ? 'slow' : s), 15000);
    return () => clearTimeout(timer);
  }, [attempt]);

  useEffect(() => {
    if (!game.local) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'losg:ready') {
        setState('loaded');
        if (menuOpen) frame.current?.contentWindow?.postMessage({ type: 'losg:pause' }, window.location.origin);
        else frame.current?.focus();
      }
      if (event.data?.type === 'losg:error') setState('failed');
      if (event.data?.type === 'losg:close') onClose();
      if (event.data?.type === 'losg:menu') setMenuOpen((open) => !open);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [game.local, onClose, menuOpen]);

  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (dialog.current?.requestFullscreen) await dialog.current.requestFullscreen();
      else setError('Le plein écran n’est pas disponible dans ce navigateur.');
    } catch { setError('Le plein écran a été refusé. Vous pouvez réessayer.'); }
  };
  const retry = () => { setState('loading'); setError(''); setAttempt((n) => n + 1); };

  return <dialog ref={dialog} className={`player ${game.local ? 'player-local' : ''}`} aria-labelledby="player-title"
    onCancel={(event) => { event.preventDefault(); setMenuOpen(true); }}>
    <div className="player-bar">
      <button ref={close} onClick={onClose}>
        {game.local ? <ArrowLeft size={16} /> : <X size={16} />}
        {game.local ? 'Retour à LOSG' : 'Fermer'}
      </button>
      <strong id="player-title">{game.name}</strong>
      <div>
        <button onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu LOSG" title="Menu LOSG (F1)"><Gamepad2 size={16} /><span className="player-menu-label">Menu LOSG</span></button>
        <button onClick={() => void fullscreen()} aria-label="Basculer le plein écran" title="Plein écran"><Maximize size={16} /></button>
        <button onClick={() => setError(openGameTab(game.url) ? '' : 'Nouvel onglet bloqué. Autorisez les fenêtres pour ce site, puis réessayez.')} aria-label="Ouvrir dans un nouvel onglet" title="Nouvel onglet">
          <ExternalLink size={16} /></button>
      </div>
    </div>
    <GameCredits game={game} player />
    <div className="player-help" role="status">
      {state === 'failed' ? 'Le jeu n’a pas pu démarrer. ' : state === 'loading' ? 'Chargement du jeu… ' : state === 'slow' ? 'Le chargement prend plus de temps que prévu. ' : ''}
      {game.local ? <><span>{game.controls}</span><span className="player-shortcut">LB + RB + LT + RT (maintenir) · F1 : menu LOSG</span></>
        : 'Si le jeu reste vide ou refuse l’intégration, ouvrez-le dans un nouvel onglet.'}
      {(state === 'slow' || state === 'failed') && <button onClick={retry}><RotateCcw size={14} /> Réessayer</button>}
    </div>
    {error && <p className="notice" role="alert">{error}</p>}
    <iframe ref={frame} key={attempt} src={game.url} title={game.name}
      onLoad={() => { if (!game.local) setState('loaded'); }}
      onError={() => setState('failed')} allow="fullscreen; gamepad; autoplay" allowFullScreen referrerPolicy="no-referrer" />
    {menuOpen && <SystemMenu game={game} error={error} onResume={() => setMenuOpen(false)} onHome={onClose} onFullscreen={() => void fullscreen()} />}
  </dialog>;
}
