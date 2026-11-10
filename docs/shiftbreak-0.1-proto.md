<!-- docs/shiftbreak-0.1-proto.md -->
# Livraison SHIFTBREAK 0.1-PROTO

Validation locale du 10 novembre 2026, sous Node.js 24.19.0 et npm 12.2.0. Le prototype est intégré à `GAMES/shiftbreak` et au catalogue LOSG. Il se lance par **SHIFTBREAK → Jouer**, ou directement par `/play/shiftbreak/` après `npm run dev`.

## Périmètre réellement livré

- [x] Un seul niveau original manuel, six sections progressives, départ et arrivée.
- [x] Défilement automatique, vitesse horizontale progressive de 240 à 360 px/s.
- [x] Gravité haut / bas et inversions illimitées en vol, avec changement immédiat du sens de la vitesse verticale.
- [x] Physique pure à 120 Hz, collisions balayées, interpolation et caméra horizontale amortie.
- [x] Obstacles fixes hachurés, navettes mobiles, plateformes qui cèdent après contact et barrières synchronisées avec avertissement.
- [x] Clavier configurable, bouton principal d'une manette standard, pression tactile / souris ; maintien et événements tactiles multiples filtrés.
- [x] Menu Jouer / Commandes / Informations, temps de la tentative, vitesse, compteur de morts de session, sens de gravité, section et avancement.
- [x] Pause locale, reprise, mort, nouvelle tentative immédiate et fin du niveau.
- [x] Pause système LOSG distincte de la pause locale, reprise et relâchement des commandes.
- [x] Avertissement expérimental complet à chaque nouveau chargement, avant de pouvoir jouer.
- [x] Aucune sauvegarde, progression persistante, authentification, connexion Kyros, partie réseau ou fonctionnalité d'une future version.

Le témoin de jouabilité termine en **72,3416667 secondes de simulation avec 14 inversions et zéro mort**, à vitesse réellement accélérée. Une traversée complète par événements clavier, avec rendu, atteint aussi l'écran d'arrivée dans Chrome. Ce sont des preuves de faisabilité ; elles ne remplacent pas des retours de joueurs sur le plaisir et la difficulté.

## Choix techniques

Le dépôt utilisait déjà TypeScript, Vite multi-pages, un catalogue central et `play/bridge.ts` pour le cycle de vie du lecteur. SHIFTBREAK réutilise ces mécanismes et les lecteurs de manette / navigation DOM existants. Son rendu Canvas 2D n'ajoute aucune dépendance ni aucun moteur Phaser à sa propre page. Aucun autre jeu n'a été modifié.

Les données manuelles du niveau, le personnage, les collisions, les obstacles, les commandes, le rendu, la caméra et l'interface sont séparés. Les règles physiques ne connaissent ni le navigateur ni le stockage. Elles peuvent être réutilisées ultérieurement sans construire dès maintenant une campagne, un générateur Endless ou une infrastructure multijoueur.

Les contacts verticaux sont suivis d'un second balayage horizontal pour éviter qu'une collision au sol masque un mur. Les barrières découpent les déplacements selon leurs fenêtres d'activation : un passage effectué pendant la phase inactive reste autorisé, même si l'activation arrive plus tard dans le même pas.

Le menu système déplace le focus hors de l'iframe avant d'envoyer son message de pause. SHIFTBREAK fige immédiatement la simulation à la perte de focus et laisse ce message prendre en charge la pause, sans ajouter une seconde pause locale. Une pause locale déjà ouverte reste en place à la fermeture du menu système. Cette interaction a été reproduite et validée dans le lecteur réel LOSG.

## Vérifications exécutées

| Vérification | Résultat observé |
| --- | --- |
| `npm run typecheck` | Réussi : catalogue, jeux et intégration TypeScript |
| `npm test` | 35 tests réussis |
| `npm run test:games` | 131 tests réussis, dont 21 pour SHIFTBREAK |
| `npm run build` | Réussi : page et bundles de production, visuels locaux inclus |
| `npm run test:integration` après build | 5 tests réussis : sept jeux servis, bundles, ressources historiques, musiques Arcline et salle Fouria WebSocket |
| Replays fixes à 30 / 60 / 120 FPS | Arrivée, temps et état du personnage identiques ; plateformes temporaires activées |
| Collisions rapides | Danger de 1 px traversé à 100 000 px/s intercepté ; plafond, sol, bord et navette couverts |
| Fenêtres des barrières | Activation en cours de pas détectée ; passage avant activation autorisé |
| Chrome headless, build servi avec `npm start` sur `127.0.0.1:4173` | 12 scénarios réussis, zéro erreur JavaScript collectée |
| Contrôle visuel | Captures desktop 1440 × 1000, mobile 390 × 844 et 320 × 740 ; warning, menus, jeu, pause, arrivée et lecteur LOSG |
| Détecteur Impeccable sur les fichiers UI et les deux SVG | Aucun signalement (`[]`) |
| Relecture indépendante Impeccable | Verdict `SHIP` : aucun problème matériel dans le périmètre revu ; neuf captures inspectées |
| `git diff --check` | Réussi |

Les 12 scénarios navigateur vérifient :

