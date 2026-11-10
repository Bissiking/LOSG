---
name: SHIFTBREAK
description: Géométrie lisible et inversion immédiate pour un parcours de gravité.
colors:
  ink: "#0d191e"
  paper: "#eef0df"
  mint: "#7ee0d1"
  muted: "#b1c2be"
  line: "#34484d"
  rail: "#c7d1c7"
  danger: "#ff846b"
  temporary: "#edce7a"
  track-muted: "#40565b"
  button-hover: "#243a40"
  primary-hover: "#a9eee3"
  field: "#192c32"
  field-border: "#637c7d"
  experimental: "#ffb49a"
typography:
  display:
    fontFamily: "Exo 2, sans-serif"
    fontSize: "clamp(56px, 6.6vw, 90px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Exo 2, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 44px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  button:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 600
  measurement:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "21px"
    fontWeight: 400
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
  key:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
rounded:
  control: "6px"
  field: "5px"
  tag: "3px"
spacing:
  compact: "8px"
  control: "12px"
  mobile-gutter: "16px"
  mobile-panel: "24px"
  panel-block: "28px"
  wide-panel-inline: "48px"
components:
  button-primary:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.button-hover}"
  select:
    backgroundColor: "{colors.field}"
    textColor: "{colors.paper}"
    rounded: "{rounded.field}"
    padding: "8px 12px"
  version-tag:
    textColor: "{colors.mint}"
    typography: "{typography.key}"
    rounded: "{rounded.tag}"
    padding: "5px 7px"
  gravity-indicator:
    textColor: "{colors.mint}"
    padding: "6px 0"
  measurement:
    textColor: "{colors.paper}"
    typography: "{typography.measurement}"
  progress:
    backgroundColor: "{colors.line}"
    height: "4px"
    width: "100%"
---

# Design System: SHIFTBREAK

## Overview

**Creative North Star: "Le rail vivant"**

Une piste géométrique sur fond d’encre, où chaque signe explique une action ou un état. La silhouette fendue du joueur et les rails forment l’identité du jeu ; la typographie structure les commandes sans concurrencer la lecture du parcours. L’interface française est directe, calme et compacte.

Le jeu privilégie l’expérience pendant la course et la manipulation explicite dans les panneaux. Le parcours reste visible à côté du menu sur grand écran ; pendant la partie, le panneau disparaît. L’univers est dessiné en Canvas 2D, sans illustration rapportée. Ce document décrit le prototype construit ; il ne définit ni nouveaux écrans ni fonctionnalités futures.

**Key Characteristics:**
- Une géométrie originale, avec une silhouette de joueur immédiatement identifiable.
- Une couleur liée à une fonction, renforcée par une forme, une trame ou un libellé.
- Une interface sobre autour du parcours, avec des mesures réelles et des commandes visibles.
- Des effets discrets qui accompagnent l’inversion sans masquer les obstacles.

## Colors

La palette associe un fond d’encre, des surfaces de piste pâles et trois signaux de jeu distincts. Les valeurs normatives sont celles du frontmatter ; les noms ci-dessous décrivent leur usage.

### Primary

- **Menthe active** (`mint`) : joueur vivant, gravité, action principale, progression et arrivée. Son éclaircissement (`primary-hover`) indique le survol de l’action principale.

### Secondary

- **Corail danger** (`danger`) : obstacles actifs, hachures des blocs et joueur après collision. Le ton plus doux (`experimental`) signale le caractère expérimental dans l’avertissement initial.

### Tertiary

- **Jaune temporaire** (`temporary`) : rails qui disparaissent et phase d’alerte des barrières synchronisées.

### Neutral

