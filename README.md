# EpiGimp

EpiGimp is a desktop raster graphics editor developed with **Electron,
React, TypeScript and HTML5 Canvas**.

Version **1.0.0** implements the complete core editing workflow required
by the original project scope: document creation/import, raster editing,
selections, layers, masks, filters and PNG/JPEG export.

## Features

### Documents and navigation

- Create raster documents with custom dimensions
- Import PNG, JPG and JPEG images
- Preserve imported image dimensions
- Preserve PNG transparency
- Zoom from 10% to 800% without changing raster resolution
- Display document dimensions and zoom level in the status bar

### Editing tools

- Brush
- Eraser
- Color picker
- Rectangle selection
- Crop from the current selection
- Undo / Redo

### Layers

- Add and delete layers
- Select the active layer
- Rename layers
- Duplicate layers
- Reorder layers
- Toggle visibility
- Adjust opacity
- Edit only the active layer
- Composite visible layers in the editor and during export

### Layer masks

- Add a mask to a layer
- Enable or disable a mask
- Remove a mask
- Apply a rectangle selection to a mask
- Non-destructive mask rendering
- Independent masks when layers are duplicated
- Mask support in Undo / Redo and crop operations

### Filters

Filters operate on the active layer through a reusable pixel-processing
architecture.

Supported filters:

- Grayscale
- Invert Colors
- Brightness increase/decrease
- Contrast increase/decrease
- Blur

Filter operations preserve document dimensions and alpha information and
are registered in Undo / Redo history.

### Export

- PNG export with transparency
- JPEG export with transparent areas flattened onto a white background
- Visible-layer composition
- Hidden layers excluded
- Layer opacity preserved
- Layer masks preserved
- Native Electron Save dialog

## Keyboard Shortcuts

Shortcut Action

---

`Ctrl+N` New document
`Ctrl+O` Open image
`Ctrl+Z` Undo
`Ctrl+Shift+Z` Redo
`Ctrl+Shift+P` Export PNG
`Ctrl+Shift+J` Export JPEG

Global shortcuts are ignored while typing in editable form fields.

## Supported Formats

### Import

- PNG
- JPG
- JPEG

### Export

- PNG
- JPEG

PNG export preserves transparency. JPEG does not support transparency,
so transparent areas are exported on a white background.

## Tech Stack

- **Electron** --- desktop runtime and native file dialogs
- **React** --- user interface
- **TypeScript** --- application code and shared types
- **HTML5 Canvas** --- raster rendering and manipulation
- **Vite** --- renderer development and production build
- **ESLint** --- static analysis
- **Prettier** --- formatting

## Architecture

EpiGimp separates desktop integration, UI, rendering and editing logic.

```text
Electron Main Process
        │
        │ IPC
        ▼
   Preload Layer
        │
        │ window.electronAPI
        ▼
  React Renderer
        │
        ├── Canvas
        ├── Tools
        ├── Layers / Masks
        ├── Filters
        ├── History
        └── Export
```

Main source domains:

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
└── utils/
```

Shared visual values are centralized in CSS design tokens. Native
Electron/Node.js operations are kept behind the preload bridge.

See [Architecture](./docs/architecture.md) for details.

## Getting Started

### Requirements

The v1.0 development environment uses:

```text
Node.js 20.x
npm 10.x
Git
```

Clone and install:

```bash
git clone https://github.com/ana-b-c/EpiGimp.git
cd EpiGimp
npm install
```

Start development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

See [Installation Guide](./docs/installation.md) for the complete setup.

## Development Commands

```bash
npm run dev
npm run format
npm run format:check
npm run lint
npm run build
npm audit
```

Before completing a development task, the project should pass
formatting, linting and the complete React/Electron build.

See [Development Guide](./docs/development.md).

## v1.0 Validation

The complete workflow has been manually validated:

```text
Create / Open
→ Edit
→ Select / Crop
→ Layers
→ Masks
→ Filters
→ Export
```

PNG and JPEG exports were also validated with multiple layers, hidden
layers, opacity and masks.

## Known Limitations

EpiGimp v1.0 intentionally focuses on the original core project scope.

The following features are not part of v1.0:

- Advanced selection modes
- Image rotation/scaling transformations
- Advanced history panel
- Real-time filter preview dialogs
- Native `.epigimp` project files
- Autosave and crash recovery
- Unsaved-work protection
- Packaged installers/distributable binaries

These areas are planned as post-v1.0 improvements during the advanced
project milestones.

## Documentation

---

Document Purpose

---

[Installation Install, run and build EpiGimp
Guide](./docs/installation.md)

[Architecture](./docs/architecture.md) Technical architecture and data
flow

[Development Coding conventions and workflow
Guide](./docs/development.md)
----------------------------------------------------------------------------

## Version

Current stable core release: **v1.0.0**