1. Touche configurable, maintien sans répétition et inversions successives.
2. Pause locale, temps figé et reprise.
3. Manette standard simulée, fronts d'appui et reconnexion avec bouton maintenu.
4. Plusieurs pointeurs tactiles simultanés : une seule inversion.
5. Mort naturelle par collision, compteur et redémarrage.
6. Parcours entier jusqu'à l'arrivée par événements clavier, avec rendu.
7. Écritures de stockage interdites pendant le test ; stockage vide et statistiques remises à zéro au rechargement.
8. Mobile 390 px : inversion par pression tactile émulée, pause et reprise.
9. Mobile 320 px : aucun débordement horizontal du document.
10. Pause locale préservée après ouverture et fermeture du menu système LOSG.
11. Fermeture et réouverture de l'iframe : avertissement et nouvelle session.
12. Lancement depuis le catalogue, pause système, temps figé et reprise automatique.

Le script reproductible est `GAMES/shiftbreak/scripts/browser-check.mjs`. Il utilise le Chrome for Testing headless et le module Playwright déjà disponibles dans l'environnement, sans installer de dépendance. Les chemins se passent par `SHIFTBREAK_CHROME_PATH` et `SHIFTBREAK_BROWSER_MODULE`, avec `SHIFTBREAK_BASE` pour l'origine à tester. Voir le README du jeu pour la commande.

Les traces locales non versionnées sont `.cache/shiftbreak/build.log`, `.cache/shiftbreak/browser-results.json`, `.cache/shiftbreak/design-detect.json`, `.cache/shiftbreak/finish-review.md` et `.impeccable/review/*.png`. Le témoin de parcours reste versionné dans `src/levels/reference.ts` et n'est pas importé par le jeu.

## Fichiers créés

Dans `GAMES/shiftbreak/` :

- `PRODUCT.md` : contraintes produit issues du brief.
- `README.md` : lancement, commandes, moteur, vérifications et priorités suivantes.
- `DESIGN.md` et `.impeccable/design.json` : grammaire visuelle et tokens extraits de l’interface livrée.
- `src/engine/types.ts` : contrats et états de jeu.
- `src/engine/player.ts` : personnage, paramètres et inversion.
- `src/engine/clock.ts` : horloge à pas fixe.
- `src/engine/collision.ts` : collisions continues AABB.
- `src/engine/obstacles.ts` : mouvement et activation des dangers.
- `src/engine/physics.ts` : simulation et contacts.
- `src/engine/engine.test.ts` : 21 tests physiques et de parcours.
- `src/levels/demo.ts` : unique carte manuelle et ses sections.
- `src/levels/reference.ts` : témoin de traversée utilisé uniquement pour vérifier le parcours.
- `src/input.ts` : clavier, pointeurs et manette.
- `src/camera.ts` : suivi horizontal.
- `src/renderer.ts` : dessin Canvas 2D.
- `src/ui.ts` : écrans et HUD.
- `src/main.ts` : orchestration, boucle et pauses.
- `src/style.css` : présentation responsive et polices déjà présentes dans LOSG.
- `scripts/browser-check.mjs` : contrôles navigateur optionnels.

Dans LOSG :

- `play/shiftbreak/index.html` et `play/shiftbreak/main.ts` : point d'entrée isolé.
- `public/games/shiftbreak-cover.svg` et `public/games/shiftbreak-bg.svg` : compositions géométriques locales du catalogue.
- `docs/shiftbreak-0.1-proto.md` : présent bilan.

## Fichiers existants modifiés

- `src/config/games.ts` : entrée du catalogue, commandes et illustrations.
- `vite.config.ts` : entrée multi-pages du build.
- `tests/core.test.mjs` : catalogue de sept jeux locaux et une application externe.
- `tests/integration/games.test.mjs` : contrôle HTTP de la nouvelle page de production.
- `README.md` : jeu, commandes, chemins et documentation du catalogue mis à jour.
- `public/games/ARTWORK.md` : provenance des deux SVG.

Le lockfile était déjà modifié au début de la tâche ; aucune installation ni mise à jour de dépendance n'a été nécessaire pour SHIFTBREAK.

## Limites et points non vérifiés

- La manette est testée par un état standard simulé ; aucune manette physique n'a été vérifiée.
- Le tactile et le responsive sont émulés dans Chrome desktop ; aucun téléphone réel ni navigateur Safari / Firefox n'a été testé.
- Les FPS 30 / 60 / 120 sont des cadences d'horloge de test, pas des mesures de performances sur trois écrans ou matériels réels.
- Les interruptions longues plafonnent le rattrapage à 250 ms par image ; le temps affiché est le temps de simulation, hors pause.
- Les navettes sont balayées relativement sur chaque segment à 120 Hz ; leur mouvement sinusoïdal est approximé linéairement à cette échelle.
- La faisabilité du niveau est prouvée par replay. Le ressenti, l'équilibrage et la durée avant une première réussite humaine restent à mesurer.
- Lecteur d'écran, plein écran matériel, suspension mobile prolongée et reprise via cache de navigation n'ont pas fait l'objet d'une validation complète.
- Le build conserve l'avertissement existant sur le gros chunk Phaser utilisé par les autres jeux. SHIFTBREAK n'en dépend pas.
- Aucun déploiement distant ni changement de production n'a été effectué.

## Priorités proposées pour 0.2-ALPHA

1. Playtests sur plusieurs personnes, manettes physiques et téléphones, avec observation des erreurs d'anticipation.
2. Ajuster le rythme du parcours, les marges de réaction et les signaux des plateformes / barrières selon les retours.
3. Ajouter quelques cartes manuelles courtes et leurs replays déterministes si la mécanique convainc.
4. Évaluer ensuite la progression et le partage des règles pour de futurs modes ; ne pas ajouter de réseau avant d'avoir confirmé le gameplay.

Le socle technique est validé localement. La décision d'en faire un jeu complet doit maintenant s'appuyer sur des tests joueurs.
