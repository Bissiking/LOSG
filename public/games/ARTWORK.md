<!-- public/games/ARTWORK.md -->
# Visuels des applications Bissiking

Complément LUMA OS: Gaming 0.2.0. Les six applications sont réelles ; aucune n’est marquée Démo dans le catalogue. Les illustrations promotionnelles générées sont distinguées ci-dessous des ressources officielles. Elles ne sont jamais annoncées comme des captures du gameplay.

## Fouria intégré

`fouria-cover.svg` (1280 × 720) et `fouria-bg.svg` (1920 × 1080) sont des compositions vectorielles géométriques créées pour cette intégration : un plateau de sept colonnes et six lignes, des jetons bleu électrique et or, et quatre jetons alignés en diagonale. Elles reprennent les couleurs du jeu local. Aucune capture de gameplay, image générée ou ressource distante n’est utilisée pour ces deux fichiers.

## Fichiers livrés

Les cinq paires ci-dessous sont locales, en JPEG qualité 86 : jaquette 1280 × 720 et arrière-plan 1920 × 1080. L’application ne contacte aucun service externe pour les charger. Un même visuel maître sert aux deux déclinaisons ; ce ne sont pas deux scènes distinctes.

| Application | Jaquette | Arrière-plan | Origine |
| --- | --- | --- | --- |
| Arcline | `arcline-cover.jpg` | `arcline-bg.jpg` | Illustration ImageGen : prairie à l’aube, archers géométriques bleu-gris, vert et or, suivant les sources du jeu. |
| CT PASIMAL | `ctpasimal-cover.jpg` | `ctpasimal-bg.jpg` | Illustration ImageGen : berline sur un pont de contrôle, garage anthracite et jaune. Le lettrage initial ajouté par le générateur a été retiré ; aucun nouveau logo n’est utilisé. |
| LUMA Snake | `luma-snake-cover.jpg` | `luma-snake-bg.jpg` | Illustration ImageGen : serpent en segments carrés arrondis vert menthe, grille sombre et nourriture rose-rouge, suivant les couleurs par défaut du code. |
| DustBound | `dustbound-cover.jpg` | `dustbound-bg.jpg` | Capture officielle recadrée pour enlever le HUD supérieur, sans génération ni nouveau décor. |
| Harmonix | `harmonix-cover.jpg` | `harmonix-bg.jpg` | Composition déterministe du H officiel inchangé sur le fond midnight navy de la marque. Aucune génération d’une identité de remplacement. |

Les maîtres générés mesurent 1672 × 941 ; ils sont recadrés très légèrement en 16:9 puis rééchantillonnés. La capture DustBound mesure 1440 × 900 ; le recadrage retire les 110 pixels supérieurs et ajuste les côtés au 16:9. Le fond livré à 1920 × 1080 est agrandi, il ne contient pas de détails natifs supplémentaires. Harmonix utilise son master transparent 1280 × 1280, redimensionné sans changer son ratio ni sa géométrie.

## Ressources officielles utilisées

