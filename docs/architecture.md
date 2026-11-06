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
- open the native image selection dialog;
- read imported image files;
- open the native Save dialog;
- write exported PNG/JPEG bytes;
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

## 4. Renderer Structure

```text
src/
├── canvas/
├── components/
├── constants/
├── export/
├── filters/
├── hooks/
├── layers/
├── styles/
├── tools/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

### `components/`

Contains the editor UI:

- editor layout;
- menu bar;
- toolbar;
- tool options;
- layers panel;
- status bar;
- new-document dialog.

Components coordinate user interaction but domain-specific algorithms
are kept outside the UI when possible.

### `canvas/`

Contains the Canvas workspace and coordinate conversion.

The HTML5 Canvas is the raster rendering surface. Display zoom changes
the visual scale without changing the intrinsic document resolution.

### `tools/`

Contains editing tools and their shared definitions.

v1.0 tools include:

- Brush
- Eraser
- Color Picker
- Rectangle Selection

Crop uses the current rectangle selection.

### `layers/`

Contains the layer and mask domain.

A layer stores:

- identifier;
- name;
- raster `ImageData`;
- visibility;
- opacity;
- optional mask.

`compositeLayers()` is the shared composition function. It:

1.  clears the destination canvas;
2.  ignores hidden layers;
3.  creates a temporary render copy for each visible layer;
4.  applies the enabled mask non-destructively;
5.  applies layer opacity;
6.  draws the layer into the final composition.

The original layer pixels are not modified when a mask is rendered.

This composition logic is reused by the editor and export path so
exported images match the visible editor composition.

### `filters/`

Contains image-processing algorithms independently from React.

Pixel-local filters use a reusable processing engine that reads/writes
`ImageData`.

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

Contains renderer-side image export preparation.

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

- raster document state;
- zoom;
- active tool;
- brush options;
- eraser options;
- selection;
- Undo / Redo history;
- keyboard shortcuts.

History stores document snapshots and deep-copies mutable raster data,
including layer and mask `ImageData`.

### `types/`

Contains shared TypeScript definitions such as `RasterDocument` and the
typed `window.electronAPI`.

### `constants/`

Contains shared application constants such as document/zoom constraints.

### `utils/`

Contains reusable helpers that do not belong to a more specific domain,
including raster-document creation and image loading.

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

Keyboard handling is centralized in a dedicated React hook rather than
being distributed across menu components.

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
7.  Centralize shared constants and design tokens.
8.  Deep-copy mutable raster data when state independence is required.
9.  Avoid unnecessary abstraction.
10. Extend existing engines rather than redesigning them for each
    feature.
