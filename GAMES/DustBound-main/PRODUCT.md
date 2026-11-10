# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Phaser 3, TypeScript, Matter.js et Vite, imposés par le brief. Le projet reste entièrement local au navigateur, sans service distant.

## Users

La démo vise à la fois un public de présentation qui doit comprendre et jouer immédiatement, et une équipe interne qui doit pouvoir évaluer rapidement la physique, la stabilité et l'extensibilité du prototype sur ordinateur comme sur mobile.

## Product Purpose

DustBound est une démo technique jouable de buggy arcade sur terrain vallonné. Sa réussite se mesure à une prise en main immédiate, une conduite agréable, des suspensions visibles, des sauts contrôlables et une partie complète du départ à l'arrivée avec chronomètre et respawn fiable.

## Positioning

Le cœur du produit est un véhicule Matter.js réellement composé d'un châssis, de deux roues et de contraintes de suspension, réglé pour une sensation arcade lisible plutôt qu'une simulation stricte.

## Operating Context

Le jeu se lance avec `npm install` puis `npm run dev`, se joue au clavier sur ordinateur et avec des commandes tactiles responsives sur mobile. Une partie courte sert autant de démonstration publique que de banc d'essai interne.

## Capabilities and Constraints

- Terrain modulaire décrit par des données, avec collines, bosses, sauts et plateformes.
- Accélération, frein et marche arrière, contrôle de rotation en l'air, caméra suiveuse, checkpoint de départ, arrivée, chronomètre, restart, détection de retournement et respawn.
- Éditeur de niveau local avec déplacement du terrain, des plateformes, du départ et de l’arrivée, sauvegarde navigateur et échange JSON.
- Architecture extensible vers plusieurs niveaux, véhicules et collectibles, sans implémenter ces autres fonctionnalités futures.
- Aucun backend, compte, authentification, multijoueur, classement, boutique, inventaire ni économie.
- Assets simples et formes primitives acceptés pour cette première version.

## Brand Commitments

Le nom est DustBound. Le ton est celui d'un jeu arcade moderne : direct, énergique, lisible, avec un buggy qui reste bien identifiable sur un terrain contrasté.

## Evidence on Hand

Le dépôt ne contient aucun asset ni prototype existant. Le brief fonctionnel fourni est la seule source de vérité ; aucune performance ou compatibilité non testée ne doit être revendiquée.

## Product Principles

- La sensation de conduite prime sur le réalisme strict.
- Une action doit être comprise et déclenchée en quelques secondes.
- Le respawn et le restart doivent toujours rendre le contrôle proprement.
- Les données de niveau restent séparées de leur rendu et de leur physique.
- La même boucle de jeu doit rester lisible et jouable sur ordinateur et mobile.

## Accessibility & Inclusion

Les contrôles doivent fonctionner au clavier sans imposer une disposition QWERTY, proposer de grandes cibles tactiles, conserver un contraste élevé et ne pas dépendre uniquement de la couleur pour communiquer les états essentiels.
