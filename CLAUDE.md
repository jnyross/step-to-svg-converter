# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm start
```

**Build for production:**
```bash
npm run build
```

**Run tests:**
```bash
npm test                    # Unit tests
npm run test:coverage       # Unit tests with coverage (≥90% required)
npm run cypress:open        # Open Cypress test runner
npm run test:e2e           # Run end-to-end tests headless
```

**Quality checks:**
```bash
npm run lint               # ESLint with strict rules
npm run typecheck          # TypeScript type checking
npm run validate           # Run all checks (types, tests, e2e)
```

## Architecture Overview

This is a React + TypeScript application that converts STEP CAD files to SVG profiles optimized for Shaper Origin CNC machines.

**Core Processing Pipeline:**
1. **File Upload** (`src/components/FileUpload.tsx`) - Handles STEP file validation and upload
2. **STEP Parsing** (`src/utils/stepParser.ts`) - Parses ISO 10303-21 STEP entities using OpenCascade.js
3. **3D Visualization** (`src/components/Viewer3D.tsx`) - Three.js rendering with cutting plane preview
4. **Profile Extraction** (`src/utils/profileExtractor.ts`) - Generates 2D cross-sections from 3D geometry
5. **SVG Export** (`src/utils/svgExporter.ts`) - Creates Shaper Origin-compatible SVG files

**Key Dependencies:**
- **OpenCascade.js** - STEP file parsing and CAD operations
- **Three.js + React Three Fiber** - 3D visualization and geometry processing
- **Material-UI** - UI components and theming
- **TypeScript** - Full type safety with strict configuration

**Data Flow:**
```
STEP File → StepFile object → Three.js Geometry → ProfileConfig → ExtractedProfile → SVG Export
```

**Important Type Definitions:**
- `StepFile` - Parsed STEP file with entities and bounding box
- `ProfileConfig` - Cutting plane configuration (XY/XZ/YZ/custom)
- `ExtractedProfile` - 2D curves with metrics (area, length)
- `SvgExportConfig` - Export settings with Shaper Origin color coding

## Testing Requirements

- **Unit Test Coverage:** Minimum 90% (lines, functions, branches, statements)
- **Test Files:** Located in `src/utils/__tests__/` and adjacent to components
- **E2E Tests:** Cypress tests for full workflow validation
- **Type Safety:** All code must pass `npm run typecheck`

## STEP File Support

Supported entities per ISO 10303-21:
- CARTESIAN_POINT, CIRCLE, LINE
- CYLINDRICAL_SURFACE, PLANE, CONICAL_SURFACE  
- SPHERICAL_SURFACE, B_SPLINE_SURFACE, B_SPLINE_CURVE
- COMPOSITE_CURVE, ADVANCED_BREP_SHAPE_REPRESENTATION
- MANIFOLD_SOLID_BREP

## Shaper Origin SVG Requirements

- **Color Coding:** Through-cut (red #FF0000), Pocket (blue #0000FF), Engraving (green #00FF00), Guide (black #000000)
- **Units:** Millimeters or inches with proper scaling
- **Line Weights:** 0.1-2.0mm optimal range
- **Path Commands:** Use M, L, Z only (avoid curves for compatibility)

## Development Notes

- **OpenCascade.js Integration:** Currently uses placeholder implementations - production would require full OpenCascade.js WASM integration
- **Performance Targets:** <10s for 50MB files, <30s processing, 60fps 3D rendering
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+ with WebGL 1.0
- **Memory Limits:** <2GB for typical parts

## Component Structure

- `App.tsx` - Main application state and component orchestration
- `components/FileUpload.tsx` - Drag-drop interface with file validation
- `components/Viewer3D.tsx` - Three.js 3D viewer with camera controls
- `components/ProfilePanel.tsx` - Profile configuration and extraction controls
- `components/ExportPanel.tsx` - SVG export settings and download
- `utils/` - Core processing algorithms for STEP parsing, profile extraction, and SVG generation