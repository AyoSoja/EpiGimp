# EpiGimp Development Guide

## 1. Purpose

This document describes the development conventions used by EpiGimp
v1.0.

The main objective is to keep the raster editor readable and extensible
while avoiding both large multi-purpose modules and unnecessary
abstraction.

## 2. Main Commands

Start development:

```bash
npm run dev
```

Format:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Lint:

```bash
npm run lint
```

Build React and Electron:

```bash
npm run build
```

Audit dependencies:

```bash
npm audit
```

## 3. Validation Before Completing an Issue

Run:

```bash
npm run format
npm run lint
npm run build
npm audit
```

For changes affecting runtime behavior, also manually test the affected
workflow.

For v1.0, the complete validation flow is:

```text
Create / Open
→ Edit
→ Select / Crop
→ Layers
→ Masks
→ Filters
→ Export
```

## 4. Source Organization

```text
src/
├── canvas/       Canvas workspace and rendering helpers
├── components/   React UI
├── constants/    Shared application constants
├── document/     Raster document model, creation and image loading
├── export/       Export preparation/encoding
├── filters/      Image-processing algorithms
├── hooks/        React-specific reusable behavior
├── layers/       Layers, masks and composition
├── styles/       Global styling and design tokens
├── tools/        Editing tools
├── types/        Shared TypeScript declarations (e.g. window.electronAPI)
├── app.tsx       Root component
└── main.tsx      React entry point
```

Code should live in the most specific relevant domain.

There is no catch-all `utils/` folder: a helper belongs to the domain it
serves. For example, layer-only helpers stay in `layers/` and
document-only helpers stay in `document/`.

### Where to put new code

| You are adding...                  | Put it in                                 |
| ---------------------------------- | ----------------------------------------- |
| A UI component                     | `components/<component-name>/`            |
| A new tool                         | `tools/<tool-name>/` + `tool-definitions` |
| A new pixel filter                 | `filters/<filter-name>.ts`                |
| A layer or mask operation          | `layers/`                                 |
| A document-level helper            | `document/`                               |
| React state shared across the UI   | `hooks/use-<name>.ts`                     |
| A shared limit or default value    | `constants/editor-constants.ts`           |
| A new native (Electron) capability | `electron/` + `types/electron.d.ts`       |

## 5. File Naming

All files and folders under `src/` use `kebab-case`:

- a component lives in a folder of the same name, next to its
  stylesheet: `components/layers-panel/layers-panel.tsx` and
  `layers-panel.css`;
- a hook is named after the hook: `useZoom` lives in
  `hooks/use-zoom.ts`;
- type files carry their domain in the name (`layer-types.ts`,
  `tool-types.ts`, `filter-types.ts`) instead of a bare `types.ts`;
- the line after `File description:` in the Epitech file header is the
  file name.

Exported identifiers keep their usual TypeScript casing: `PascalCase`
for components and types, `camelCase` for functions and hooks.

The Electron entry points `electron/main.ts` and `electron/preload.ts`
keep their names because `package.json` and the main process reference
the compiled files.

## 6. Functions and Modules

Prefer:

- short functions;
- explicit names;
- one responsibility;
- reusable domain logic;
- small modules with a clear purpose.

Avoid:

- long event handlers containing unrelated logic;
- duplicated algorithms;
- unexplained magic values;
- creating one file for every trivial helper without architectural
  benefit.

## 7. React Components

React components should primarily handle:

- presentation;
- user events;
- composition of UI elements.

Raster algorithms should not be embedded directly into menu or panel
components.

For example, the Filters menu triggers a filter operation, but the
grayscale algorithm itself lives in `src/filters/grayscale.ts`.

## 8. Hooks

Custom hooks are used for meaningful React behavior such as:

- raster document state;
- zoom;
- tool selection;
- history;
- selections;
- keyboard shortcuts.

Normal non-React functions should remain normal functions.

## 9. Raster Data

Raster pixels are represented with Canvas `ImageData`.

When independent state is required, copy the underlying
`Uint8ClampedArray`.

This is particularly important for:

- duplicated layers;
- masks;
- Undo / Redo snapshots;
- filter output.