- **Encre profonde** (`ink`) : page, piste, panneaux et découpes de la silhouette.
- **Papier chaud** (`paper`) : texte principal et libellés importants.
- **Rail pâle** (`rail`) : plateformes stables, visuellement distinctes du texte.
- **Sauge grisée** (`muted`) : aide et explications secondaires.
- **Joint sombre** (`line`) : séparateurs, bord du parcours, commandes secondaires et piste de progression.
- **Repère de piste** (`track-muted`) : mesures de distance, trajectoires et barrières inactives.
- **Surface de commande** (`field`, `field-border`, `button-hover`) : champ de sélection et survol des boutons secondaires.

**The Signal Rule.** Chaque couleur de jeu garde son rôle ; les obstacles utilisent aussi hachures, pointillés ou mots pour communiquer leur état.

## Typography

**Display Font:** Exo 2, avec repli sans-serif. Les graisses chargées sont 600 et 800.

**Body Font:** Manrope, avec repli sans-serif. Les graisses chargées sont 400 et 600.

**Label/Mono Font:** JetBrains Mono, avec repli monospace, en graisse 400.

Exo 2 apporte une tension géométrique aux titres ; Manrope garde les explications et boutons lisibles. JetBrains Mono sert aux données mesurées, à la version et aux touches.

- **Display** : titre du menu en deux lignes, avec le point final menthe. Sur mobile, sa taille est fixe (64px).
- **Headline** : titres des panneaux. L’avertissement a une variante plus compacte (30px, puis 25px sous le seuil mobile).
- **Body** : paragraphes limités à une largeur de lecture (48ch), réduits sur mobile (13px).
- **Measurement** : valeurs du HUD avec chiffres tabulaires ; taille réduite sur mobile (18px). Les résultats utilisent une taille plus grande (32px).
- **Label** : intitulés du HUD et de progression. Les indications secondaires restent plus petites que les actions.
- **Key** : touches et version. Les graduations Canvas indiquent une distance réelle ; les noms de sections emploient Exo 2.

**The Measurement Rule.** La chasse fixe appartient aux mesures et aux repères d’entrée ; les explications restent en Manrope.

## Layout

La page est une colonne centrée, limitée en largeur (1800px), avec des gouttières proportionnelles (4vw). L’en-tête porte le nom, la version et la session temporaire. Le HUD précède la piste ; le nom de section, son conseil et la progression suivent. Les indications d’entrée ferment la page.

La piste forme un cadre rectangulaire : hauteur adaptée à la fenêtre (`min(64vh,720px)`), minimum courant (450px). Le panneau occupe son côté gauche (520px maximum à cette échelle), avec débordement vertical défilable. À partir du seuil large (1100px), il prend une largeur proportionnelle (46%, limitée à 600px), son retrait latéral augmente et la piste conserve une hauteur minimale (520px).

Sous le seuil mobile (700px), les gouttières deviennent fixes (16px). Le HUD se replie : les mesures et la gravité sont au-dessus d’une rangée de deux commandes de même largeur. Le panneau remplit la piste, s’aligne en haut et conserve son défilement. Le menu dispose d’une hauteur dédiée (540px), l’avertissement et l’aide d’une autre (500px) ; pendant la course, la piste utilise `clamp(310px,50vh,520px)`. Le pied de piste devient une colonne avec progression sur toute la largeur.

Sur fenêtre courte et large (hauteur maximale 600px, largeur minimale 701px), en-tête, HUD et espacements se resserrent ; la piste prend une hauteur fixe (330px). Le rendu conserve la hauteur du monde et montre une largeur de parcours adaptée, avec un minimum de champ horizontal en portrait. Les bordures, espacements et retours à la ligne structurent l’ensemble ; aucune grille décorative ne couvre la piste.

## Elevation & Depth

Le système est plat, sans ombre portée, flou ni panneau translucide. Le panneau opaque recouvre une partie de la vraie piste ; une bordure fine marque la séparation sur grand écran. Le contraste tonal distingue les surfaces et les repères. La caméra suit le joueur avec amortissement ; ce suivi fait partie de la lecture du jeu, sans constituer une promesse de performance mesurée.

