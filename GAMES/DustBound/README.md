# DustBound

Démo technique jouable d'un buggy arcade, réalisée avec Phaser 3, TypeScript, Matter.js et Vite.

## Lancer la démo

```bash
npm install
npm run dev
```

Vite indique ensuite l'adresse locale à ouvrir dans le navigateur.

## Contrôles

- `→` ou `D` : accélérer
- `←`, `Q` ou `A` : freiner et reculer
- `↑` / `↓` : incliner le buggy en l'air
- `R` : recommencer
- Sur mobile : quatre commandes tactiles apparaissent automatiquement dans les coins inférieurs.

## Structure

Le niveau est décrit dans `src/levels/level01.ts`. Les points de terrain, plateformes, départ et arrivée peuvent être modifiés sans toucher à la logique physique. Le véhicule, le terrain, les entrées, la caméra, l'interface mobile et la gestion du niveau sont séparés dans `src/game/`.

## Éditeur de niveau

Le bouton `ÉDITEUR` ouvre le mode de création local :

- Glisser les points du terrain, les plateformes, le départ et l'arrivée
- Modifier précisément X, Y, largeur et angle dans l'inspecteur
- Ajouter ou supprimer des plateformes
- Annuler les modifications avec le bouton ou `Ctrl/Cmd + Z`
- Sauvegarder dans le navigateur et tester immédiatement
- Exporter ou importer un niveau au format JSON

`RÉINITIALISER` restaure le niveau fourni avec le projet. Aucune donnée n'est envoyée à un serveur.

Le prototype ne contient aucun backend, compte, stockage distant ou authentification.
