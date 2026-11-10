---
name: DustBound
description: Interface de course arcade Baja nocturne, lisible et centrée sur la physique du buggy.
colors:
  night: "#061a27"
  night-soft: "#0b2b3b"
  ink: "#031018"
  cream: "#f5e4bd"
  coral: "#ed674b"
  coral-deep: "#9e382f"
  cyan: "#28d7dd"
  mesa-far: "#0a3041"
  mesa-near: "#124253"
  platform: "#102f3d"
  earth: "#9f542e"
  earth-ridge: "#d68945"
  earth-highlight: "#f0b65e"
  tire: "#02080d"
typography:
  display:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "0.035em"
  title:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.05em"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  keycap: "5px"
  vehicle: "10px"
  panel: "12px"
  round: "50%"
spacing:
  xs: "8px"
  sm: "10px"
  md: "12px"
  lg: "18px"
  xl: "20px"
components:
  restart-button:
    backgroundColor: "rgb(6 26 39 / 88%)"
    textColor: "{colors.cream}"
    typography: "{typography.title}"
    rounded: "{rounded.panel}"
    padding: "8px 10px"
    height: "48px"
  restart-button-hover:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  touch-control:
    backgroundColor: "rgb(3 16 24 / 78%)"
    textColor: "{colors.cream}"
    rounded: "{rounded.round}"
    size: "clamp(64px, 11vw, 88px)"
  touch-control-active:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  status-message:
    textColor: "{colors.cream}"
    typography: "{typography.display}"
    width: "min(88vw, 560px)"
---

# Design System: DustBound

## Overview

**Creative North Star: "Baja nocturne"**

DustBound transpose une course tout-terrain sous un ciel pétrole : une signalétique de rallye mate, franche et compacte se superpose à une scène vectorielle où le buggy corail et ses suspensions restent les protagonistes. L’interface sert la sensation de conduite et s’efface du centre de l’image, sans encadrer le jeu dans du chrome générique.

La composition « Focus physique » maintient le véhicule dans le tiers gauche, révèle l’obstacle suivant et donne au chrono central la priorité typographique. La profondeur vient des mésas en parallaxe, du terrain ocre stratifié et de rares ombres fonctionnelles ; le cyan sert de jalon de progression, jamais de décoration diffuse.

**Key Characteristics:**

- Palette pétrole, ocre, corail, cyan et crème à contraste élevé.
- Surface mate inspirée de la signalétique rallye Baja.
- Profondeur vectorielle par parallaxe, sans décor raster.
- Chrono central dominant et données de course immédiatement lisibles.
- Contrôles tactiles robustes, séparés dans les coins et libérant le centre.

## Colors

La nuit pétrole forme un écrin dense ; l’ocre construit le terrain, le corail porte l’action, le cyan balise la route et la crème assure la lecture.

### Primary

- **Corail buggy** : point focal du véhicule, état actif des commandes et survol du restart.
- **Corail profond** : volume secondaire du châssis, réservé aux plans internes et aux contrastes mécaniques.

### Secondary

- **Cyan balise** : progression, checkpoints, focus clavier, détails du buggy et arêtes de plateformes.

### Tertiary

- **Ocre terre**, **ocre crête** et **ocre lumière** : trois niveaux indissociables du profil du terrain, du massif à la ligne de contact.

### Neutral

- **Nuit pétrole** : fond principal du jeu et ancrage des marqueurs.
- **Nuit pétrole douce**, **mésa lointaine**, **mésa proche** et **plateforme minérale** : couches successives de profondeur.
- **Crème poussière** : texte principal, contours mécaniques et repères à forte lisibilité.
- **Encre** et **gomme** : contraste le plus sombre pour états actifs, contours et roues.

### Named Rules

**The Signal Rule.** Le corail indique le véhicule ou une action immédiate ; le cyan indique une direction, une progression ou un focus.

**The Dust Line Rule.** Le terrain conserve ses trois ocres superposés afin que le relief physique reste lisible à toute vitesse.

## Typography

**Display Font:** Bebas Neue (avec sans-serif de secours)  
**Body Font:** ui-sans-serif / system-ui (avec sans-serif de secours)

**Character:** Bebas Neue donne au chrono, au nom et aux messages la voix condensée d’un panneau de spéciale. Le système natif reste réservé aux instructions et micro-libellés, où la lecture rapide prime.

### Hierarchy

- **Display** (400, 4.5rem, 0.8) : chrono tabulaire et messages de course ; descend à 3.25rem sur petit écran.
- **Title** (400, 2rem, 0.9) : nom DustBound et actions condensées ; le nom descend à 1.45rem sur petit écran.
- **Body** (poids et interligne natifs, 0.82rem) : consigne d’orientation et informations auxiliaires.
- **Label** (700, 0.68rem, 0.14em) : checkpoint et progression, en capitales fortement espacées.

### Named Rules

**The Chrono First Rule.** Le chrono reste le plus grand élément typographique fixe et utilise toujours des chiffres tabulaires.

