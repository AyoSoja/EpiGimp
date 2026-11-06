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
├── export/       Export preparation/encoding
├── filters/      Image-processing algorithms
├── hooks/        React-specific reusable behavior
├── layers/       Layers, masks and composition
├── styles/       Global styling and design tokens
├── tools/        Editing tools
├── types/        Shared TypeScript types
└── utils/        Generic/shared helpers
```

Code should live in the most specific relevant domain.

Do not move layer-only helpers into `utils/`, for example.

## 5. Functions and Modules

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

## 6. React Components

React components should primarily handle:

- presentation;
- user events;
- composition of UI elements.

Raster algorithms should not be embedded directly into menu or panel
components.

For example, the Filters menu triggers a filter operation, but the
grayscale algorithm itself lives in `src/filters/`.

## 7. Hooks

Custom hooks are used for meaningful React behavior such as:

- raster document state;
- zoom;
- tool selection;
- history;
- selections;
- keyboard shortcuts.

Normal non-React functions should remain normal functions.

## 8. Raster Data

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

## 9. Layers and Masks

Editing operations should target the active layer unless the feature
explicitly concerns the complete document.

Masks remain separate from source layer pixels.

Rendering a mask must not destructively rewrite the original layer.

Use the shared layer-composition path when a feature needs the final
visible document composition.

## 10. Filters

Pixel-local filters should use the shared pixel-processing engine when
possible.

A filter should:

1.  receive `ImageData`;
2.  return new `ImageData`;
3.  preserve dimensions;
4.  preserve alpha unless changing alpha is an explicit feature;
5.  remain independent from React UI.

Algorithms that depend on neighboring pixels, such as blur, may use a
specialized traversal while remaining inside the filters domain.

## 11. Export

Export must reuse the visible layer composition rather than implement a
separate rendering model.

PNG preserves transparency.

JPEG must flatten the composition onto an opaque background before
encoding.

Native file saving is handled by Electron, not by direct Node.js access
from React.

## 12. Electron Communication

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

1.  implement the main-process handler;
2.  expose a narrow preload method;
3.  type it in `src/types/electron.d.ts`;
4.  call that typed method from the renderer.

## 13. Keyboard Shortcuts

Global keyboard behavior is centralized.

Do not add unrelated `window.addEventListener('keydown', ...)` handlers
throughout components.

Shortcuts should not interfere with text inputs, textareas, selects or
content-editable elements.

## 14. Styling

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

Component-specific styling stays beside the component.

## 15. TypeScript

Reuse shared types rather than redefining the same structures.

Use explicit domain types for important application concepts such as
documents and layers.

Keep local-only types inside their module when they are not shared
elsewhere.

## 16. Prettier

Current conventions include:

```text
Semicolons:       No
Quotes:           Single
Trailing commas:  Enabled
Print width:      100
Indentation:      2 spaces
```

Use Prettier instead of manually formatting around these rules.

## 17. Git Workflow

Keep branches and commits focused on a clear task or issue.

Example commit messages:

```text
feat: implement image filters and pixel processing
feat: add PNG and JPEG export
feat: add editor keyboard shortcuts
fix: preserve white background in JPEG export
docs: update documentation for v1.0
```

Before merging a stable release, ensure the complete validation sequence
passes.

## 18. Release Checklist

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

## 19. Core Rules

1.  Keep functions small and explicit.
2.  Keep responsibilities separated.
3.  Reuse shared rendering and processing logic.
4.  Keep native access behind Electron preload.
5.  Deep-copy mutable raster data when independence matters.
6.  Keep UI and image algorithms separate.
7.  Prefer existing tokens/constants to magic values.
8.  Keep code understandable for another developer.
9.  Validate runtime behavior, not only compilation.
10. Update documentation when the architecture changes.
