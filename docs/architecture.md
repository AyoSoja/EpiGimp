# EpiGimp Architecture

## 1. Overview

EpiGimp v1.0 is a desktop raster graphics editor built with **Electron,
React, TypeScript and HTML5 Canvas**.

The architecture separates:

- operating-system access;
- React UI;
- raster rendering;
- editing tools;
- layers and masks;
- history;
- filters;
- export.

The objective is to keep features independent enough to evolve without
turning the editor into one large component.

## 2. Global Architecture

```text
┌───────────────────────────────┐
│ Electron Main Process         │
│                               │
│ Window lifecycle              │
│ Native Open / Save dialogs    │
│ File read / write             │
└───────────────┬───────────────┘
                │ IPC
                ▼
┌───────────────────────────────┐
│ Preload Layer                 │
│                               │
│ contextBridge                 │
│ Controlled renderer API       │
└───────────────┬───────────────┘
                │ window.electronAPI
                ▼
┌───────────────────────────────┐
│ React Renderer                │
│                               │
│ UI / Canvas / Editing         │
│ Layers / Masks / Filters      │
│ History / Export              │
└───────────────────────────────┘
```

The renderer does not directly access unrestricted Node.js or Electron
APIs.

## 3. Electron Layer

```text
electron/
├── main.ts
├── preload.ts
└── package.json
```

### Main process

`main.ts` owns desktop-specific operations:

- create the main `BrowserWindow`;
- load the Vite renderer in development;
- load `dist/index.html` in production;
- open the native image selection dialog (`dialog:openImage`);
- read imported image files (`file:readImage`);
- open the native Save dialog and write exported PNG/JPEG bytes
  (`file:saveImage`);
- manage the Electron application lifecycle.

Security configuration includes:

```ts
contextIsolation: true
nodeIntegration: false
```

### Preload

`preload.ts` exposes a limited API through `contextBridge`.

The application follows:

```text
React
  ↓
window.electronAPI
  ↓
preload.ts
  ↓
ipcRenderer
  ↓
ipcMain
  ↓
Electron / Node.js
```

This is used for native image opening and export saving.

`main.ts` and `preload.ts` keep their names because `package.json` and
the main process reference the compiled `main.js` and `preload.js`.

## 4. Renderer Structure

```text
src/
├── app.tsx
├── main.tsx
├── canvas/
│   ├── canvas-workspace/
│   │   ├── canvas-workspace.tsx
│   │   └── canvas-workspace.css
│   └── get-canvas-coordinates.ts
├── components/
│   ├── editor-layout/
│   ├── layers-panel/
│   ├── menu-bar/
│   ├── new-document-dialog/
│   ├── status-bar/
│   ├── tool-options/
│   └── toolbar/
├── constants/
│   └── editor-constants.ts
├── document/
│   ├── raster-document.ts
│   ├── create-raster-document.ts
│   ├── document-dimensions.ts
│   └── load-raster-image.ts
├── export/
│   └── export-image.ts
├── filters/
│   ├── process-pixels.ts
│   ├── filter-types.ts
│   ├── grayscale.ts
│   ├── invert.ts
│   ├── brightness.ts
│   ├── contrast.ts
│   └── blur.ts
├── hooks/
│   ├── use-raster-document.ts
│   ├── use-history.ts
│   ├── use-zoom.ts
│   ├── use-tool-manager.ts
│   ├── use-brush-options.ts
│   ├── use-eraser-options.ts
│   ├── use-selection.ts
│   └── use-keyboard-shortcuts.ts
├── layers/
│   ├── layer-types.ts
│   ├── create-layer.ts
│   ├── create-layer-mask.ts
│   ├── mask-selection.ts
│   └── composite-layers.ts
├── styles/
│   ├── tokens.css
│   ├── reset.css
│   └── global.css
├── tools/
│   ├── tool-types.ts
│   ├── tool-definitions.ts
│   ├── draw-stroke.ts
│   ├── brush/
│   │   └── brush-types.ts
│   ├── eraser/
│   │   └── eraser-types.ts
│   ├── color-picker/
│   │   └── pick-canvas-color.ts
│   └── selection/
│       ├── selection-types.ts
│       └── crop-image-data.ts
└── types/
    └── electron.d.ts
```

