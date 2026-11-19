# Couleurs, remplissage/dégradés et formes

Tickets : 3 user stories « En tant que graphiste… » (couleurs, remplissage, formes).

## Phases

### Phase 1 : algorithmes purs (risque le plus élevé, testés d'abord)

Verified when: `npm test` vert, chaque fichier de test rouge si l'algorithme est muté.
Files to touch: `src/colors/colorConversion.ts`, `src/tools/selection/selectionBounds.ts`,
`src/tools/fill/floodFill.ts`, `src/tools/gradient/renderGradient.ts`,
`src/tools/shapes/constrainShape.ts` (+ `*.test.ts`).

#### Step 1.1 : conversions hex / RVB / TSV (Size: S)

- Acceptance criteria: hex ↔ RVB ↔ TSV aller-retour exact sur couleurs de référence ; hex invalide refusé.
- Verification command: `npm test -- colorConversion`
- Test seams: fonctions exportées.
- Blocked by: none

#### Step 1.2 : remplissage par diffusion (Size: S)

- Acceptance criteria: zone contiguë seulement ; tolérance 0–255 ; limité à la sélection active.
- Verification command: `npm test -- floodFill`
- Blocked by: none

#### Step 1.3 : dégradés linéaire / radial (Size: S)

- Acceptance criteria: début = premier plan, fin = arrière-plan ; radial selon la distance ; limité à la sélection.
- Verification command: `npm test -- renderGradient`
- Blocked by: none

#### Step 1.4 : géométrie des formes + Maj (Size: XS)

- Acceptance criteria: Maj → carré / cercle ; ligne accrochée à 45°.
- Verification command: `npm test -- constrainShape`
- Blocked by: none

### Phase 2 : état et UI

Verified when: lint + build verts, parcours testé dans le navigateur (Playwright) avec captures.

#### Step 2.1 : couleurs premier/arrière-plan (Size: M)

- `useColors`, panneau `ColorPanel` (aperçu, RVB, TSV, hex, échange, réinitialiser), pipette
  (clic = premier plan, Ctrl+clic = arrière-plan, aperçu au survol), raccourcis X / D.
- Blocked by: 1.1

#### Step 2.2 : outils Remplissage et Dégradé (Size: M)

- Blocked by: 1.2, 1.3, 2.1

#### Step 2.3 : outils Ligne / Rectangle / Ellipse (Size: M)

- Blocked by: 1.4, 2.1

## Decision log

| Decision                | Chosen option                                          | Why                                                     |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Couleur du pinceau      | Le pinceau utilise la couleur de premier plan          | Une seule source de vérité pour la couleur, comme GIMP  |
| Couleurs des formes     | Contour = premier plan, remplissage = arrière-plan     | Convention GIMP/Paint ; configurable via le sélecteur   |
| Tolérance               | 0–255, différence max par canal (RVBA), défaut 32      | Équivalent du « seuil » GIMP, prévisible                |
| Échantillonnage du fill | Calque actif uniquement                                | Les éditions ciblent le calque actif (architecture)     |
| Historique              | Snapshot poussé au moment de la validation             | Un clic sans effet n'ajoute pas d'entrée d'annulation   |
| Maj sur la ligne        | Accroche par pas de 45°                                | Attente usuelle (horizontal, vertical, diagonale)       |
| Sélection et formes     | Les formes sont aussi découpées par la sélection       | Cohérence avec remplissage/dégradé                      |
| Tests                   | Vitest sur les algorithmes purs (polyfill `ImageData`) | Le projet n'avait aucun test ; ce sont les zones à bugs |

## Always / Never

- Always: algorithmes hors des composants React ; jetons CSS ; snapshot d'historique pour chaque édition.
- Never: push distant ; renommage kebab-case des fichiers existants (hors sujet) ; sélections non
  rectangulaires ; anticrénelage du remplissage.

## Progress

| Phase | Status |
| ----- | ------ |
| 1     | done   |
| 2     | done   |

## Execution record

- Shipped: the 3 stories as planned; Vitest added (25 unit tests, every algorithm
  test mutation-checked); browser check with Playwright (31 checks, pixel-level).
- Deviations: code review → drag previews coalesced per animation frame, outline
  inset inside the dragged box, picker canvas `willReadFrequently`, X/D ignored in dialogs,
  empty number fields ignored; the background swatch offset was widened (it was
  hard to click).
- Not done: `.prettierrc` is missing from the repository (only changed files were
  formatted with the documented options); no Escape-to-cancel during a drag.
