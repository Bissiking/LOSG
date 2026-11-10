// src/config/games.ts
// Catalogue LOSG. Les attributions des jeux tiers sont indiquées par entrée.

export type LaunchMode = 'embed' | 'newTab';

export interface Game {
  id: string;
  name: string;
  description: string;
  /** Nombre maximal de joueurs humains pris en charge par le jeu. */
  players?: number;
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
  attribution?: {
    author: string;
    copyright: string;
    sourceUrl: string;
    licenseUrl: string;
    licenseLabel: string;
  };
}

export const GAMES: Game[] = [
  {
    id: 'arcline',
    name: 'Arcline',
    players: 2,
    description: 'Un duel d’archers au tour par tour, contre l’IA ou à deux sur le même écran. Ajustez votre tir avec le vent et la gravité de trois terrains.',
    url: '/play/arcline/',
    launchMode: 'embed',
    local: true,
    controls: 'Croix / stick : angle et puissance · A / Croix : tirer · Options / Menu : réglages · Solo ou duel local à 2, avec 1 manette partagée ou 2 manettes',
    accent: '#F0B64C',
    cover: '/games/arcline-cover.jpg',
    background: '/games/arcline-bg.jpg',
  },
  {
    id: 'fouria',
    name: 'Fouria',
    players: 2,
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
    players: 1,
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
    players: 1,
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
    id: '2048',
    name: '2048',
    attribution: {
      author: 'Gabriele Cirulli',
      copyright: '© 2014 Gabriele Cirulli',
      sourceUrl: 'https://github.com/gabrielecirulli/2048',
      licenseUrl: '/play/2048/LICENSE.txt',
      licenseLabel: 'Licence MIT',
    },
    players: 1,
    description: 'Faites glisser les tuiles et fusionnez les nombres identiques pour atteindre 2048. Votre partie et votre meilleur score sont sauvegardés.',
    url: '/play/2048/',
    launchMode: 'embed',
    local: true,
    controls: 'Flèches / croix / stick : déplacer · LB / L1 ou R : nouvelle partie · A / Croix : continuer ou rejouer en fin de partie',
    accent: '#EDC22E',
    cover: '/games/2048-cover.svg',
    background: '/games/2048-bg.svg',
  },
  {
    id: 'hexgl',
    name: 'HexGL',
    attribution: {
      author: 'Thibaut Despoulain (BKcore)',
      copyright: '© 2015 Thibaut Despoulain (BKcore)',
      sourceUrl: 'https://github.com/BKcore/HexGL',
      licenseUrl: '/play/hexgl/LICENSE.txt',
      licenseLabel: 'Licence du dépôt : MIT',
    },
    players: 1,
    description: 'Pilotez un vaisseau de course sur les circuits suspendus de Cityscape. Maîtrisez les aérofreins et signez votre meilleur chrono.',
    url: '/play/hexgl/',
    launchMode: 'embed',
    local: true,
    controls: 'RT / R2 ou A / Croix : accélérer · Stick / croix : diriger · LB / RB : aérofreins · LT / L2 : freiner · X / Carré : recommencer',
    accent: '#4190BB',
    cover: '/games/hexgl-cover.svg',
    background: '/games/hexgl-bg.svg',
  },
  {
    id: 'dustbound',
    name: 'DustBound',
    players: 1,
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