All files and folders under `src/` use `kebab-case`. A component lives in
a folder of the same name, next to its stylesheet.

### `components/`

Contains the editor UI:

- `editor-layout/` --- assembles the editor and wires hooks to UI;
- `menu-bar/` --- File, Edit, Filters and View menus (open, export, undo/redo, filters);
- `toolbar/` --- tool selection;
- `tool-options/` --- options of the active tool;
- `layers-panel/` --- layer and mask controls;
- `status-bar/` --- document dimensions and zoom;
- `new-document-dialog/` --- new-document form.

Components coordinate user interaction but domain-specific algorithms
are kept outside the UI when possible.

### `canvas/`

Contains the Canvas workspace (`canvas-workspace/`) and coordinate
conversion (`get-canvas-coordinates.ts`).

The HTML5 Canvas is the raster rendering surface. Display zoom changes
the visual scale without changing the intrinsic document resolution.

### `tools/`

Contains editing tools and their shared definitions:

- `tool-types.ts` --- `ToolId` and `ToolDefinition`;
- `tool-definitions.ts` --- the list of available tools and the default
  tool;
- `draw-stroke.ts` --- stroke drawing used by the canvas;
- one sub-folder per tool that needs its own types or logic
  (`brush/`, `eraser/`, `color-picker/`, `selection/`).

v1.0 tools include:

- Brush
- Eraser
- Color Picker
- Rectangle Selection

Crop uses the current rectangle selection (`selection/crop-image-data.ts`).

### `layers/`

Contains the layer and mask domain.

A layer (`layer-types.ts`) stores:

- identifier;
- name;
- raster `ImageData`;
- visibility;
- opacity;
- optional mask.

`create-layer.ts` and `create-layer-mask.ts` build layers and masks,
and `mask-selection.ts` applies a rectangle selection to a mask.

`compositeLayers()` (in `composite-layers.ts`) is the shared
composition function. It:

1.  clears the destination canvas;
2.  ignores hidden layers;
3.  creates a temporary render copy for each visible layer;
4.  applies the enabled mask non-destructively;
5.  applies layer opacity;
6.  draws the layer into the final composition.

The original layer pixels are not modified when a mask is rendered.

This composition logic is reused by the editor and export path so
exported images match the visible editor composition.

### `document/`

Contains the raster document model and its helpers:

- `raster-document.ts` --- the `RasterDocument` type;
- `create-raster-document.ts` --- creation of a new document;
- `document-dimensions.ts` --- validation of document dimensions against
  the limits in `constants/editor-constants.ts`;
- `load-raster-image.ts` --- conversion of an imported image into a
  document.

### `filters/`

Contains image-processing algorithms independently from React.

Pixel-local filters use a reusable processing engine
(`process-pixels.ts`) that reads/writes `ImageData`.

v1.0 filters:

- Grayscale
- Invert
- Brightness
- Contrast
- Blur

Grayscale, invert, brightness and contrast use the shared
pixel-processing path. Blur uses neighboring pixels and therefore has
its own raster traversal while following the same non-UI architecture.

Filters operate on the active layer and preserve alpha.

### `export/`

Contains renderer-side image export preparation (`export-image.ts`).

Export flow:

```text
RasterDocument
      ↓
compositeLayers()
      ↓
offscreen Canvas
      ↓
PNG / JPEG encoding
      ↓
byte array
      ↓
window.electronAPI
      ↓
native Save dialog
      ↓
file
```

PNG keeps transparent pixels.

For JPEG, EpiGimp first creates the transparent composition, then draws
it over a white background on a second canvas before JPEG encoding. This
is necessary because JPEG does not support alpha transparency.

### `hooks/`

Contains reusable React state/behavior.

