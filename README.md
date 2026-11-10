<!-- README.md -->
# LUMA OS: Gaming — 0.3.0

Interface console React + TypeScript + Vite avec palette SPX violet, cyan, rose et noir. Les six jeux du dossier `GAMES/` sont livrés avec LOSG : Arcline, Fouria, LUMA Snake, DustBound, 2048 et HexGL. Fouria utilise son serveur WebSocket pour les salles en ligne ; les autres modes fonctionnent sans service distant.

## Démarrer

Node.js 22 LTS recommandé (environnement de vérification : 22.22.2).

```sh
npm ci
npm run dev       # Vite :5173 + serveur Fouria :3009
npm run typecheck # LOSG, six jeux, serveur et intégration
npm test          # LOSG, commandes, pause et chronomètre HexGL
npm run test:games # moteurs Fouria et Arcline
npm run build     # TypeScript + production dans dist/
npm run test:integration # après build : HTTP, musiques et partie WebSocket
npm run preview   # servir dist/ :4173 + serveur Fouria :3009
npm start         # production : LOSG et WebSocket sur :3000
npm audit         # nécessite un accès au registre npm
```

Les dépendances sont installées une seule fois à la racine : React, React DOM, Lucide, Phaser, les polices locales et `ws`. Tailwind compile les styles de Fouria. Les anciens manifestes des jeux restent comme références ; aucune installation séparée n’est nécessaire. L’audit npm ne signale aucune vulnérabilité lors de cette intégration. Le serveur de développement est destiné à un usage local.

## Jeux intégrés dans LOSG

