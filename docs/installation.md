# EpiGimp Installation Guide

This guide explains how to install, run, validate and build EpiGimp
v1.0.

## 1. Prerequisites

Install:

- Git
- Node.js
- npm

The project has been developed and validated with:

```text
Node.js 20.x
npm 10.x
```

Check the installed versions:

```bash
node --version
npm --version
git --version
```

## 2. Clone the Repository

```bash
git clone https://github.com/ana-b-c/EpiGimp.git
cd EpiGimp
```

## 3. Install Dependencies

```bash
npm install
```

Dependencies are managed from the root `package.json`. Do not manually
modify `node_modules`.

## 4. Start Development

```bash
npm run dev
```

This starts both:

- the Vite development server;
- the Electron application.

Development flow:

```text
npm run dev
     │
     ├── Vite → React → http://localhost:5173
     │
     └── Electron → EpiGimp desktop window
```

Electron waits for the Vite server before loading the development
renderer.

## 5. Linux / Wayland Note

The Ubuntu/Wayland development environment used for EpiGimp required
Electron to run through X11 compatibility:

```text
--ozone-platform=x11
```

This option is already included in the Electron development script.

This is an environment-specific workaround rather than an application
requirement.

## 6. Build

Create the production build with:

```bash
npm run build
```

The command builds both application parts:

```text
React / TypeScript → dist/
Electron / TypeScript → dist-electron/
```

A successful build verifies TypeScript compilation and production
renderer generation.

## 7. Test the Production Build

On the Linux development environment, the built application can be
launched with:

```bash
npx electron . --ozone-platform=x11
```

Without `VITE_DEV_SERVER_URL`, Electron loads:

```text
dist/index.html
```

directly from the filesystem.

## 8. Code Quality

Apply formatting:

```bash
npm run format
```

Check formatting without modifying files:

```bash
npm run format:check
```

Run ESLint:

```bash
npm run lint
```

Build the complete project:

```bash
npm run build
```

Check npm dependencies:

```bash
npm audit
```

Before a release, the recommended validation sequence is:

```bash
npm run format
npm run lint
npm run build
npm audit
```

## 9. Functional Validation

After starting EpiGimp, validate the complete editing workflow:

```text
Create / Open
→ Edit
→ Select / Crop
→ Layers
→ Masks
→ Filters
→ Export
```

For export validation, test:

- PNG transparency;
- JPEG white background for transparent areas;
- visible layers;
- hidden layers;
- layer opacity;
- masks;
- unchanged document dimensions.

## 10. Supported Formats

Import:

```text
PNG
JPG
JPEG
```

Export:

```text
PNG
JPEG
```

PNG preserves transparency.

JPEG does not support alpha transparency; EpiGimp flattens transparent
areas onto a white background before encoding.

## 11. Troubleshooting

If the Electron window does not start on a Linux Wayland session, verify
that the development command includes:

```text
--ozone-platform=x11
```

If a dependency or build problem occurs, first verify the Node.js/npm
versions and reinstall dependencies:

```bash
npm install
npm run build
```

Generated directories such as `dist/` and `dist-electron/` are build
outputs and should not be edited manually.
