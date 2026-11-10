<!-- docs/catalogue-research.md -->
# Analyse des applications Bissiking — complément 0.2.0

Analyse en lecture seule du 9 novembre 2026. Aucun dépôt des applications n’a été modifié. Inventaire des dépôts accessibles sous `Bissiking`, puis lecture des README, arbres complets et sources graphiques. Les noms de dépôts n’ont pas été déduits des identifiants du catalogue.

## Dépôts et références examinés

| Application / identifiant LUMA | Dépôt | Branche examinée | Référence de l’arbre |
| --- | --- | --- | --- |
| Arcline / `arcline` | [Bissiking/arcline](https://github.com/Bissiking/arcline) | `v1` | `d07b2d6a02507d8ef6ec9f3a7fd1850428ea1383` |
| CT PASIMAL / `ctpasimal` | [Bissiking/ct_pasimal](https://github.com/Bissiking/ct_pasimal) | `main` | `583d5cefe21d8351f999887b060de6d7cfc7522d` |
| LUMA Snake / `luma-snake` | [Bissiking/snake](https://github.com/Bissiking/snake) | `main` | `73042dd52702b042047342401477df35d6f28ee9` |
| DustBound / `dustbound` | [Bissiking/DustBound](https://github.com/Bissiking/DustBound) | `main` | `0ec476e921120a27bc48c5c79723a3bcd2e22dd3` |
| Harmonix / `harmonix` | [Bissiking/harmonix-apps](https://github.com/Bissiking/harmonix-apps) | `main` | `c6d1cf5efdbb96d3f5cf750fb65812d66e486bee` |

Les références ci-dessus sont celles retournées par l’API Git Trees, relevées au moment de l’analyse. Les sites Arcline, Snake, DustBound et Harmonix répondent en HTTP 200, avec des titres concordants. CT PASIMAL répond en HTTP 302 : la page jouable n’a pas été inspectée après connexion. Aucun en-tête X-Frame-Options/CSP n’a été reçu sur ces réponses initiales ; cela ne prouve pas le bon fonctionnement en iframe.

## Ce que disent réellement les README

### Arcline

Le [README V1](https://github.com/Bissiking/arcline/blob/v1/README.md) décrit un duel d’archers 1 contre 1 au tour par tour, inspiré du principe de Bowman avec code et ressources originaux. Le solo contre une IA est indiqué terminé. La visée utilise un glisser-relâcher à la souris, avec angle et puissance ; gravité et vent influencent réellement la trajectoire. Trois terrains sont documentés : Prairie à l’aube, Canyon crépusculaire et Hauts plateaux venteux. Le multijoueur est annoncé pour V2, pas comme fonction disponible. LUMA ne reprend aucune promesse multijoueur.

Le dépôt ne contient pas de PRODUCT.md. [docs/ASSETS.md](https://github.com/Bissiking/arcline/blob/v1/docs/ASSETS.md) indique qu’aucun asset graphique externe n’est utilisé et que les formes Phaser sont provisoires. Les ressources visuelles raster sont absentes ; seul un favicon SVG est inventorié. [tokens.ts](https://github.com/Bissiking/arcline/blob/v1/apps/client/src/ui/tokens.ts), [environment.ts](https://github.com/Bissiking/arcline/blob/v1/apps/client/src/game/environment.ts), [archer.ts](https://github.com/Bissiking/arcline/blob/v1/apps/client/src/game/archer.ts) et MenuScene décrivent une prairie verte à l’aube, un accent or, un fond forêt sombre et de petits archers géométriques en tunique bleu-gris.

**Décision visuelle :** illustration promotionnelle générée suivant la palette et ces silhouettes simples ; ni château, ni magie, ni univers de fantasy réaliste. Ce visuel n’est pas présenté comme une capture du jeu.

### CT PASIMAL

Le [README](https://github.com/Bissiking/ct_pasimal/blob/main/README.md) présente un jeu web humoristique dans lequel on incarne Pasimal, contrôleur technique automobile. Il décrit aussi la sauvegarde/reprise rattachée à l’utilisateur et une authentification SSO gérée par le site. Ces éléments ne sont pas intégrés à LUMA.

Aucun PRODUCT.md, dossier d’images ou jaquette n’est présent dans l’arbre examiné. [index.html](https://github.com/Bissiking/ct_pasimal/blob/main/index.html), [css/game.css](https://github.com/Bissiking/ct_pasimal/blob/main/css/game.css) et [js/ui.js](https://github.com/Bissiking/ct_pasimal/blob/main/js/ui.js) montrent un garage industriel anthracite, jaune signalétique, pont élévateur, fiche papier crème et voitures dessinées en SVG. Les décisions et défauts sont représentés par du rouge/vert. Aucun portrait officiel de Pasimal n’est trouvé.

**Décision visuelle :** illustration générée d’une voiture modeste sur un pont de contrôle, dans le langage 2D du jeu. Aucun personnage inventé ni confusion avec un jeu de course. La connexion réelle reste à vérifier par le propriétaire sur le site.

### LUMA Snake

Le [README](https://github.com/Bissiking/snake/blob/main/README.md) contient uniquement le nom du dépôt et la phrase « Jeu snake version LUMA ». Il ne documente pas de modes supplémentaires ni d’histoire.

Aucun PRODUCT.md ni fichier d’image n’est présent dans l’arbre examiné. Les informations suivantes proviennent du **code**, pas du README : [MenuScene](https://github.com/Bissiking/snake/blob/main/src/game/MenuScene.ts), [GameScene](https://github.com/Bissiking/snake/blob/main/src/game/GameScene.ts) et [Skins.ts](https://github.com/Bissiking/snake/blob/main/src/game/Skins.ts) utilisent des segments carrés arrondis, une grille sombre, du vert menthe pour le serpent par défaut et du rose-rouge pour la nourriture. Le menu affiche LUMA / SNAKE et de la typographie monospace. La scène incrémente le score quand le serpent mange et accélère progressivement. La description du catalogue reste limitée au concept Snake confirmé.

**Décision visuelle :** illustration graphique générée avec segments et virages à angle droit sur grille noire. Aucun serpent réaliste, décor futuriste ni obstacle inventé.

### DustBound

Le [README](https://github.com/Bissiking/DustBound/blob/main/README.md) décrit une démo technique jouable de buggy arcade sous Phaser/Matter.js. Le clavier commande accélération, frein/marche arrière et inclinaison en l’air ; des commandes tactiles sont prévues. Un éditeur local permet de manipuler le terrain, tester et échanger des niveaux JSON. Aucun backend ni compte n’est annoncé.

[PRODUCT.md](https://github.com/Bissiking/DustBound/blob/main/PRODUCT.md) précise terrain vallonné, suspensions, sauts, chronomètre et arrivée. [DESIGN.md](https://github.com/Bissiking/DustBound/blob/main/DESIGN.md) fixe « Baja nocturne » : nuit pétrole, terrain ocre stratifié, buggy corail, jalons cyan, scène vectorielle mate. Son ancienne mention d’absence d’assets est replacée dans le contexte de l’arbre actuel, qui contient des captures et des maquettes.

**Décision visuelle :** récupération de la [capture finale réelle](https://github.com/Bissiking/DustBound/blob/main/.impeccable/mocks/review-desktop-final.png), vérifiée visuellement. Les maquettes `baja-*.png` ne sont pas retenues. Recadrage de la capture pour retirer le HUD supérieur, sans ajout de décor ni de véhicule. La source mesure 1440 × 900 ; les variantes sont rééchantillonnées, sans prétendre ajouter du détail natif.

### Harmonix

Le [README](https://github.com/Bissiking/harmonix-apps/blob/main/README.md) décrit une application musicale Flutter : catalogue Sonora, fichiers personnels, téléchargements, Android Auto, Chromecast, Rift et Harmonix Night. Les capacités et limites sont renvoyées à [DOCS/V4-DELIVERY.md](https://github.com/Bissiking/harmonix-apps/blob/main/DOCS/V4-DELIVERY.md), également lu. LUMA ne promet pas que toutes ces fonctions natives existent dans la version web.

[PRODUCT.md](https://github.com/Bissiking/harmonix-apps/blob/main/PRODUCT.md) et [DESIGN.md](https://github.com/Bissiking/harmonix-apps/blob/main/DESIGN.md) établissent Moon Resonance : H ondulé violet/cyan, midnight navy `#0A0F2B`, violet `#7B5CFF`, lavande `#C8B4FF`, cyan `#5EE6FF`. La source de marque utilisée par l’interface est [assets/images/harmonix.png](https://github.com/Bissiking/harmonix-apps/blob/main/assets/images/harmonix.png). Le master SVG et les captures du catalogue ont été examinés ; les captures utilisent des données de test selon DESIGN.md et ne sont pas utilisées pour annoncer un catalogue musical réel.

**Décision visuelle :** compositions locales avec le H officiel inchangé sur fond midnight navy, aux formats de la bibliothèque et du fond immersif. Aucune nouvelle mascotte ou identité générée. Harmonix est identifié comme application musicale avec une action Ouvrir.

## Intégration et limites

- Les cinq sites du brief sont utilisés tels quels ; les anciennes entrées fictives sont remplacées après cette analyse.
- Ouverture par défaut en nouvel onglet pour préserver les parcours propres des applications, notamment la connexion CT PASIMAL et l’audio Harmonix. Les deux modes de lancement du prototype restent disponibles via les préférences.
- Les illustrations sont chargées exclusivement depuis `public/games/`. Les références GitHub servent de provenance documentaire, sans appel réseau d’illustration à l’exécution.
- Fonds en fondu et fallback du prototype conservés ; format d’affichage des jaquettes harmonisé en 16:9.
- Ressources officielles manquantes : jaquettes/fonds raster Arcline, CT PASIMAL et Snake ; bannières 16:9 prêtes à l’emploi pour Harmonix ; capture DustBound native 1920 × 1080 sans HUD. Les variantes livrées sont explicitement décrites dans `public/games/ARTWORK.md`.
- Tests fonctionnels des sites, SSO, audio, manette et jeux tiers non effectués. Les réponses HTTP et la lecture des sources ne remplacent pas une partie réelle.

## Vérifications de l’intégration LUMA

- `npm test` : 11 tests réussis, incluant les cinq correspondances identifiant/URL, l’existence locale et les dimensions des dix JPEG, ainsi que la distinction musicale d’Harmonix.
- `npm run build` : TypeScript strict et Vite 6.4.5 réussis.
- `npm audit` : aucune vulnérabilité signalée à la vérification.
- Détecteur mécanique UI : aucun signalement sur les fichiers modifiés.
- Prévisualisation de production : HTML, JavaScript, CSS et dix JPEG répondent en HTTP 200 ; les types MIME des images sont `image/jpeg`. Les anciennes images des exemples fictifs sont absentes du build.
- Inspection des fichiers image réalisée. Aucun parcours navigateur interactif ni test des applications tierces authentifiées n’est revendiqué.
