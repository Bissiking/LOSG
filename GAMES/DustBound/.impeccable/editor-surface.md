# Surface brief — Éditeur de piste

## Scope et mode

Surface `src/game/EditorScene.ts`, mode Operate. L’éditeur manipule la structure locale du niveau sans backend et relance la scène de jeu pour le test.

## Audience et tâche

Créateur ou testeur interne. Il doit repérer immédiatement le terrain et les plateformes, déplacer un élément directement, affiner ses coordonnées, annuler, sauvegarder, tester et échanger le niveau en JSON.

## Direction

Le monde « Baja nocturne » devient une table de préparation de spéciale : grille cyan discrète, terrain ocre, poignées crème, sélection corail et outils compacts. Le canvas reste l’espace principal ; la toolbar et l’inspecteur ne doivent jamais le recouvrir entièrement.

## États essentiels

La présence de modifications non sauvegardées, l’absence d’historique, la sélection courante, la réussite ou l’échec d’un import et la confirmation de sortie doivent toujours être explicites. Le départ et l’arrivée utilisent une forme et un libellé distincts en plus de leur couleur.

## Responsive

Sur écran étroit, la toolbar se replie sans action cachée et l’inspecteur devient un rail droit limité à 260px et 58vh. La caméra réduit son zoom pour conserver le terrain et ses poignées dans la zone manipulable.
