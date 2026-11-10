---
version: 1
slug: "src-main-ts"
primary_target: "src/main.ts"
related_targets: ["index.html","src/style.css"]
---

# Surface brief — Jeu principal

## Scope et mode

Surface unique `src/main.ts`, mode Experience. La scène de jeu est l'interface principale et doit rester immédiatement jouable sans écran intermédiaire.

## Audience et tâche

Public de présentation et testeurs internes. L'utilisateur doit comprendre les commandes, démarrer, piloter, sauter, corriger l'assiette, atteindre l'arrivée et recommencer.

## Direction choisie

« Baja nocturne », composition « Focus physique » approuvée dans `.impeccable/mocks/baja-physics-focus.png`. Le véhicule occupe le tiers gauche, le terrain révèle l'obstacle suivant, le chrono est centré et les commandes mobiles libèrent le centre.

## Inventaire de fidélité

| Élément visible | Engagement | Médium livré |
| --- | --- | --- |
| Buggy corail à deux roues | Point focal, grand et contrasté | Phaser Graphics + corps Matter.js |
| Suspensions visibles | Deux ressorts qui suivent les contraintes | Phaser Graphics interactif |
| Terrain ocre vallonné | Profil continu, bosses et rampes | Données TypeScript + Phaser Graphics + corps Matter.js |
| Mésas nocturnes | Profondeur sans distraire du véhicule | Couches vectorielles à parallaxe |
| Chrono central | Plus grand élément typographique | HTML sémantique + Bebas Neue embarquée |
| Progression cyan | État continu vers l'arrivée | HTML/CSS alimenté par la position physique |
| Restart | Toujours visible, clavier et tactile | Bouton HTML accessible |
| Commandes mobiles | Quatre grandes cibles dans les coins | Boutons HTML + Pointer Events |

## Contraintes

Pas de raster décoratif dans le produit livré, pas de backend, pas d'écran de chargement obligatoire. L'interface doit rester lisible sur desktop et mobile paysage.