Do not unintentionally share mutable raster buffers between independent
layers or history states.

## 10. Layers and Masks

Editing operations should target the active layer unless the feature
explicitly concerns the complete document.

Masks remain separate from source layer pixels.

Rendering a mask must not destructively rewrite the original layer.

Use the shared layer-composition path (`layers/composite-layers.ts`)
when a feature needs the final visible document composition.

## 11. Filters

Pixel-local filters should use the shared pixel-processing engine
(`filters/process-pixels.ts`) when possible.

A filter should:

1.  receive `ImageData`;
2.  return new `ImageData`;
3.  preserve dimensions;
4.  preserve alpha unless changing alpha is an explicit feature;
5.  remain independent from React UI.

Algorithms that depend on neighboring pixels, such as blur, may use a
specialized traversal while remaining inside the filters domain.

## 12. Export

Export must reuse the visible layer composition rather than implement a
separate rendering model.

PNG preserves transparency.

JPEG must flatten the composition onto an opaque background before
encoding.

Native file saving is handled by Electron, not by direct Node.js access
from React.

## 13. Electron Communication

Desktop operations follow:

```text
React
   ↓
window.electronAPI
   ↓
preload.ts
   ↓
IPC
   ↓
main.ts
```

Do not expose unrestricted `ipcRenderer`, filesystem APIs or Node.js
globals to the renderer.

When adding a new native capability:

1.  implement the main-process handler in `electron/main.ts`;
2.  expose a narrow preload method in `electron/preload.ts`;
3.  type it in `src/types/electron.d.ts`;
4.  call that typed method from the renderer.

## 14. Keyboard Shortcuts

Global keyboard behavior is centralized in
`hooks/use-keyboard-shortcuts.ts`.

Do not add unrelated `window.addEventListener('keydown', ...)` handlers
throughout components.

Shortcuts should not interfere with text inputs, textareas, selects or
content-editable elements.

## 15. Styling

Shared visual values belong in:

```text
src/styles/tokens.css
```

Use existing tokens for:

- colors;
- spacing;
- font sizes;
- radii;
- layout dimensions;
- z-index.

Avoid duplicating hard-coded visual values when an appropriate token
already exists.

Component-specific styling stays beside the component, in the same
folder.

## 16. TypeScript

Reuse shared types rather than redefining the same structures.

Use explicit domain types for important application concepts such as
documents and layers.

Keep local-only types inside their module when they are not shared
elsewhere.

## 17. Prettier

Current conventions include:

```text
Semicolons:       No
Quotes:           Single
Trailing commas:  Enabled
Print width:      100
Indentation:      2 spaces
```

Use Prettier instead of manually formatting around these rules.

## 18. Git Workflow

Keep branches and commits focused on a clear task or issue.

Example commit messages:

```text
feat: implement image filters and pixel processing
feat: add PNG and JPEG export
feat: add editor keyboard shortcuts
fix: preserve white background in JPEG export
refactor: rename files to kebab-case and group document helpers
docs: update documentation for v1.0
```

When renaming or moving files, use `git mv` and keep the change in its
own commit, separate from behavior changes, so that Git keeps the file
history.

Before merging a stable release, ensure the complete validation sequence
passes.

## 19. Release Checklist

For v1.0:

```text
[ ] npm run format
[ ] npm run lint
[ ] npm run build
[ ] npm audit
[ ] Complete editing workflow tested
[ ] PNG export tested
[ ] JPEG export tested
[ ] README updated
[ ] Installation documentation updated
[ ] Architecture documentation updated
[ ] Known limitations documented
[ ] Stable branch merged into main
[ ] v1.0.0 tag created
```

## 20. Core Rules

1.  Keep functions small and explicit.
2.  Keep responsibilities separated.
3.  Reuse shared rendering and processing logic.
4.  Keep native access behind Electron preload.
5.  Deep-copy mutable raster data when independence matters.
6.  Keep UI and image algorithms separate.
7.  Prefer existing tokens/constants to magic values.
8.  Name files in `kebab-case` and keep each domain in its own folder.
9.  Keep code understandable for another developer.
10. Validate runtime behavior, not only compilation.
11. Update documentation when the architecture changes.