**The Clear Track Rule.** Pendant la course, le panneau disparaît et les effets ne recouvrent pas durablement les obstacles.

## Shapes

Le monde emploie des rectangles francs. Les plateformes stables sont continues, les plateformes temporaires segmentées, les blocs dangereux hachurés. Les barrières synchronisées changent de trait et portent un libellé d’état. La silhouette menthe du joueur est un carré fendu à nez biseauté ; sa découpe intérieure indique le côté de la gravité.

Les commandes seules ont des angles légèrement arrondis, selon les trois rayons du frontmatter. Les badges et touches sont compacts et bordés ; les panneaux et la piste restent rectangulaires. Le symbole du nom associe deux flèches opposées et reprend l’idée d’inversion.

## Components

### Buttons

Des commandes textuelles fermes, avec une hauteur minimale tactile (44px). L’action principale associe fond menthe et texte encre ; les actions secondaires associent fond encre, texte papier et bordure sombre. Dans les groupes de panneau, l’action principale prend toute la ligne et les autres se replient selon la place disponible.

Le survol change le fond. Le focus clavier utilise un contour menthe (3px, décalage 4px). Les boutons inactifs sont atténués (opacité 0,4). Les commandes du HUD sont désactivées hors course ; le panneau fournit les actions adaptées à chaque état. La transition de fond est courte et limitée à l’absence de préférence pour le mouvement réduit.

### Select / Key Labels

Le choix de touche emploie une sélection native, large et bordée, de hauteur minimale tactile. Les touches affichées sont de petits rectangles en JetBrains Mono ; elles expliquent les commandes et ne sont pas elles-mêmes des boutons.

### State Panels

Un panneau unique porte avertissement, menu, commandes, informations, pause, collision et arrivée. Son titre précède l’explication et les actions. À chaque ouverture, le premier bouton reçoit le focus ; en course, le Canvas le reçoit. L’avertissement expérimental revient à chaque chargement. Le panneau n’est pas présenté comme une fenêtre flottante avec décor ou ombre.

### HUD / Gravity Indicator

Le HUD sépare temps, vitesse avec unité et nombre de morts. La gravité est écrite en français et soulignée du côté correspondant : bord inférieur pour le bas, supérieur pour le haut. Ce repère menthe reste cohérent avec la découpe du joueur. Les commandes Pause et Recommencer restent groupées à droite, puis sur leur propre ligne en mobile.

### Track / Inversion Feedback

Le Canvas porte la vraie géométrie, les graduations de distance et les noms de section. Une inversion renverse immédiatement la vitesse verticale ; un anneau menthe bref s’étend et s’efface autour du joueur. Cet anneau est supprimé sous préférence de mouvement réduit. Le focus du Canvas utilise un contour intérieur menthe (2px).

### Progress / Results

La progression est une ligne fine, avec un intitulé explicite, sous la piste. Les résultats mettent le temps en avant, puis les inversions ou morts de la session en texte secondaire. Les annonces de collision, d’arrivée et de section utilisent une zone de statut discrète. Aucun de ces éléments ne suggère une sauvegarde persistante.

## Do's and Don'ts

### Do:

- **Do** conserver la menthe pour le joueur, la gravité, la progression et l’action principale.
- **Do** renforcer les dangers et états temporaires par une trame, un trait ou un libellé.
- **Do** retirer le panneau pendant la course et garder les commandes accessibles autour de la piste.
- **Do** conserver les unités, les chiffres tabulaires et les messages de session temporaire.
- **Do** adapter les panneaux et les rangées de commandes à la largeur disponible.

### Don't:

- **Don't** ajouter des effets qui masquent la géométrie utile ou forcer l’anneau en mouvement réduit.
- **Don't** transformer les mesures du parcours en grille décorative.
- **Don't** substituer une illustration à la géométrie originale du prototype.
- **Don't** introduire un vocabulaire visuel de compte, sauvegarde, classement ou progression persistante.
