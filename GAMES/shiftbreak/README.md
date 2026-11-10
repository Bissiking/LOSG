<!-- GAMES/shiftbreak/README.md -->
# SHIFTBREAK 0.1-PROTO

Prototype original de plateforme à défilement automatique, intégré à LOSG. Une action inverse immédiatement la gravité et le sens de la vitesse verticale. Une seule carte manuelle, aucune sauvegarde, aucun service réseau ni compte.

## Lancer

À la racine de LOSG : `npm ci`, puis `npm run dev`. Choisir **SHIFTBREAK → Jouer** dans le catalogue ou ouvrir <http://localhost:5173/play/shiftbreak/>. Le lecteur LOSG conserve son menu système, son retour et son plein écran. `npm run build` inclut la page dans `dist/play/shiftbreak/` ; le serveur habituel LOSG la sert sans configuration supplémentaire.

L'avertissement expérimental revient à chaque nouveau chargement. Le bouton **J’AI COMPRIS** ouvre le menu Jouer / Commandes / Informations. Les statistiques et la touche choisie disparaissent en fermant ou rechargeant le document.

## Jouer

- Espace, A / Croix sur une manette standard, clic ou pression sur le parcours : inverser la gravité.
- La touche d'inversion se choisit dans Commandes : Espace, flèche haut, W ou K. Le choix reste dans cette session.
- P / Échap, Options / Menu ou B / Rond : pause. R : recommencer. Les boutons de l'interface donnent les mêmes actions.
- La manette navigue aussi dans les menus. Une pression tenue ne répète pas les inversions. La reconnexion et le retour de pause attendent le neutre.
- Les blocs corail hachurés sont mortels. Les navettes oscillent entre les rails. Les rails jaunes pointillés cèdent 0,6 seconde après leur premier contact. Une barrière pointillée est inactive ; son avertissement et son indicateur annoncent sa prochaine activation.

Le niveau **La ligne de rupture** dure environ 72,34 secondes de simulation pour une réussite. Six sections présentent l'inversion, les obstacles fixes, les navettes, les plateformes temporaires, les barrières synchronisées et une combinaison finale. La mort conserve le compteur de session et permet de relancer immédiatement depuis le départ. Aucun checkpoint ni deuxième niveau.

## Moteur

| Responsabilité | Sources |
| --- | --- |
| Types et état d'une tentative | `src/engine/types.ts`, `player.ts` |
| Horloge fixe avec accumulation | `src/engine/clock.ts` |
| Collisions continues AABB | `src/engine/collision.ts` |
| Simulation et résolution de contacts | `src/engine/physics.ts` |
| Mouvement et fenêtres d'activation des dangers | `src/engine/obstacles.ts` |
| Carte et sections manuelles | `src/levels/demo.ts` |
| Commandes, fronts d'appui et navigation native | `src/input.ts` |
| Caméra et interpolation visuelle | `src/camera.ts`, `renderer.ts` |
| Écrans, HUD et orchestration | `src/ui.ts`, `main.ts` |
| Document isolé et liaison LOSG | `../../play/shiftbreak/` |

La simulation pure avance à **120 Hz**, sans DOM, horloge système, hasard ou stockage. `PHYSICS` configure une accélération verticale de 1 900 px/s², une limite verticale de 680 px/s, une impulsion minimale d'inversion de 170 px/s, une vitesse horizontale de 240 à 360 px/s et une accélération horizontale constante de 2,4 px/s². Une inversion conserve la valeur absolue de la vitesse verticale, avec un minimum de 170 px/s, et change immédiatement son signe.

Les collisions balayent le déplacement relatif complet du personnage et des obstacles. Après un contact vertical, un second balayage résout le glissement horizontal restant : le sol ne peut donc pas masquer un mur. Les barrières découpent le déplacement selon leurs fenêtres actives, sans danger rétroactif après un passage effectué pendant leur phase libre. Les navettes sont évaluées sur les bornes de chaque sous-segment à 120 Hz.

Le rendu Canvas 2D interpole les deux derniers états, utilise une caméra amortie et limite la résolution à deux fois la densité CSS. La hauteur du monde reste fixe ; le mobile conserve au moins 600 unités horizontales visibles. Une interruption longue est plafonnée à 250 ms simulées par image, plutôt que de téléporter le personnage. La perte de focus ou un onglet masqué suspendent la tentative. Le menu système LOSG bloque les entrées et la simulation via la liaison existante, sans écraser une pause locale.

Les règles et les données peuvent servir à de futures cartes ou à un futur moteur réseau ; aucune infrastructure de campagne, Endless, progression, authentification ou multijoueur n'est implémentée.

## Vérifier

Depuis la racine :

```sh
npm run typecheck
npm test
npm run test:games
npm run build
npm run test:integration
```

`src/engine/engine.test.ts` couvre les inversions successives, le plafond, le sol, les contacts latéraux, les vitesses extrêmes, les plateformes temporaires, les navettes, les barrières, la pause et le chronométrage. Le témoin hors ligne `src/levels/reference.ts` fournit 14 inversions au tick près ; les tests traversent réellement toute la carte à 30, 60 et 120 FPS et comparent les états finaux. Ce témoin n'est jamais importé par le jeu ni livré comme mode automatique.

Le contrôle navigateur optionnel utilise **Chrome headless et Playwright** disponibles dans l'environnement, sans ajouter de dépendance au jeu. Avec un serveur LOSG ouvert :

```sh
SHIFTBREAK_BROWSER_MODULE=/chemin/vers/playwright/index.mjs \
SHIFTBREAK_CHROME_PATH=/chemin/vers/chrome-headless-shell \
node --import tsx GAMES/shiftbreak/scripts/browser-check.mjs
```

`SHIFTBREAK_BASE` peut cibler le serveur de production, par exemple `http://127.0.0.1:4173`. Le script vérifie le clavier configurable, le maintien des touches, une manette standard **simulée**, le tactile émulé, la pause, la mort, le redémarrage, l'arrivée complète par événements clavier, l'absence d'écritures de stockage et le lancement / la pause système / la reprise dans LOSG. Il produit les résultats dans `.cache/shiftbreak/browser-results.json` et les captures dans `.impeccable/review/`.

Voir [le bilan de livraison](../../docs/shiftbreak-0.1-proto.md) pour les commandes effectivement exécutées, leurs résultats et les limites.

## Priorités proposées pour 0.2-ALPHA

1. Faire jouer plusieurs personnes, au clavier et sur appareils physiques, pour mesurer la compréhension, les morts et les marges de réaction.
2. Ajuster l'anticipation visuelle, les fenêtres des barrières et la transition des plateformes temporaires à partir de ces retours.
3. Ajouter quelques parcours manuels courts et des replays de régression déterministes, après validation du plaisir de jeu.
4. Étudier ensuite les besoins réels de progression et de réseau ; ils ne font pas partie du prototype actuel.
