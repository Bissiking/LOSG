import { ChevronDown, Gamepad2 } from 'lucide-react';
import { GAMES } from '../config/games';
import type { ControllerInfo } from '../lib/gamepad';

export function Controllers({ controllers }: { controllers: ControllerInfo[] }) {
  return <section className="controllers" aria-labelledby="controllers-title">
    <div className="controllers-heading"><h2 id="controllers-title"><Gamepad2 size={20} aria-hidden="true" /> Manettes</h2><span className="controller-count" role="status">{controllers.length} connectée{controllers.length === 1 ? '' : 's'}</span></div>
    <p>Connectez une manette, puis appuyez sur un bouton pour la détecter.</p>
    <ul aria-live="polite">
      {controllers.map((pad) => <li key={pad.index}>
        <div className="controller-name"><strong>{pad.type}</strong><span>Joueur {pad.player}</span></div>
        <span className="controller-device">{pad.name}</span>
        <small className={pad.supported ? 'controller-ready' : 'controller-unsupported'}>{pad.supported ? 'Prête à jouer' : 'Mapping non standard : commandes non prises en charge'}</small>
      </li>)}
    </ul>
    {!controllers.length && <div className="controller-empty"><Gamepad2 size={28} aria-hidden="true" /><p>Aucune manette détectée.<br />Le clavier et la souris restent disponibles.</p></div>}
    <details className="settings-disclosure" open>
      <summary>Joueurs par jeu <ChevronDown size={16} aria-hidden="true" /></summary>
      <dl className="player-capacities">{GAMES.filter((game) => game.local).map((game) => <div key={game.id}><dt>{game.name}</dt><dd>{game.players === 2 ? '1 à 2 joueurs' : '1 joueur'}</dd></div>)}</dl>
      <p>À deux, Arcline et Fouria acceptent une manette partagée ou deux manettes.</p>
    </details>
    <details className="settings-disclosure">
      <summary>Aide à la connexion <ChevronDown size={16} aria-hidden="true" /></summary>
      <p>Utilisez une manette avec un mapping standard. Le bouton Xbox / PS reste réservé au système.</p>
      <p>Si Steam transforme les commandes en raccourcis clavier, choisissez un profil de manette standard pour le navigateur.</p>
    </details>
  </section>;
}
