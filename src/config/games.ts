// src/config/games.ts
// Catalogue des applications Bissiking. Sources : docs/catalogue-research.md.

export type LaunchMode = 'embed' | 'newTab';

export interface Game {
  id: string;
  name: string;
  description: string;
  /** Harmonix est une application musicale, pas un jeu. */
  kind?: 'game' | 'music';
  /** Image de couverture (chemin dans /public ou URL). Facultatif. */
  cover?: string;
  /** Image d'arrière-plan (chemin dans /public ou URL). Facultatif. */
  background?: string;
  /** URL HTTP(S) ou chemin local du jeu. */
  url: string;
  /** 'embed' = vue intégrée (si le site l'autorise), 'newTab' = nouvel onglet. */
  launchMode: LaunchMode;
  /** Couleur d'accent utilisée pour le dégradé de secours. */
  accent: string;
  /** Entrée et illustrations de démonstration, sans vrai jeu associé. */
  demo?: boolean;
  /** Jeu livré avec LOSG, isolé dans son propre document. */
  local?: boolean;
  controls?: string;
}

export const GAMES: Game[] = [
  {
    id: 'arcline',
    name: 'Arcline',
    description: 'Un duel d’archers au tour par tour face à l’IA. Ajustez votre tir et composez avec le vent et la gravité de trois terrains.',
    url: '/play/arcline/',
    launchMode: 'embed',
    local: true,
    controls: 'Manette : croix = angle / puissance · A / Croix = tirer · Options / Menu = réglages · Solo contre l’IA',
    accent: '#F0B64C',
    cover: '/games/arcline-cover.jpg',
    background: '/games/arcline-bg.jpg',
  },
  {
    id: 'fouria',
    name: 'Fouria',
    description: 'Quatre jetons pour gagner. Défiez un ami sur le même écran, affrontez l’IA ou retrouvez-vous dans une salle en ligne.',
    url: '/play/fouria/',
    launchMode: 'embed',
    local: true,
    controls: 'Manette : croix / stick = colonne · A / Croix = jouer · B / Rond = retour · 1 à 2 joueurs',
    accent: '#2F7BFF',
    cover: '/games/fouria-cover.svg',
    background: '/games/fouria-bg.svg',
  },
  {
    id: 'ctpasimal',
    name: 'CT PASIMAL',
    description: 'Incarnez Pasimal, contrôleur technique automobile, dans un jeu web humoristique. Votre prochain véhicule vous attend au garage.',
    url: 'https://ctpasimal.mhemery.fr/',
    launchMode: 'newTab',
    accent: '#FFC400',
    cover: '/games/ctpasimal-cover.jpg',
    background: '/games/ctpasimal-bg.jpg',
  },
  {
    id: 'luma-snake',
    name: 'LUMA Snake',
    description: 'Le classique Snake, version LUMA. Guidez le serpent sur la grille, mangez et faites grandir votre score.',
    url: '/play/snake/',
    launchMode: 'embed',
    local: true,
    controls: 'Flèches, ZQSD, WASD ou manette : diriger · Entrée : valider',
    accent: '#00FFAA',
    cover: '/games/luma-snake-cover.jpg',
    background: '/games/luma-snake-bg.jpg',
  },
  {
    id: 'dustbound',
    name: 'DustBound',
    description: 'Un buggy arcade, des suspensions et un terrain vallonné. Accélérez, maîtrisez vos sauts et rejoignez l’arrivée.',
    url: '/play/dustbound/',
    launchMode: 'embed',
    local: true,
    controls: 'Manette : RT / R2 = accélérer · LT / L2 = reculer · Stick gauche = incliner · X / Carré = recommencer',
    accent: '#ED674B',
    cover: '/games/dustbound-cover.jpg',
    background: '/games/dustbound-bg.jpg',
  },
];