The v1.0 architecture includes hooks for:

- raster document state (`use-raster-document.ts`);
- zoom (`use-zoom.ts`);
- active tool (`use-tool-manager.ts`);
- brush options (`use-brush-options.ts`);
- eraser options (`use-eraser-options.ts`);
- selection (`use-selection.ts`);
- Undo / Redo history (`use-history.ts`);
- keyboard shortcuts (`use-keyboard-shortcuts.ts`).

History stores document snapshots and deep-copies mutable raster data,
including layer and mask `ImageData`.

### `constants/`

Contains shared application constants (`editor-constants.ts`): default
document size, document size limits and zoom limits.

### `types/`

Contains shared TypeScript declarations that do not belong to a specific
domain, such as the typed `window.electronAPI` (`electron.d.ts`).

## 5. Raster Document Model

A raster document contains:

```text
RasterDocument
├── id
├── name
├── width
├── height
├── layers[]
└── activeLayerId
```

Each layer owns its raster pixels. Editing operations target the active
layer.

This means adding a new layer does not flatten the document.

## 6. Masks

Masks are stored independently from layer pixels.

A mask contains its own `ImageData` and an enabled state.

During rendering, the mask controls the rendered alpha of the layer. The
source raster remains unchanged, making the operation non-destructive.

Layer duplication and history snapshots deep-copy mask pixels to prevent
shared mutable mask data.

## 7. History

Undo / Redo is document-based.

Before a mutating operation, the current document state is registered in
history. Raster buffers are deep-copied so later modifications cannot
mutate older history states.

History covers core editing operations including drawing, layers, masks,
crop and filters.

## 8. Filter Engine

Pixel-local filters share a reusable processor:

```text
ImageData
   ↓
read pixel
   ↓
filter function
   ↓
write pixel
   ↓
new ImageData
```

The source `ImageData` is copied before processing.

This allows new pixel-local filters to be introduced without redesigning
the filter system.

Blur is handled separately because its output pixel depends on
neighboring source pixels.

## 9. Styling

```text
styles/
├── tokens.css
├── reset.css
└── global.css
```

`tokens.css` is the single source for shared visual values:

- colors;
- typography;
- spacing;
- radii;
- layout dimensions;
- z-index values.

Component CSS consumes these variables rather than duplicating shared
values.

## 10. Keyboard Shortcuts

Keyboard handling is centralized in a dedicated React hook
(`hooks/use-keyboard-shortcuts.ts`) rather than being distributed across
menu components.

v1.0 shortcuts:

```text
Ctrl+N          New
Ctrl+O          Open
Ctrl+Z          Undo
Ctrl+Shift+Z    Redo
Ctrl+Shift+P    Export PNG
Ctrl+Shift+J    Export JPEG
```

Global shortcuts are ignored when the user is typing in an editable
field.

## 11. Development and Production

Development:

```text
Electron
  ↓
VITE_DEV_SERVER_URL
  ↓
http://localhost:5173
  ↓
Vite / React
```

Production:

```text
Electron
  ↓
loadFile()
  ↓
dist/index.html
```

Electron TypeScript is compiled into `dist-electron/`.

## 12. Security

The v1.0 desktop architecture uses:

- context isolation;
- disabled Node integration in the renderer;
- controlled preload APIs;
- Content Security Policy;
- explicit IPC operations.

The renderer never receives unrestricted Node.js filesystem access.

## 13. Architectural Principles

EpiGimp follows these rules:

1.  One clear responsibility per function/module.
2.  Small readable functions over large multi-purpose functions.
3.  Reuse shared logic rather than duplicate it.
4.  Keep UI separate from image-processing logic.
5.  Keep OS access behind the preload bridge.
6.  Keep layer/mask logic in the layer domain.
7.  Keep the document model in the document domain.
8.  Centralize shared constants and design tokens.
9.  Deep-copy mutable raster data when state independence is required.
10. Avoid unnecessary abstraction.
11. Extend existing engines rather than redesigning them for each
    feature.