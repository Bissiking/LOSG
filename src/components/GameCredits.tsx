import type { Game } from '../config/games';

export function GameCredits({ game, player = false }: { game: Game; player?: boolean }) {
  const credit = game.attribution;
  if (!credit) return null;
  return <div className={`game-credits${player ? ' game-credits-player' : ''}`} aria-label={`Crédits de ${game.name}`}>
    <span>{credit.copyright}</span>
    <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">Projet original</a>
    <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.licenseLabel}</a>
  </div>;
}
