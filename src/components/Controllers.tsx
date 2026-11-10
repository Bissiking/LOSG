import { Gamepad2 } from 'lucide-react';
import { useControllers } from '../hooks/useControllers';
export function Controllers() {
  const controllers = useControllers();
  return <section className="controllers" aria-label="Manettes et joueurs">
    <h2><Gamepad2 size={20} /> Manettes et joueurs</h2>
    <p>Clavier et souris disponibles. Connectez une manette, puis appuyez sur un bouton pour la détecter.</p>
    <ul aria-live="polite">
      {controllers.map((pad) => <li key={pad.index}>
        <strong>Joueur {pad.player} · {pad.type}</strong>
        <span>{pad.name}</span>
        <small>{pad.supported ? 'Commandes standard disponibles' : 'Détectée · mapping non standard, commandes non prises en charge'}</small>
      </li>)}
    </ul>
    {!controllers.length && <p role="status">Aucune manette détectée.</p>}
    <p>Arcline, Snake et DustBound : 1 joueur. Fouria : 1 à 2 joueurs sur le même écran, avec une manette partagée ou deux manettes.</p>
    <p>Menu LOSG : maintenez LB + RB + LT + RT (L1 + R1 + L2 + R2), ou appuyez sur F1.</p>
    <p>Le bouton Xbox / PS reste réservé au système. Si Steam transforme les commandes en raccourcis clavier, utilisez un profil de manette standard pour le navigateur.</p>
  </section>;
}
