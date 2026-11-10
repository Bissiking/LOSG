// src/components/GameArt.tsx
import { useEffect, useState, type CSSProperties } from 'react';
import { Gamepad2, Music2 } from 'lucide-react';
import type { Game } from '../config/games';

export const gameStyle = (game: Game): CSSProperties => ({ '--game-accent': game.accent } as CSSProperties);

export function GameArt({ game, eager = false }: { game: Game; eager?: boolean }) {
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <span className="game-art" style={gameStyle(game)} aria-hidden="true">
      <span className="art-fallback">{game.kind === 'music' ? <Music2 /> : <Gamepad2 />}<span>{game.name}</span></span>
      {game.cover && failedSource !== game.cover && (
        <img src={game.cover} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async"
          onError={() => setFailedSource(game.cover)} />
      )}
    </span>
  );
}

interface Backdrop { id: string; src?: string; accent: string }

/** Decode before revealing, keep the previous layer during the crossfade. */
export function GameBackdrop({ game, onReady }: { game?: Game; onReady?: () => void }) {
  const [layers, setLayers] = useState<Backdrop[]>([]);
  useEffect(() => {
    let cancelled = false;
    let cleanup: ReturnType<typeof setTimeout> | undefined;
    const reveal = (src?: string) => {
      if (cancelled || !game) return;
      const next = { id: game.id, src, accent: game.accent };
      setLayers((old) => [...old.filter((layer) => layer.id !== next.id).slice(-1), next]);
      onReady?.();
      cleanup = setTimeout(() => { if (!cancelled) setLayers([next]); }, 650);
    };
    if (game?.background) {
      const image = new Image();
      image.src = game.background;
      image.decode().then(() => reveal(game.background), () => reveal());
    } else if (game) reveal();
    else { setLayers([]); onReady?.(); }
    return () => { cancelled = true; clearTimeout(cleanup); };
  }, [game, onReady]);
  return <div className="backdrops" aria-hidden="true">{layers.map((layer, i) => (
    <div key={layer.id} className={`bg ${i === layers.length - 1 ? 'bg-current' : ''}`}
      style={{ '--game-accent': layer.accent } as CSSProperties}>
      {layer.src && <img src={layer.src} alt="" decoding="async" />}
    </div>
  ))}</div>;
}