## Layout

La scène remplit intégralement le viewport. Le HUD flotte au-dessus du canvas dans une grille à trois colonnes : marque à gauche, chrono au centre, restart à droite, avec des marges qui absorbent les safe areas. Le contenu central reste dégagé pour le buggy et le terrain.

À 720px et moins, le chrono occupe la première ligne complète tandis que marque et restart partagent la seconde. Sur pointeur grossier, deux grappes de commandes se placent dans les coins inférieurs : conduite à gauche, assiette à droite. En portrait tactile, elles remontent au-dessus de la consigne de rotation. Le rythme récurrent est serré, de 8 à 20px, et les cibles de conduite mesurent de 64 à 88px ; celles d’assiette, de 56 à 72px.

**The Clear Center Rule.** Aucun contrôle permanent ne doit occuper la trajectoire visuelle entre le buggy et l’obstacle suivant.

## Elevation & Depth

La profondeur est d’abord structurelle : étoiles presque fixes, mésa lointaine, mésa proche, terrain puis véhicule se déplacent avec des facteurs de parallaxe distincts. Les ombres HTML restent rares et servent uniquement à détacher le HUD interactif du canvas animé.

### Shadow Vocabulary

- **HUD text** (`0 3px 12px rgb(0 0 0 / 55%)`) : protège les informations fixes sur un décor mouvant.
- **Control lift** (`0 8px 24px rgb(0 0 0 / 28%)`) : détache le restart sans le rendre brillant.
- **Touch lift** (`0 8px 28px rgb(0 0 0 / 32%)`) : renforce les grandes cibles tactiles.
- **Message depth** (`0 6px 18px rgb(0 0 0 / 70%)`) : garantit la lecture des événements au centre.

**The Matte Rally Rule.** Les surfaces restent opaques ou légèrement translucides et mates ; aucune brillance, aucun verre et aucun halo décoratif.

## Shapes

Le système oppose des silhouettes mécaniques franches à quelques formes arrondies fonctionnelles. Le buggy emploie un rectangle adouci et des triangles de structure ; les jalons et la marque utilisent le losange ; les roues et commandes tactiles sont circulaires. Les panneaux utilitaires adoptent un rayon contenu de 12px et les keycaps un rayon de 5px. Les traits épais, les arêtes de piste et les contours à fort contraste rappellent la peinture de signalétique plutôt qu’une carte d’application.

## Components

### Restart Button

- **Shape:** panneau compact à coins doucement arrondis, haut d’au moins 48px sur desktop et 42px sur petit écran.
- **Default:** fond nuit translucide, bordure et texte crème, icône de retour, libellé condensé et rappel clavier visible sur pointeur précis.
- **Hover / Focus:** le survol bascule en corail avec encre sombre ; le focus visible reçoit un contour cyan externe de 3px.

### Route Progress

- **Style:** rail cyan atténué de 3px, remplissage cyan et marqueur losange crème sur fond nuit.
- **Behavior:** largeur du remplissage et position du marqueur suivent continûment la position physique du buggy.

### Status Message

- **Style:** titre Bebas Neue centré, crème, très grand ; détail système cyan en capitales espacées.
- **Behavior:** apparition courte par fondu et translation verticale, supprimée lorsque la réduction de mouvement est demandée.

### Touch Controls

- **Shape:** cibles circulaires de grande taille ; les commandes d’assiette sont volontairement plus petites que celles de conduite.
- **Default:** fond encre translucide, contour crème ; l’accélérateur porte déjà un contour corail pour rendre l’action primaire évidente.
- **Active / Focus:** pression corail, contenu encre et réduction à 94 % ; focus clavier cyan externe. Les icônes seules sont doublées par des libellés accessibles.

### Orientation Notice

- **Style:** panneau nuit douce, texte crème centré et coins de 12px.
- **Behavior:** visible uniquement en portrait sur appareil tactile, placé au-dessus de la safe area inférieure.

### Rally Markers

- **Style:** portiques cyan, libellés condensés sombres et motif de flèche découpé dans la traverse.
- **Behavior:** START et FINISH appartiennent au monde du jeu et restent alignés avec le terrain, pas avec le viewport.

## Do's and Don'ts

### Do:

- **Do** préserver le chrono au centre et le buggy dans le tiers gauche de la composition.
- **Do** réserver le corail à l’action et le cyan au guidage, à la progression et au focus.
- **Do** garder les contrôles tactiles dans les coins, avec des cibles robustes et des états actifs non ambigus.
- **Do** construire la profondeur avec les couches vectorielles et leurs facteurs de parallaxe.

### Don't:

- **Don't** enfermer la scène dans des cartes, panneaux ou barres de navigation d’application.
- **Don't** ajouter de décor raster, de verre, de dégradés brillants ou de halos décoratifs.
- **Don't** réduire la lisibilité des états essentiels à un changement de couleur seul.
- **Don't** placer de contrôle permanent au centre de la trajectoire visuelle.