- DustBound : [capture finale review-desktop-final.png](https://github.com/Bissiking/DustBound/blob/0ec476e921120a27bc48c5c79723a3bcd2e22dd3/.impeccable/mocks/review-desktop-final.png).
- Harmonix : [master raster harmonix.png](https://github.com/Bissiking/harmonix-apps/blob/c6d1cf5efdbb96d3f5cf750fb65812d66e486bee/assets/images/harmonix.png).
- L’analyse et les autres sources consultées sont consignées dans [docs/catalogue-research.md](../../docs/catalogue-research.md).

Les fichiers source téléchargés et les copies des maîtres générés sont conservés localement dans `.cache/catalogue-sources/` (non versionné). Les originaux ImageGen restent également dans le dossier de génération Codex. Le script `scripts/prepare-catalogue-art.ps1` effectue le recadrage, la composition de marque et l’encodage à partir de ces sources, sans modifier les originaux. Les dix JPEG de ce dossier sont les ressources prêtes à publier.

## Ressources officielles manquantes

Aucune jaquette ou arrière-plan raster officiel n’a été trouvé pour Arcline, CT PASIMAL ou Snake dans les arbres examinés. Les nouvelles illustrations servent de supports promotionnels en attendant d’éventuels visuels approuvés par le propriétaire. DustBound ne fournit pas de capture 1920 × 1080 sans HUD ; Harmonix fournit un master de marque plutôt qu’une bannière 16:9 prête à l’emploi. Ces limites ne sont pas masquées par la résolution d’export.

## Prompts de génération

Outil : ImageGen intégré. Les prompts exacts de création et de correction sont conservés ci-dessous pour expliquer les choix et faciliter une régénération.

### arcline

Use case: stylized-concept. Create a restrained promotional illustration for the existing browser game ARCLINE, a simple 2D turn-based archery duel. Match its actual flat geometric vector-like Phaser graphics, NOT realistic fantasy. Two small hooded archers in blue-grey tunics (#4a6d9c), simple rounded shapes, leather brown bows, golden headbands. They stand far apart on a flat grassy meadow at dawn, one on the right side aiming a simple arrow towards the other. Layered smooth green hills (#77a25a #5f8a44), distant desaturated blue mountains, clear sky #3f76c9 to #6fa8e0, pale warm horizon #ffe9b3, a few stylized white clouds, small daisies. Gold target accent #f0b64c, forest green #16231a. Calm precise art, side-on view, original simplified game silhouettes. Landscape exactly 16:9, ideally 1920x1080; keep left third quieter for launcher text, meaningful subjects toward center/right. No text, logos, UI, trajectory lines, realistic people, armor, castles, monsters, magic or invented weapons. This is supporting promotional art, never a claim to be a screenshot.

### ctpasimal

Use case: stylized-concept. Create a promotional illustration for an existing humorous browser game about vehicle technical inspection called CT PASIMAL. Preserve its actual simple clean 2D vector cartoon identity: charcoal modern industrial French garage (#101418 #1a2026 #222a32), yellow lift supports and safety markings (#ffc400), one modest older grey-blue sedan in side view on a car inspection lift, slightly scruffy with a small oil puddle, one simple generic paper inspection checklist on a work surface with green and red mark symbols (no readable writing). Overhead workshop lamp, a couple of restrained tool silhouettes. Playful automotive inspection atmosphere, NOT a racing game. No invented human mascot because no character artwork is supplied. Graphic flat shading with clear outlines and rounded simple body shapes, not photorealism or glossy 3D. Horizontal 16:9 ideally 1920x1080, vehicle in center-right, quiet darker left third for launcher text. No letters, numbers, logos, brands, watermarks, UI, supercars or futuristic cities. Supporting promotional art, not a fake game screenshot.

### luma-snake

Use case: stylized-concept. Supporting promotional illustration for the real LUMA Snake browser game. Strictly preserve the actual minimal top-down 2D arcade identity: near-black #0a0a0f background, very faint square playing grid #1a1a2e, a single luminous mint green snake represented entirely by a connected chain of rounded SQUARE tiles (#00ff88 body and #00ffaa head). One angular snake path with several right-angle bends, clearly visible separated segments, larger at the center-right. A single small bright pink-red circular food token #ff3366 nearby. Quiet dark left third reserved for launcher text. Flat graphic design, meticulous clean geometric edges, restrained illumination, no real animal scales, eyes, face, 3D perspective, trees, sci-fi scenery, city, invented obstacles or weapons. Wide exact16:9 ideally1920x1080; no text, lettering, logo, scoreboard, HUD or watermark. This is promotional art inspired by the real game rendering, not a claimed screenshot.

### Correction CT PASIMAL

Edit this promotional illustration only: remove ALL lettering, all words, the entire CT PASIMAL title and all yellow decorative logo strokes from the left third. Replace that left third with an empty, quiet charcoal #101418 garage wall matching the existing background. Preserve the sedan, lift, lamp, tools, workshop, clipboard and every other part exactly unchanged. Keep the 16:9 composition. No new logo, no typography, no letters or numbers anywhere. The actual application title will be rendered by HTML.