2048 est de **Gabriele Cirulli** (© 2014, [projet original](https://github.com/gabrielecirulli/2048), [licence MIT](GAMES/2048/LICENSE.txt)). HexGL est de **Thibaut Despoulain / BKcore** (© 2015, [projet original](https://github.com/BKcore/HexGL), [licence du dépôt](GAMES/HexGL/LICENSE)). Les mentions spécifiques aux fichiers d’origine sont conservées. Les crédits sont affichés dans les fiches, la bibliothèque, le lecteur LOSG et les pages de jeu ; les licences complètes sont incluses dans le build.

| Jeu | Page embarquée | Modes conservés |
| --- | --- | --- |
| Arcline | `/play/arcline/` | Duel contre l’IA ou duel local à deux, réglages et musiques |
| Fouria | `/play/fouria/` | Deux joueurs sur le même écran, IA, salles en ligne, personnalisation |
| LUMA Snake | `/play/snake/` | Jeu, skins et réglages, clavier et manette |
| DustBound | `/play/dustbound/` | Course, commandes tactiles et éditeur de piste |
| 2048 | `/play/2048/` | Puzzle, sauvegarde automatique, record, clavier, tactile et manette |
| HexGL | `/play/hexgl/` | Course Cityscape, qualité réglable, clavier, tactile et manette |

Le bouton Jouer ouvre les six jeux dans LOSG par défaut. La barre commune conserve **Retour à LOSG**, le plein écran et l’ouverture dans un onglet. **Maj + Échap** revient à LOSG même depuis le document du jeu ; Échap seul reste disponible pour le jeu lorsqu’il a le focus. Les pages ouvertes seules proposent aussi un lien de retour.

### Overlay système à la manette

Pendant un jeu dans LOSG, maintenez **LB + RB + LT + RT** (ou **L1 + R1 + L2 + R2**) pendant 400 ms pour ouvrir ou refermer le menu. Le raccourci nécessite les quatre boutons sur la même manette, puis leur relâchement avant un nouvel appui. **F1** et le bouton **Menu LOSG** de la barre donnent le même accès, y compris depuis les six jeux embarqués. Le bouton Guide / Xbox / PS est laissé au système, et Options / Menu aux menus propres des jeux.

Le menu propose **Reprendre le jeu**, **Basculer le plein écran** et **Quitter vers l’accueil LOSG**. Arcline, Snake et DustBound suspendent leur boucle Phaser et leurs sons actifs ; Fouria suspend son IA et les interactions en solo. Une partie Fouria en ligne continue. La reprise attend le relâchement des boutons et le retour des sticks au neutre pour éviter une commande involontaire. La navigation attend aussi le neutre lors d’un montage, d’une reconnexion et du retour du focus.

La [Gamepad API standard](https://w3c.github.io/gamepad/#remapping) expose uniquement les entrées transmises par le navigateur et le pilote. Une page web ne peut pas neutraliser le bouton système ni les raccourcis d’un logiciel externe. Si Steam transforme les entrées en clics ou touches clavier, choisir un profil de manette standard pour le navigateur ; voir la [documentation Steam Input](https://partner.steamgames.com/doc/features/steam_controller/getting_started_for_players). LOSG ne modifie aucun réglage Windows ou Steam.

### Manettes et joueurs

La page Paramètres regroupe Affichage, Lancement des jeux et Navigation à la manette. Les appareils connectés, les joueurs par jeu et l’aide à la connexion sont séparés dans une colonne dédiée sur ordinateur, puis placés sous les réglages sur mobile. Le fond reste uni pour préserver la lisibilité.

Le **stick droit** fait défiler les pages LOSG verticalement, avec une zone neutre et une vitesse progressive. La croix et le stick gauche déplacent le focus et gardent l’option sélectionnée à l’écran ; haut/bas continuent de faire défiler la page lorsqu’il n’y a plus d’option dans cette direction. Les sections dépliables se commandent avec A / Croix. La perte de focus, la reconnexion et la fermeture d’un jeu imposent un retour des commandes au neutre avant la reprise du scroll. Le scroll LOSG est désactivé pendant un jeu intégré.

Le compteur de la barre supérieure ouvre les paramètres, où chaque appareil connecté affiche son **nom fourni par le navigateur**, son **type déduit de ce nom**, et son **numéro de joueur** (port Gamepad + 1). Les numéros ne sont pas compactés lorsqu’une autre manette est débranchée. Un pilote virtuel peut annoncer Xbox même si le matériel physique est différent. Les manettes sans mapping standard restent visibles avec un avertissement ; leurs boutons ne sont pas interprétés arbitrairement.

| Jeu | Commandes manette |
| --- | --- |
| Arcline | Croix ou stick : haut/bas pour l’angle, gauche/droite pour la puissance ; bouton inférieur A / Croix : tirer. Options / Menu ouvre les réglages, B / Rond les ferme. Les menus et la revanche sont navigables avec un contour de focus. |
| Fouria | Gauche/droite : colonne, A / Croix : jouer, haut/bas : autres contrôles, B / Rond : retour. Menus navigables. Une seule manette se partage ; avec deux manettes, la première contrôle les rouges et la seconde les bleus, chacune à son tour. Les ports correspondants sont affichés près des joueurs. Clavier et souris restent disponibles aux deux joueurs. |
| LUMA Snake | Croix / stick : direction, A / Croix : valider ou rejouer, B / Rond : retour. Les réglages et skins conservent leur navigation manette. |
| DustBound | RT / R2 : accélérer, LT / L2 : reculer, stick gauche horizontal : incliner ; la croix offre aussi accélération/recul et inclinaison. X / Carré : recommencer. L’éditeur de piste conserve ses outils souris et clavier. |
| 2048 | Croix / stick : déplacer les tuiles ; LB / L1 : nouvelle partie ; A / Croix : continuer après une victoire ou rejouer après une défaite. Options / Menu : menu LOSG. |
| HexGL | RT / R2 ou A / Croix : accélérer ; stick / croix : diriger ; LB / RB : aérofreins ; LT / L2 : freiner ; X / Carré : recommencer. Menus navigables et Options / Menu : menu LOSG. |

Arcline, Snake et DustBound utilisent la première manette standard connectée pour leur partie solo. Fouria utilise les deux premiers ports standard pour le mode local et accepte une manette en solo / en ligne. La détection fonctionne via localhost ou HTTPS ; appuyer sur un bouton peut être nécessaire pour autoriser l’exposition de la manette au site. Les commandes sont couvertes par des états simulés ; une validation physique sur les manettes ciblées reste nécessaire.

Les menus propres à chaque jeu sont conservés. Les documents séparés évitent les conflits de styles et de raccourcis. Fermer le lecteur détruit le document du jeu, ses sons et sa connexion ; rouvrir lance une nouvelle session. Les sauvegardes et préférences existantes restent dans le stockage local du navigateur.

`npm run dev` et `npm run preview` démarrent aussi le serveur de Fouria. Le navigateur utilise `/play/fouria/ws`, relayé vers le port 3009 par défaut. `FOURIA_PORT` permet de changer ce port depuis `.env` ou une variable d’environnement ; la variable d’environnement est prioritaire. `npm start` sert le build complet et les WebSockets sur un seul port (`PORT`, défaut 3000 ; `HOST`, défaut `0.0.0.0`). Un reverse proxy de production doit transmettre les mises à niveau WebSocket sur `/play/fouria/ws`.

Pour un hébergement purement statique, publier `dist/` en conservant les sous-dossiers et leurs `index.html` : les six jeux restent jouables en solo/local, mais les salles en ligne de Fouria nécessitent le serveur. Aucun serveur SSO Arcline n’est requis pour son mode solo actuel. CT PASIMAL reste un lien vers son service existant. Harmonix est retiré du catalogue actif pour le moment ; ses illustrations sont conservées pour une future réintégration.

## Changements de V0.2.0

- Accueil illustré par jeu, décodage avant affichage et fondu entre deux fonds. Les réponses d’images obsolètes sont ignorées lors d’une sélection rapide.
- Jaquettes locales avec tailles réservées, chargement différé et fallback coloré avec nom du jeu si le fichier manque ou échoue.
- Titre et bouton Jouer prioritaires, sélection indiquée par contour, coche et texte. Palette et signature SPX discrètes ; aucun fond SPX permanent ni animation continue.
- Navigation supérieure Accueil / Bibliothèque / Paramètres conservée. Grille adaptative, défilement horizontal des jaquettes et page défilable sur petits écrans / faible hauteur. Ajustements pour 16:9 et 21:9.
- Focus visible, lien d’évitement, commandes natives au clavier, préférences de réduction des animations respectées en CSS et pour le défilement programmatique.
- Navigation Gamepad API sans nouvelle dépendance. Boucle arrêtée sans manette standard, dans un onglet masqué, pendant un jeu intégré et au démontage.
- Préférences V0.1 conservées sous la même clé `luma-gaming-prefs`, données invalides ignorées, stockage indisponible toléré.
- URL HTTP(S) ou relatives validées ; erreurs de fenêtre bloquée et de plein écran affichées. Lecteur intégré avec dialogue natif, focus initial sur Fermer et restitution du focus après fermeture.

## Utilisation

### Démarrage

Le HTML affiche immédiatement le logo LUMA et un message de chargement, avant l’exécution de React. Une fois React chargé, les trois barres cyan, violet et rose s’animent et un indicateur indéterminé accompagne le décodage du premier arrière-plan. Aucun faux pourcentage n’est affiché.

Le démarrage animé dure au minimum 1,1 seconde, puis disparaît par un fondu de 280 ms. Un délai de sécurité de 4 secondes après montage libère l’accueil même si l’image reste en attente. Le bouton Passer, Échap ou A/B sur une manette standard permettent de passer immédiatement. L’interface derrière le loader reste inaccessible au focus pendant le chargement ; le focus revient au contenu si le bouton Passer avait le focus.

Le réglage Animations et `prefers-reduced-motion` désactivent la chorégraphie et son délai minimum ; seul le chargement réel subsiste, toujours borné. La séquence ne se rejoue pas en naviguant entre les écrans. Elle revient lors d’un rechargement complet de la page. Aucun son ni dépendance supplémentaire. Le cas JavaScript désactivé affiche une explication.

Le cycle de vie est couvert par six tests à horloge simulée : ressource en cache, animations désactivées, attente excessive, passage manuel, démontage et changement de préférence pendant la séquence. L’animation et les parcours de focus restent à valider visuellement dans un navigateur ; les tests de timers ne remplacent pas cette vérification.

Dans les paramètres, le logo LUMA aux trois barres remplace le mot-symbole SPX et s’anime en boucle douce. La boucle s’arrête lorsque le logo sort de l’écran, lorsque l’onglet est masqué, ou si les animations sont désactivées dans LUMA ou par le système.

| Commande | Action |
| --- | --- |
| Souris | Cliquer une jaquette pour sélectionner, puis Jouer pour lancer. Dans la bibliothèque, cliquer un jeu ouvre sa fiche d’accueil. |
| Tab / Maj+Tab | Parcourir tous les contrôles, y compris réglages et lecteur. |
| Gauche / droite | Parcourir les jaquettes ou la navigation supérieure lorsqu’un élément du groupe a le focus. Depuis le fond de l’accueil, changer de jeu. |
| Haut / bas | Parcourir les lignes de la grille de bibliothèque. |
| Début / Fin | Premier / dernier élément du groupe de jaquettes ou de navigation. |
| Entrée | Jouer sur une jaquette de l’accueil ; valider les autres boutons. |
| Espace | Activer les boutons / interrupteurs natifs. |
| Échap | Ouvrir le menu LOSG depuis la barre du lecteur ; fermer le menu lorsqu’il est ouvert. Dans le jeu, conserver la commande propre au jeu. |
| Manette standard | Stick gauche ou croix : déplacer le focus ; A (bouton inférieur) : valider / jouer ; B (bouton droit) : accueil ; LB / RB : changer d’écran. A sur le choix du lancement fait défiler ses options. |

La manette doit être exposée par le navigateur : ouvrir LUMA via localhost ou HTTPS, puis appuyer sur un bouton. Les manettes sans mapping `standard` sont affichées dans les paramètres mais ne pilotent pas les jeux. Les fenêtres lancées depuis une manette peuvent être bloquées par le navigateur faute de geste souris/clavier ; dans ce cas, utiliser le bouton Jouer à la souris ou Entrée. Les jeux intégrés gèrent leurs commandes ; seul le raccourci à quatre boutons d’épaule ouvre le menu LOSG.

## Catalogue Bissiking

Le catalogue reste dans `src/config/games.ts`. Il contient six jeux embarqués et un service externe conservé :

| Application | Dépôt examiné | Site |
| --- | --- | --- |
| Arcline | `GAMES/arcline` | `/play/arcline/` |
| Fouria | `GAMES/Fouria` | `/play/fouria/` |
| CT PASIMAL | [Bissiking/ct_pasimal](https://github.com/Bissiking/ct_pasimal) | https://ctpasimal.mhemery.fr/ |
| LUMA Snake | `GAMES/snake` | `/play/snake/` |
| DustBound | `GAMES/DustBound` | `/play/dustbound/` |
| 2048 | `GAMES/2048` | `/play/2048/` |
| HexGL | `GAMES/HexGL` | `/play/hexgl/` |

L’analyse historique des sites externes et les sources graphiques figurent dans [docs/catalogue-research.md](docs/catalogue-research.md). L’intégration actuelle utilise les sources locales. Les adaptations de Fouria concernent l’adresse et le cycle de vie WebSocket, ainsi que le service du build LOSG. Les services externes conservent leur lancement en nouvel onglet ; LOSG n’intègre pas leur SSO.

Harmonix est temporairement absent du catalogue. Le support des applications musicales reste disponible pour une réintégration ultérieure.

Pour ajouter ou ajuster une entrée :

```ts
{
  id: 'mon-jeu', // unique et stable
  name: 'Mon jeu',
  description: 'Courte description.',
  kind: 'game', // facultatif ; 'music' pour une application musicale
  cover: '/games/mon-jeu-cover.jpg',
  background: '/games/mon-jeu-bg.jpg',
  url: 'https://votre-domaine.test/jeu', // ou un chemin local
  launchMode: 'embed', // ou 'newTab'
  accent: '#9B30FF',
  demo: false,
}
```

Placer les fichiers dans `public/games/`. `cover` et `background` sont facultatifs et indépendants ; un échec de fond conserve le dégradé de secours. Une liste vide affiche un état explicatif. Pas de limite à quatre entrées. Les chemins `/games/...` supposent un hébergement à la racine ; adapter les chemins et `base` Vite pour une publication sous un préfixe.

Les dix JPEG pèsent environ 0,8 Mo au total : jaquettes 1280 × 720 et fonds 1920 × 1080, affichés en 16:9. DustBound utilise une capture officielle recadrée ; Harmonix reprend son H officiel inchangé. Faute de ressources raster pour Arcline, CT PASIMAL et Snake, leurs illustrations ont été générées avec ImageGen selon les palettes et formes réellement trouvées. Les fonds sont décodés avant le fondu, les jaquettes sont chargées progressivement et les fallbacks restent disponibles. Aucun appel externe pour les images. Les détails, limites de résolution et prompts sont dans [public/games/ARTWORK.md](public/games/ARTWORK.md).

## Modes de lancement et limites

`embed` ouvre une iframe ; `newTab` ouvre un onglet isolé de son opener. Les préférences permettent de suivre le catalogue ou de forcer l’un des modes. Une URL vide, invalide ou d’un protocole autre que HTTP(S) déclenche un message.

Un navigateur peut déclencher `iframe.onload` même si un site refuse l’intégration : cet événement n’est pas considéré comme la preuve que le jeu fonctionne. Une aide et le bouton Nouvel onglet restent disponibles, avec une indication supplémentaire après huit secondes sans chargement. Les blocages `X-Frame-Options`, CSP, réseau et contenus mixtes ne peuvent pas tous être détectés depuis LUMA.

Quand le focus est dans un jeu tiers, ses événements clavier ne remontent pas nécessairement à LUMA : revenir avec Maj+Tab vers la barre du lecteur et Fermer si Échap est intercepté. Le jeu peut aussi disposer de son propre plein écran.

## Architecture conservée

```text
src/
  main.tsx                point d’entrée React / StrictMode
  App.tsx                 trois écrans, sélection, navigation et lancement
  styles.css              thème, états et responsive
  config/games.ts         catalogue configurable
  hooks/usePrefs.ts       préférences locales compatibles V0.1
  hooks/useGamepad.ts     navigation standard et nettoyage des événements
  hooks/useSystemButton.ts raccourci système indépendant des commandes du jeu
  hooks/useStartup.ts     cycle de démarrage React et nettoyage des timers
  components/BootScreen.tsx  écran de chargement animé et bouton Passer
  components/GameArt.tsx  jaquettes, fallback et fonds en fondu
  components/Player.tsx   lecteur intégré et gestion du focus
  components/SystemMenu.tsx overlay système et navigation à la manette
  lib/launch.ts           validation des URL et ouverture d’onglet
  lib/startup.ts          séquence bornée, passage et réduction des animations
  lib/systemGamepad.ts    détection des appuis système sans répétition
public/boot.css           styles du loader initial et React
public/games/             images locales optimisées et provenance
play/                    six pages HTML, entrées de jeu et liaison avec le lecteur
play/pause.ts            suspension et reprise des moteurs Phaser et sons actifs
GAMES/                   sources des six jeux ; archives originales non publiées
scripts/arcline-assets.ts musique Arcline en développement et dans le build
scripts/dev.mjs          démarrage de Vite et du serveur Fouria
scripts/serve.ts         serveur de production LOSG + Fouria
tsconfig.games.json      vérification des jeux et de leur intégration
vitest.games.config.ts   tests existants des moteurs
docs/catalogue-research.md analyse des cinq dépôts, sources et limites
scripts/prepare-catalogue-art.ps1  export déterministe des visuels sous Windows
tests/core.test.mjs       tests Node sur les modules TypeScript chargés par Vite
tests/integration/       service HTTP du build et partie Fouria à deux clients WebSocket
```

Les chemins sont indiqués en tête des fichiers source lorsque leur syntaxe le permet. Le doctype HTML reste en première ligne pour conserver le mode standards ; le commentaire de chemin le suit. Les fichiers JSON restent du JSON valide, sans commentaire.

## Vérifications et éléments restant à valider

Exécutés pendant cette livraison :

- Compilation TypeScript stricte et build Vite 6.4.5 : réussis.
- Tests LOSG : 27 cas réussis, dont maintien et relâchement du raccourci, séparation des manettes, noms et types, ports absents, affectation des tours Fouria, gâchettes analogiques DustBound, bornes de visée Arcline, pause, démarrage, URL, préférences et retrait de Harmonix.
- Tests des moteurs : 99 cas Fouria et Arcline réussis, dont 8 régressions sur les tirs miroir de l’IA : fin de vol au sol, limites réelles du monde et direction du vent.
- Tests d’intégration : quatre cas réussis sur les pages et bundles de production, les quatre musiques Arcline inchangées, les erreurs HTTP et une salle Fouria à deux clients (victoire, revanche, déconnexion).
- Installation commune à la racine ; aucune installation des anciens projets n’est nécessaire.
- `npm audit` après mise à jour : zéro vulnérabilité signalée au moment de la vérification.
- Détecteur mécanique Impeccable sur les fichiers UI modifiés : aucun signalement. Fouria reçoit deux visuels SVG géométriques locaux, détaillés dans `public/games/ARTWORK.md`.
- Versions du manifeste et du lockfile conservées en 0.2.0.
- Prévisualisation de production lancée avec Vite et le serveur Fouria. Le serveur de production est aussi testé automatiquement ; les sources et archives de `GAMES/` ne sont pas copiées dans `dist/`.

Restent non testés : rendu et interactions dans un navigateur, résolutions 16:9 / 21:9 et mobile, lecteur d’écran, manette physique, plein écran, rendu Phaser et lecture audio réelle. L’outil de contrôle de Chrome a interrompu la vérification car il ne pouvait pas identifier l’URL active avec suffisamment de fiabilité. Aucun test navigateur réussi n’est revendiqué. Le parcours connecté CT PASIMAL reste externe. Le chunk Phaser partagé dépasse 500 ko (environ 340 ko gzip), chargé à la demande en ouvrant un jeu Phaser.
