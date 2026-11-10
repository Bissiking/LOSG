# 2048 et HexGL dans LOSG

Attributions : **2048 — © 2014 Gabriele Cirulli**, [dépôt original](https://github.com/gabrielecirulli/2048) ; **HexGL — © 2015 Thibaut Despoulain (BKcore)**, [dépôt original](https://github.com/BKcore/HexGL). Les fiches du catalogue et le lecteur affichent ces auteurs avec les liens source et licence. Les copies complètes et inchangées des notices sont disponibles dans le build à `/play/2048/LICENSE.txt` et `/play/hexgl/LICENSE.txt`. Pour HexGL, le libellé « licence du dépôt : MIT » conserve la distinction avec les mentions spécifiques présentes dans certains fichiers.

Les sources restent dans `GAMES/2048` et `GAMES/HexGL`. Les anciennes pages de démonstration ne sont pas utilisées : les pages `play/2048` et `play/hexgl` fournissent les entrées LOSG, les menus en français, les crédits et les commandes standard. Aucun compte ni serveur de jeu supplémentaire n’est nécessaire. HexGL nécessite WebGL et affiche une explication lorsqu’il n’est pas disponible.

`play/legacy-scripts.ts` charge les scripts classiques dans leur ordre d’origine, dans le document isolé de chaque jeu. Le plugin `scripts/legacy-assets.ts` sert et exporte les scripts, modèles JSON, textures, sons et licences nécessaires. Les archives, sources CoffeeScript et anciens lanceurs ne sont pas publiés. Les requêtes sont limitées à une liste de fichiers ; aucun chemin fourni par le navigateur n’est joint directement au disque.

2048 conserve ses règles et son moteur de sauvegarde. L’adaptateur utilise les clés `losg-2048-state` et `losg-2048-best`, pour éviter les collisions avec les autres jeux. La manette contrôle les mêmes événements que le clavier et les gestes tactiles. Le stockage indisponible conserve le mécanisme de sauvegarde en mémoire du jeu original. Le menu LOSG bloque aussi les événements natifs clavier, souris et tactiles.

HexGL conserve Three.js, la physique, le circuit et les ressources du jeu fourni. Le contrôleur ancien est remplacé au chargement par un adaptateur Gamepad standard : direction analogique, gâchettes, aérofreins et redémarrage par appui. Le clavier et les boutons tactiles restent utilisables. Le choix de qualité conserve les textures normales et haute résolution.

`play/hexgl/runtime.ts` gère la boucle de rendu. La pause LOSG annule la frame suivante, relâche les commandes et suspend l’AudioContext. La reprise décale les références du chronomètre pour exclure le temps passé dans le menu, puis réinitialise l’horloge du rendu. Un circuit qui finit de charger derrière le menu reste suspendu. Le redimensionnement ajuste les caméras, le rendu et le HUD, notamment pour le plein écran.

Les nouveaux dossiers des autres jeux sont `GAMES/arcline`, `GAMES/Fouria`, `GAMES/DustBound` et `GAMES/snake`. Les URL `/play/.../`, identifiants du catalogue et clés de sauvegarde de ces jeux restent identiques.

Vérifications : `npm test`, `npm run test:games`, `npm run build`, puis `npm run test:integration`. Les tests de commandes utilisent des manettes simulées ; le matériel physique reste à vérifier. Les adaptations et tests utilisent les fichiers locaux, sans téléchargement de nouvelles dépendances.
