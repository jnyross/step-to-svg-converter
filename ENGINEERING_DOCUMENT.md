# STEP-to-SVG Converter: Complete Engineering Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack Deep Dive](#technology-stack-deep-dive)
4. [Development Environment Setup](#development-environment-setup)
5. [Detailed Implementation Guide](#detailed-implementation-guide)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [File Processing Pipeline](#file-processing-pipeline)
9. [3D Visualization Implementation](#3d-visualization-implementation)
10. [Profile Extraction Algorithms](#profile-extraction-algorithms)
11. [SVG Export System](#svg-export-system)
12. [Testing Strategy](#testing-strategy)
13. [Performance Optimization](#performance-optimization)
14. [Known Issues and Solutions](#known-issues-and-solutions)
15. [Future Enhancement Roadmap](#future-enhancement-roadmap)
16. [Deployment Considerations](#deployment-considerations)

---

## 1. Project Overview

### 1.1 Purpose and Scope
This application converts STEP (ISO 10303-21) CAD files into SVG vector graphics optimized for Shaper Origin CNC machining. The system extracts 2D cross-sectional profiles from 3D STEP geometry and exports them as properly formatted SVG files with Shaper Origin-specific color coding and metadata.

### 1.2 Business Requirements
- **File Size Limit**: Maximum 100MB STEP files
- **Processing Time**: <30 seconds for typical parts
- **Accuracy**: ±0.001mm precision for profile extraction
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+
- **Performance**: 60fps 3D rendering, <2GB memory usage
- **Output Format**: SVG 1.1 compliant files with Shaper Origin color schemes

### 1.3 User Journey
1. **File Upload**: User drags/drops or selects STEP file
2. **Validation**: System validates file format and size
3. **3D Visualization**: STEP geometry rendered in interactive 3D viewer
4. **Profile Configuration**: User selects cutting plane orientation and position
5. **Profile Extraction**: System generates 2D cross-sections
6. **SVG Export**: User downloads optimized SVG files

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Processing    │    │   Export        │
│   (React/TS)    │────│   (Workers)     │────│   (SVG Gen)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Upload   │    │   STEP Parser   │    │   File Download │
│   Validation    │    │   OpenCascade   │    │   Browser API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Data Flow Architecture
```
User Input → File Validation → STEP Parsing → 3D Rendering → 
Profile Extraction → 2D Processing → SVG Generation → Download
```

### 2.3 Component Hierarchy
```
App
├── FileUpload
├── Viewer3D
│   ├── Scene
│   │   ├── Lighting
│   │   ├── Grid
│   │   ├── Geometry
│   │   └── CuttingPlane
│   └── Controls (OrbitControls)
├── ProfilePanel
│   ├── PlaneSelector
│   ├── PositionControls
│   ├── Settings
│   └── Preview
└── ExportPanel
    ├── ConfigPanel
    ├── ColorMapping
    └── ExportButton
```

---

## 3. Technology Stack Deep Dive

### 3.1 Core Dependencies (Exact Versions)
```json
{
  "react": "^18.2.0",                    // UI Framework
  "react-dom": "^18.2.0",               // DOM Rendering
  "typescript": "^4.9.5",               // Type Safety
  "@types/react": "^18.2.42",           // React Types
  "@types/react-dom": "^18.2.17",       // React DOM Types
  "@types/three": "^0.158.3",           // Three.js Types
  "three": "^0.158.0",                  // 3D Graphics
  "@react-three/fiber": "^8.15.11",     // React Three.js Integration
  "@mui/material": "^5.14.20",          // UI Components
  "@mui/icons-material": "^5.14.19",    // Material Icons
  "@emotion/react": "^11.11.1",         // CSS-in-JS
  "@emotion/styled": "^11.11.0",        // Styled Components
  "react-dropzone": "^14.2.3",          // File Upload
  "opencascade.js": "^1.1.1"            // STEP Processing
}
```

### 3.2 Development Dependencies
```json
{
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^14.6.1",
  "cypress": "^14.4.1",
  "react-scripts": "5.0.1"
}
```

### 3.3 Critical Version Compatibility Matrix

#### React Ecosystem Compatibility
- **React 18.2.x** ↔ **@react-three/fiber 8.15.x** ✅
- **React 19.x** ↔ **@react-three/fiber 8.15.x** ❌ (Type conflicts)
- **TypeScript 4.9.x** ↔ **React 18.2.x** ✅
- **TypeScript 5.x** ↔ **Material-UI 5.14.x** ❌ (Union type complexity)

#### Three.js Compatibility
- **Three.js 0.158.x** ↔ **@react-three/fiber 8.15.x** ✅
- **Three.js 0.177.x** ↔ **@react-three/fiber 8.15.x** ❌ (Missing exports)
- **@react-three/drei 9.88.x** ↔ **Three.js 0.158.x** ❌ (BatchedMesh conflicts)

#### Material-UI Compatibility
- **@mui/material 5.14.x** ↔ **React 18.2.x** ✅
- **@mui/material 7.x** ↔ **React 18.2.x** ❌ (Grid API changes)

### 3.4 Known Incompatible Combinations
```
❌ React 19 + @react-three/fiber 8.x (Type conflicts)
❌ Three.js 0.177 + @react-three/fiber 8.x (Missing BatchedMesh)
❌ @react-three/drei 9.122+ + Three.js 0.158 (Dependency conflicts)
❌ Material-UI 7.x + TypeScript 4.9 (Grid API breaking changes)
❌ TypeScript 5.x + Material-UI 5.x (Union type complexity)
```

---

## 4. Development Environment Setup

### 4.1 Prerequisites
```bash
# Node.js version requirement
node --version  # Must be >= 16.14.0, < 19.0.0

# npm version requirement  
npm --version   # Must be >= 8.0.0

# Browser requirements for development
# Chrome >= 90, Firefox >= 88, Safari >= 14
```

### 4.2 Project Initialization (Step-by-Step)

#### Step 1: Create React App
```bash
npx create-react-app step-to-svg-converter --template typescript
cd step-to-svg-converter
```

#### Step 2: Clean Default Files
```bash
# Remove unnecessary files
rm src/logo.svg
rm src/App.css
rm src/App.test.tsx
rm public/logo192.png
rm public/logo512.png
rm public/favicon.ico
```

#### Step 3: Install Core Dependencies
```bash
# Install exact versions to avoid conflicts
npm install three@0.158.0 @types/three@0.158.3
npm install @react-three/fiber@8.15.11
npm install @mui/material@5.14.20 @mui/icons-material@5.14.19
npm install @emotion/react@11.11.1 @emotion/styled@11.11.0
npm install react-dropzone@14.2.3
npm install opencascade.js@1.1.1
```

#### Step 4: Install Development Dependencies
```bash
npm install --save-dev @testing-library/jest-dom@6.6.3
npm install --save-dev @testing-library/user-event@14.6.1
npm install --save-dev cypress@14.4.1
```

#### Step 5: Configure TypeScript
Create/update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

### 4.3 Directory Structure Creation
```bash
mkdir -p src/components
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/utils/__tests__
mkdir -p cypress/e2e
mkdir -p cypress/support
mkdir -p cypress/fixtures
```

---

## 5. Detailed Implementation Guide

### 5.1 Type System Implementation

#### Core Data Models (`src/types/index.ts`)
```typescript
// Vector types for 2D/3D coordinates
export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Bounding box types
export interface BoundingBox {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  dimensions: Vector3;
}

export interface BoundingBox2D {
  min: Vector2;
  max: Vector2;
  center: Vector2;
  dimensions: Vector2;
}

// STEP file structure
export interface StepEntity {
  id: number;
  type: string;
  parameters: any[];
  references: number[];
}

export interface StepFile {
  id: string;
  filename: string;
  size: number;
  uploadDate: Date;
  entities: StepEntity[];
  boundingBox: BoundingBox;
}

// Profile extraction configuration
export interface ProfileConfig {
  planeType: 'XY' | 'XZ' | 'YZ' | 'CUSTOM';
  position: number;
  normal: Vector3;
  origin: Vector3;
  tolerance: number;
  simplification: boolean;
}

// 2D curve representation
export interface Curve2D {
  type: 'line' | 'circle' | 'spline';
  points: Vector2[];
  closed: boolean;
}

// Extracted profile data
export interface ExtractedProfile {
  id: string;
  curves: Curve2D[];
  boundingBox: BoundingBox2D;
  area: number;
  length: number;
}

// SVG export configuration
export interface ColorMapping {
  throughCut: string;    // #FF0000 (red)
  pocket: string;        // #0000FF (blue) 
  engraving: string;     // #00FF00 (green)
  guideLine: string;     // #000000 (black)
}

export interface SvgExportConfig {
  units: 'mm' | 'inches';
  scale: number;
  colorMapping: ColorMapping;
  lineWeight: number;
  precision: number;
  includeMetadata: boolean;
}

// Default configurations
export const DEFAULT_COLOR_MAPPING: ColorMapping = {
  throughCut: '#FF0000',
  pocket: '#0000FF',
  engraving: '#00FF00',
  guideLine: '#000000'
};

export const DEFAULT_SVG_CONFIG: SvgExportConfig = {
  units: 'mm',
  scale: 1.0,
  colorMapping: DEFAULT_COLOR_MAPPING,
  lineWeight: 0.25,
  precision: 3,
  includeMetadata: true
};
```

#### OpenCascade Type Declarations (`src/types/opencascade.d.ts`)
```typescript
declare module 'opencascade.js' {
  interface OpenCascadeInstance {
    // Core geometric types
    gp_Pnt: any;
    gp_Vec: any;
    gp_Dir: any;
    gp_Pln: any;
    gp_Trsf: any;
    
    // Shape types
    TopoDS_Shape: any;
    TopoDS_Face: any;
    TopoDS_Edge: any;
    TopoDS_Wire: any;
    TopoDS_Vertex: any;
    
    // STEP I/O
    STEPControl_Reader: any;
    IFSelect_ReturnStatus: any;
    
    // Shape building
    BRepPrimAPI_MakeBox: any;
    BRepBuilderAPI_MakeEdge: any;
    BRepBuilderAPI_MakeWire: any;
    BRepBuilderAPI_MakeFace: any;
    BRepBuilderAPI_Transform: any;
    
    // Geometric algorithms
    BRepAlgoAPI_Section: any;
    GeomAPI_IntCS: any;
    Geom_Plane: any;
    Handle_Geom_Surface: any;
    
    // Topology exploration
    TopExp_Explorer: any;
    TopAbs_ShapeEnum: any;
    
    // Bounding box
    Bnd_Box: any;
    BRepBndLib: any;
    
    // Memory management
    Standard_Transient: any;
  }

  function opencascade(): Promise<OpenCascadeInstance>;
  export = opencascade;
}
```

### 5.2 State Management Architecture

#### Global State Structure
```typescript
// App.tsx - Main application state
interface AppState {
  // File processing state
  stepFile: StepFile | null;
  geometry: THREE.BufferGeometry | undefined;
  boundingBox: BoundingBox | undefined;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isExporting: boolean;
  
  // 3D viewer state
  renderMode: 'wireframe' | 'solid' | 'translucent';
  showCuttingPlane: boolean;
  
  // Profile extraction state
  profileConfig: ProfileConfig;
  profiles: ExtractedProfile[];
  
  // Export configuration
  exportConfig: SvgExportConfig;
}
```

#### State Update Patterns
```typescript
// File upload state updates
const handleFileUpload = useCallback(async (file: File) => {
  setIsLoading(true);
  setError(null);
  
  try {
    // 1. Create STEP file object
    const stepFileObj: StepFile = {
      id: Date.now().toString(),
      filename: file.name,
      size: file.size,
      uploadDate: new Date(),
      entities: [],
      boundingBox: { /* ... */ }
    };
    
    // 2. Update state
    setStepFile(stepFileObj);
    
    // 3. Process file (async)
    const { geometry, boundingBox } = await processStepFile(file);
    
    // 4. Update geometry state
    setGeometry(geometry);
    setBoundingBox(boundingBox);
    
    // 5. Update profile config with new bounds
    setProfileConfig(prev => ({
      ...prev,
      position: boundingBox.center.z,
      origin: boundingBox.center
    }));
    
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Processing failed');
  } finally {
    setIsLoading(false);
  }
}, []);
```

### 5.3 Component Implementation Details

#### 5.3.1 FileUpload Component (`src/components/FileUpload.tsx`)

**Purpose**: Handles file drag-and-drop and validation

**Key Features**:
- Drag and drop interface using react-dropzone
- File type validation (.step, .stp)
- File size validation (100MB limit)
- Visual feedback for drag states
- Error handling and user feedback

**Implementation Details**:
```typescript
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Typography, Paper } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // File size validation (100MB = 104,857,600 bytes)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size exceeds 100MB limit');
        return;
      }
      
      // File extension validation
      const validExtensions = ['.step', '.stp'];
      const fileExtension = file.name.toLowerCase().slice(-5);
      if (!validExtensions.some(ext => fileExtension.endsWith(ext))) {
        alert('Please upload a STEP file (.step or .stp)');
        return;
      }
      
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/step': ['.step', '.stp']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <Paper
      {...getRootProps()}
      data-testid="file-upload"
      style={{
        width: '800px',
        height: '100px',
        border: '2px dashed #ccc',
        borderColor: isDragActive ? '#1976d2' : '#ccc',
        backgroundColor: isDragActive ? '#f5f5f5' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input {...getInputProps()} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <CloudUpload style={{ fontSize: 40, color: '#888' }} />
        <div>
          <Typography variant="h6" color="textPrimary">
            {isDragActive ? 'Drop the STEP file here' : 'Drag & drop STEP file here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select (max 100MB)
          </Typography>
        </div>
      </div>
    </Paper>
  );
};

export default FileUpload;
```

**Styling Considerations**:
- Use inline styles instead of `sx` props to avoid Material-UI v5 type complexity issues
- Border color changes based on drag state
- Disabled state handling with opacity changes
- Responsive design considerations for 800px width

**Error Handling**:
- File size validation with user-friendly error messages
- File type validation with clear guidance
- Graceful degradation when drag-and-drop not supported

#### 5.3.2 Viewer3D Component (`src/components/Viewer3D.tsx`)

**Purpose**: Renders 3D STEP geometry with interactive camera controls

**Key Features**:
- Three.js integration via React Three Fiber
- Custom OrbitControls implementation
- Multiple render modes (wireframe, solid, translucent)
- Cutting plane visualization
- Grid helper for spatial reference
- Bounding box visualization

**Implementation Details**:
```typescript
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Paper } from '@mui/material';

// Import OrbitControls directly from Three.js to avoid drei dependency
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Extend React Three Fiber catalog
extend({ OrbitControls });

// Custom OrbitControls component to avoid @react-three/drei dependency
function Controls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>();
  
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      // Configure controls as per PRD requirements
      controls.minDistance = 0.1;
      controls.maxDistance = 100;
      controls.minPolarAngle = 0;          // 0 degrees
      controls.maxPolarAngle = Math.PI;    // 180 degrees
      controls.minAzimuthAngle = -Math.PI; // -180 degrees
      controls.maxAzimuthAngle = Math.PI;  // +180 degrees
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }
  }, []);
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  
  return (
    // @ts-ignore - TypeScript doesn't recognize extended components
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
}

interface Viewer3DProps {
  geometry?: THREE.BufferGeometry;
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  cuttingPlane?: {
    position: number;
    normal: { x: number; y: number; z: number };
    visible: boolean;
  };
  renderMode: 'wireframe' | 'solid' | 'translucent';
}

const SceneContent: React.FC<{
  geometry?: THREE.BufferGeometry;
  boundingBox?: Viewer3DProps['boundingBox'];
  cuttingPlane?: Viewer3DProps['cuttingPlane'];
  renderMode: Viewer3DProps['renderMode'];
}> = ({ geometry, boundingBox, cuttingPlane, renderMode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const planeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Animation updates if needed
  });

  // Material factory based on render mode
  const getMaterial = () => {
    switch (renderMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ 
          color: 0x00ff00, 
          wireframe: true 
        });
      case 'solid':
        return new THREE.MeshLambertMaterial({ 
          color: 0x888888,
          side: THREE.DoubleSide
        });
      case 'translucent':
        return new THREE.MeshLambertMaterial({ 
          color: 0x888888,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
      default:
        return new THREE.MeshBasicMaterial({ color: 0x888888 });
    }
  };

  return (
    <>
      {/* Lighting setup for proper material rendering */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      
      {/* Grid helper for spatial reference */}
      <gridHelper args={[100, 100]} />
      
      {/* Main 3D geometry */}
      {geometry && (
        <mesh ref={meshRef} geometry={geometry} material={getMaterial()} />
      )}
      
      {/* Cutting plane visualization */}
      {cuttingPlane && cuttingPlane.visible && boundingBox && (
        <mesh ref={planeRef}>
          <planeGeometry 
            args={[
              Math.abs(boundingBox.max.x - boundingBox.min.x),
              Math.abs(boundingBox.max.z - boundingBox.min.z)
            ]} 
          />
          <meshBasicMaterial 
            color={0xff6666} 
            transparent 
            opacity={0.3} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Bounding box wireframe */}
      {boundingBox && (
        <lineSegments>
          <edgesGeometry 
            args={[
              new THREE.BoxGeometry(
                boundingBox.max.x - boundingBox.min.x,
                boundingBox.max.y - boundingBox.min.y,
                boundingBox.max.z - boundingBox.min.z
              )
            ]} 
          />
          <lineBasicMaterial color={0x444444} />
        </lineSegments>
      )}
    </>
  );
};

const Viewer3D: React.FC<Viewer3DProps> = ({ 
  geometry, 
  boundingBox, 
  cuttingPlane, 
  renderMode 
}) => {
  return (
    <Paper 
      data-testid="3d-viewer"
      sx={{ 
        width: '100%', 
        height: '600px',
        minHeight: '600px',
        minWidth: '800px',
        overflow: 'hidden'
      }}
    >
      <Canvas
        camera={{ 
          position: [5, 5, 5], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Controls />
        
        <SceneContent 
          geometry={geometry}
          boundingBox={boundingBox}
          cuttingPlane={cuttingPlane}
          renderMode={renderMode}
        />
      </Canvas>
    </Paper>
  );
};

export default Viewer3D;
```

**Critical Implementation Notes**:
1. **OrbitControls Implementation**: Custom implementation to avoid @react-three/drei dependency conflicts
2. **Material Management**: Dynamic material creation based on render mode
3. **Performance**: useFrame hook for animations, refs for direct Three.js object access
4. **Memory Management**: Proper cleanup of Three.js objects in useEffect cleanup functions

#### 5.3.3 ProfilePanel Component (`src/components/ProfilePanel.tsx`)

**Purpose**: Controls for profile extraction configuration

**Key Features**:
- Plane orientation selection (XY, XZ, YZ, custom)
- Position controls with sliders and numeric input
- Tolerance and simplification settings
- 2D profile preview
- Cutting plane visibility toggle

**Implementation Details**:
```typescript
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import { 
  CropFree, 
  Add, 
  Remove,
  Visibility,
  VisibilityOff 
} from '@mui/icons-material';
import { ProfileConfig } from '../types';

interface ProfilePanelProps {
  config: ProfileConfig;
  onConfigChange: (config: ProfileConfig) => void;
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  onExtractProfile: () => void;
  showCuttingPlane: boolean;
  onToggleCuttingPlane: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  config,
  onConfigChange,
  boundingBox,
  onExtractProfile,
  showCuttingPlane,
  onToggleCuttingPlane
}) => {
  const [customNormal, setCustomNormal] = useState({ x: 0, y: 1, z: 0 });

  // Plane type change handler with automatic position calculation
  const handlePlaneTypeChange = (planeType: ProfileConfig['planeType']) => {
    let normal = { x: 0, y: 1, z: 0 };
    let defaultPosition = 0;

    if (boundingBox) {
      switch (planeType) {
        case 'XY':
          normal = { x: 0, y: 0, z: 1 };
          defaultPosition = (boundingBox.min.z + boundingBox.max.z) / 2;
          break;
        case 'XZ':
          normal = { x: 0, y: 1, z: 0 };
          defaultPosition = (boundingBox.min.y + boundingBox.max.y) / 2;
          break;
        case 'YZ':
          normal = { x: 1, y: 0, z: 0 };
          defaultPosition = (boundingBox.min.x + boundingBox.max.x) / 2;
          break;
        case 'CUSTOM':
          normal = customNormal;
          break;
      }
    }

    onConfigChange({
      ...config,
      planeType,
      normal,
      position: defaultPosition
    });
  };

  // Position update handler
  const handlePositionChange = (position: number) => {
    onConfigChange({
      ...config,
      position
    });
  };

  // Calculate position range based on plane type and bounding box
  const getPositionRange = () => {
    if (!boundingBox) return { min: -100, max: 100 };
    
    switch (config.planeType) {
      case 'XY':
        return { min: boundingBox.min.z, max: boundingBox.max.z };
      case 'XZ':
        return { min: boundingBox.min.y, max: boundingBox.max.y };
      case 'YZ':
        return { min: boundingBox.min.x, max: boundingBox.max.x };
      default:
        return { min: -100, max: 100 };
    }
  };

  const positionRange = getPositionRange();

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Profile Selection
      </Typography>
      
      {/* Plane Orientation Controls */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cutting Plane Orientation
        </Typography>
        <ButtonGroup variant="outlined" fullWidth>
          <Button
            variant={config.planeType === 'XY' ? 'contained' : 'outlined'}
            onClick={() => handlePlaneTypeChange('XY')}
            sx={{ width: '40px', height: '40px' }}
          >
            XY
          </Button>
          <Button
            variant={config.planeType === 'XZ' ? 'contained' : 'outlined'}
            onClick={() => handlePlaneTypeChange('XZ')}
            sx={{ width: '40px', height: '40px' }}
          >
            XZ
          </Button>
          <Button
            variant={config.planeType === 'YZ' ? 'contained' : 'outlined'}
            onClick={() => handlePlaneTypeChange('YZ')}
            sx={{ width: '40px', height: '40px' }}
          >
            YZ
          </Button>
          <Button
            variant={config.planeType === 'CUSTOM' ? 'contained' : 'outlined'}
            onClick={() => handlePlaneTypeChange('CUSTOM')}
            sx={{ width: '40px', height: '40px' }}
          >
            <CropFree />
          </Button>
        </ButtonGroup>
      </Box>

      {/* Custom Normal Vector Input */}
      {config.planeType === 'CUSTOM' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Custom Normal Vector
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="X"
              type="number"
              size="small"
              value={customNormal.x}
              onChange={(e) => {
                const newNormal = { ...customNormal, x: parseFloat(e.target.value) || 0 };
                setCustomNormal(newNormal);
                onConfigChange({ ...config, normal: newNormal });
              }}
              inputProps={{ step: 0.1 }}
            />
            <TextField
              label="Y"
              type="number"
              size="small"
              value={customNormal.y}
              onChange={(e) => {
                const newNormal = { ...customNormal, y: parseFloat(e.target.value) || 0 };
                setCustomNormal(newNormal);
                onConfigChange({ ...config, normal: newNormal });
              }}
              inputProps={{ step: 0.1 }}
            />
            <TextField
              label="Z"
              type="number"
              size="small"
              value={customNormal.z}
              onChange={(e) => {
                const newNormal = { ...customNormal, z: parseFloat(e.target.value) || 0 };
                setCustomNormal(newNormal);
                onConfigChange({ ...config, normal: newNormal });
              }}
              inputProps={{ step: 0.1 }}
            />
          </Box>
        </Box>
      )}

      {/* Position Controls */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Position ({positionRange.min.toFixed(1)} to {positionRange.max.toFixed(1)} mm)
        </Typography>
        
        {/* Numeric input with step buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton
            onClick={() => handlePositionChange(config.position - 10)}
            size="small"
          >
            <Remove />
          </IconButton>
          <TextField
            type="number"
            size="small"
            value={config.position.toFixed(3)}
            onChange={(e) => handlePositionChange(parseFloat(e.target.value) || 0)}
            inputProps={{ 
              step: 0.001,
              min: positionRange.min,
              max: positionRange.max
            }}
            sx={{ width: '120px' }}
          />
          <IconButton
            onClick={() => handlePositionChange(config.position + 10)}
            size="small"
          >
            <Add />
          </IconButton>
        </Box>
        
        {/* Slider for fine control */}
        <Slider
          value={config.position}
          onChange={(_, value) => handlePositionChange(value as number)}
          min={positionRange.min}
          max={positionRange.max}
          step={0.1}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value.toFixed(1)}mm`}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Extraction Settings */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Extraction Settings
        </Typography>
        
        <TextField
          label="Tolerance (mm)"
          type="number"
          size="small"
          fullWidth
          value={config.tolerance}
          onChange={(e) => onConfigChange({
            ...config,
            tolerance: parseFloat(e.target.value) || 0.01
          })}
          inputProps={{ step: 0.001, min: 0.001, max: 1 }}
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth size="small">
          <InputLabel>Simplification</InputLabel>
          <Select
            value={config.simplification ? 'true' : 'false'}
            onChange={(e) => onConfigChange({
              ...config,
              simplification: e.target.value === 'true'
            })}
          >
            <MenuItem value="true">Enabled</MenuItem>
            <MenuItem value="false">Disabled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Cutting Plane Visibility Toggle */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={showCuttingPlane ? <VisibilityOff /> : <Visibility />}
          onClick={onToggleCuttingPlane}
        >
          {showCuttingPlane ? 'Hide' : 'Show'} Cutting Plane
        </Button>
      </Box>

      {/* 2D Profile Preview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            2D Profile Preview
          </Typography>
          <Box 
            sx={{ 
              width: '100%', 
              height: '200px', 
              backgroundColor: 'grey.100',
              border: '1px solid',
              borderColor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Preview will appear here
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Extract Profile Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={onExtractProfile}
        disabled={!boundingBox}
      >
        Extract Profile
      </Button>
    </Paper>
  );
};

export default ProfilePanel;
```

**Key Implementation Notes**:
1. **Plane Calculations**: Automatic position calculation based on bounding box
2. **Range Validation**: Position sliders respect geometry bounds
3. **State Synchronization**: Custom normal vector state management
4. **Material-UI v5 Compatibility**: String values for Select components to avoid type issues

#### 5.3.4 ExportPanel Component (`src/components/ExportPanel.tsx`)

**Purpose**: SVG export configuration and download functionality

**Key Features**:
- Export configuration (units, scale, precision)
- Color mapping for Shaper Origin
- Advanced settings panel
- Profile status display
- SVG download functionality

**Implementation Details**:
```typescript
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import {
  Download,
  Settings,
  ExpandMore,
  Palette
} from '@mui/icons-material';
import { SvgExportConfig, DEFAULT_SVG_CONFIG, ExtractedProfile } from '../types';

interface ExportPanelProps {
  config: SvgExportConfig;
  onConfigChange: (config: SvgExportConfig) => void;
  profiles: ExtractedProfile[];
  onExport: () => void;
  isExporting: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  config,
  onConfigChange,
  profiles,
  onExport,
  isExporting
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Color mapping change handler
  const handleColorChange = (colorType: keyof typeof config.colorMapping, color: string) => {
    onConfigChange({
      ...config,
      colorMapping: {
        ...config.colorMapping,
        [colorType]: color
      }
    });
  };

  // Reset to default configuration
  const resetToDefaults = () => {
    onConfigChange(DEFAULT_SVG_CONFIG);
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* Profile Status Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1">
          {profiles.length} profile{profiles.length !== 1 ? 's' : ''} ready
        </Typography>
        
        {profiles.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {profiles.map((profile, index) => (
              <Chip
                key={profile.id}
                label={`Profile ${index + 1}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Export Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Units Selection */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Units</InputLabel>
          <Select
            value={config.units}
            label="Units"
            onChange={(e) => onConfigChange({
              ...config,
              units: e.target.value as 'mm' | 'inches'
            })}
          >
            <MenuItem value="mm">Millimeters</MenuItem>
            <MenuItem value="inches">Inches</MenuItem>
          </Select>
        </FormControl>

        {/* Scale Input */}
        <TextField
          label="Scale"
          type="number"
          size="small"
          value={config.scale}
          onChange={(e) => onConfigChange({
            ...config,
            scale: parseFloat(e.target.value) || 1.0
          })}
          inputProps={{ step: 0.1, min: 0.1, max: 10 }}
          sx={{ width: '100px' }}
        />

        {/* Advanced Settings Toggle */}
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Settings
        </Button>

        {/* Export Button */}
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={onExport}
          disabled={profiles.length === 0 || isExporting}
          sx={{ minWidth: '120px' }}
        >
          {isExporting ? 'Exporting...' : 'Export SVG'}
        </Button>
      </Box>

      {/* Advanced Settings Panel */}
      {showAdvanced && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: '90px',
            right: '16px',
            width: '400px',
            maxHeight: '500px',
            overflow: 'auto',
            zIndex: 1000,
            p: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Export Settings
          </Typography>

          {/* Color Mapping Accordion */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette />
                <Typography>Color Mapping</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Through Cut"
                    type="color"
                    size="small"
                    fullWidth
                    value={config.colorMapping.throughCut}
                    onChange={(e) => handleColorChange('throughCut', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Pocket"
                    type="color"
                    size="small"
                    fullWidth
                    value={config.colorMapping.pocket}
                    onChange={(e) => handleColorChange('pocket', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Engraving"
                    type="color"
                    size="small"
                    fullWidth
                    value={config.colorMapping.engraving}
                    onChange={(e) => handleColorChange('engraving', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Guide Line"
                    type="color"
                    size="small"
                    fullWidth
                    value={config.colorMapping.guideLine}
                    onChange={(e) => handleColorChange('guideLine', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Additional Settings */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Line Weight (mm)"
              type="number"
              size="small"
              fullWidth
              value={config.lineWeight}
              onChange={(e) => onConfigChange({
                ...config,
                lineWeight: parseFloat(e.target.value) || 0.25
              })}
              inputProps={{ step: 0.05, min: 0.1, max: 2.0 }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Precision (decimal places)"
              type="number"
              size="small"
              fullWidth
              value={config.precision}
              onChange={(e) => onConfigChange({
                ...config,
                precision: parseInt(e.target.value) || 3
              })}
              inputProps={{ min: 1, max: 6 }}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Include Metadata</InputLabel>
              <Select
                value={config.includeMetadata ? 'true' : 'false'}
                label="Include Metadata"
                onChange={(e) => onConfigChange({
                  ...config,
                  includeMetadata: e.target.value === 'true'
                })}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Information Alert */}
          <Alert severity="info" sx={{ mb: 2 }}>
            These settings optimize SVG output for Shaper Origin CNC machining.
          </Alert>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={resetToDefaults}
              size="small"
            >
              Reset Defaults
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowAdvanced(false)}
              size="small"
            >
              Close
            </Button>
          </Box>
        </Paper>
      )}
    </Paper>
  );
};

export default ExportPanel;
```

---

## 6. File Processing Pipeline

### 6.1 STEP File Parser (`src/utils/stepParser.ts`)

**Purpose**: Parse and validate STEP files using OpenCascade.js

**Key Functions**:
- File format validation
- Entity parsing and validation
- Geometry loading
- Error handling

**Implementation**:
```typescript
import opencascade from 'opencascade.js';
import { StepFile, StepEntity, BoundingBox } from '../types';

// OpenCascade.js singleton instance
let occt: any = null;

export const initializeOpenCascade = async (): Promise<void> => {
  if (!occt) {
    occt = await opencascade();
  }
};

// STEP file format validation
export const validateStepFile = (content: string): boolean => {
  const requiredSections = [
    'ISO-10303-21',
    'HEADER',
    'FILE_DESCRIPTION',
    'FILE_NAME',
    'FILE_SCHEMA',
    'ENDSEC',
    'DATA'
  ];

  return requiredSections.every(section => 
    content.toUpperCase().includes(section.toUpperCase())
  );
};

// Parse STEP entities from file content
export const parseStepEntities = (content: string): StepEntity[] => {
  const entities: StepEntity[] = [];
  
  // Extract DATA section
  const dataSection = content.substring(
    content.indexOf('DATA;') + 5,
    content.indexOf('ENDSEC;', content.indexOf('DATA;'))
  );

  // Entity parsing regex
  const entityRegex = /#(\d+)\s*=\s*([A-Z_]+)\s*\((.*?)\)\s*;/g;
  let match;

  while ((match = entityRegex.exec(dataSection)) !== null) {
    const [, id, type, params] = match;
    
    // Parse parameters
    const parameters = params.split(',').map(param => param.trim());
    
    // Extract entity references
    const references: number[] = [];
    parameters.forEach(param => {
      const refMatch = param.match(/#(\d+)/g);
      if (refMatch) {
        refMatch.forEach(ref => {
          references.push(parseInt(ref.substring(1)));
        });
      }
    });

    entities.push({
      id: parseInt(id),
      type,
      parameters,
      references
    });
  }

  return entities;
};

// Supported STEP entities as per PRD
export const SUPPORTED_ENTITIES = [
  'CARTESIAN_POINT',
  'CIRCLE',
  'LINE',
  'CYLINDRICAL_SURFACE',
  'PLANE',
  'CONICAL_SURFACE',
  'SPHERICAL_SURFACE',
  'B_SPLINE_SURFACE',
  'B_SPLINE_CURVE',
  'COMPOSITE_CURVE',
  'ADVANCED_BREP_SHAPE_REPRESENTATION',
  'MANIFOLD_SOLID_BREP'
];

// Entity support validation
export const isEntitySupported = (entityType: string): boolean => {
  return SUPPORTED_ENTITIES.includes(entityType.toUpperCase());
};

// Main STEP file processing function
export const parseStepFile = async (file: File): Promise<StepFile> => {
  await initializeOpenCascade();
  
  const content = await file.text();
  
  // Validate file format
  if (!validateStepFile(content)) {
    throw new Error('Invalid STEP file format');
  }

  // Parse entities
  const entities = parseStepEntities(content);
  
  // Validate entity support
  const validation = validateStepEntities(entities);
  if (!validation.valid) {
    console.warn('Unsupported entities found:', validation.unsupportedEntities);
  }

  // Calculate bounding box (simplified implementation)
  const boundingBox: BoundingBox = {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
    center: { x: 0, y: 0, z: 0 },
    dimensions: { x: 20, y: 20, z: 20 }
  };

  return {
    id: Date.now().toString(),
    filename: file.name,
    size: file.size,
    uploadDate: new Date(),
    entities,
    boundingBox
  };
};

// Entity validation function
export const validateStepEntities = (entities: StepEntity[]): { 
  valid: boolean; 
  unsupportedEntities: string[] 
} => {
  const unsupportedEntities: string[] = [];
  
  entities.forEach(entity => {
    if (!isEntitySupported(entity.type)) {
      if (!unsupportedEntities.includes(entity.type)) {
        unsupportedEntities.push(entity.type);
      }
    }
  });

  return {
    valid: unsupportedEntities.length === 0,
    unsupportedEntities
  };
};
```

### 6.2 Profile Extraction (`src/utils/profileExtractor.ts`)

**Purpose**: Extract 2D profiles from 3D geometry using cutting planes

**Key Algorithms**:
- Plane-geometry intersection
- Point-to-curve connection
- Curve simplification
- Bounding box calculation

**Implementation**:
```typescript
import * as THREE from 'three';
import { ProfileConfig, ExtractedProfile, Curve2D, Vector2, BoundingBox2D } from '../types';

// Create cutting plane from configuration
export const createCuttingPlane = (config: ProfileConfig): THREE.Plane => {
  const normal = new THREE.Vector3(config.normal.x, config.normal.y, config.normal.z);
  normal.normalize();
  
  // Calculate plane constant: ax + by + cz + d = 0
  const point = new THREE.Vector3(config.origin.x, config.origin.y, config.origin.z);
  point.addScaledVector(normal, config.position);
  
  return new THREE.Plane(normal, -normal.dot(point));
};

// Find intersection points between geometry and cutting plane
export const findIntersectionPoints = (
  geometry: THREE.BufferGeometry, 
  plane: THREE.Plane,
  tolerance: number = 0.01
): Vector2[] => {
  const intersectionPoints: Vector2[] = [];
  
  if (!geometry.attributes.position) {
    return intersectionPoints;
  }

  const positions = geometry.attributes.position.array;
  const indices = geometry.index ? geometry.index.array : null;

  // Process triangle intersections
  const processTriangle = (i1: number, i2: number, i3: number) => {
    const v1 = new THREE.Vector3(
      positions[i1 * 3], 
      positions[i1 * 3 + 1], 
      positions[i1 * 3 + 2]
    );
    const v2 = new THREE.Vector3(
      positions[i2 * 3], 
      positions[i2 * 3 + 1], 
      positions[i2 * 3 + 2]
    );
    const v3 = new THREE.Vector3(
      positions[i3 * 3], 
      positions[i3 * 3 + 1], 
      positions[i3 * 3 + 2]
    );

    // Check each triangle edge for plane intersection
    const edges = [[v1, v2], [v2, v3], [v3, v1]];

    edges.forEach(([start, end]) => {
      const intersection = new THREE.Vector3();
      const line = new THREE.Line3(start, end);
      
      if (plane.intersectLine(line, intersection)) {
        const projected = projectTo2D(intersection, plane);
        
        // Check for duplicates within tolerance
        const isDuplicate = intersectionPoints.some(point => 
          Math.abs(point.x - projected.x) < tolerance && 
          Math.abs(point.y - projected.y) < tolerance
        );
        
        if (!isDuplicate) {
          intersectionPoints.push(projected);
        }
      }
    });
  };

  // Process all triangles in geometry
  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      processTriangle(indices[i], indices[i + 1], indices[i + 2]);
    }
  } else {
    for (let i = 0; i < positions.length / 9; i++) {
      processTriangle(i * 3, i * 3 + 1, i * 3 + 2);
    }
  }

  return intersectionPoints;
};

// Project 3D point to 2D plane coordinates
export const projectTo2D = (point3d: THREE.Vector3, plane: THREE.Plane): Vector2 => {
  const normal = plane.normal.clone().normalize();
  
  // Create orthogonal basis vectors in the plane
  let u = new THREE.Vector3();
  let v = new THREE.Vector3();
  
  // Find vector not parallel to normal
  if (Math.abs(normal.x) < 0.9) {
    u.set(1, 0, 0);
  } else {
    u.set(0, 1, 0);
  }
  
  // Create orthogonal basis
  v.crossVectors(normal, u).normalize();
  u.crossVectors(v, normal).normalize();
  
  // Project to 2D coordinates
  return {
    x: point3d.dot(u),
    y: point3d.dot(v)
  };
};

// Connect intersection points into continuous curves
export const connectPointsToCurves = (
  points: Vector2[], 
  tolerance: number = 0.005
): Curve2D[] => {
  if (points.length < 2) return [];

  const curves: Curve2D[] = [];
  const usedPoints = new Set<number>();

  // Greedy curve building algorithm
  for (let i = 0; i < points.length; i++) {
    if (usedPoints.has(i)) continue;

    const curve: Curve2D = {
      type: 'line',
      points: [points[i]],
      closed: false
    };

    usedPoints.add(i);
    let currentPoint = points[i];

    // Find connected points
    let foundConnection = true;
    while (foundConnection) {
      foundConnection = false;
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      for (let j = 0; j < points.length; j++) {
        if (usedPoints.has(j)) continue;

        const distance = Math.sqrt(
          Math.pow(currentPoint.x - points[j].x, 2) + 
          Math.pow(currentPoint.y - points[j].y, 2)
        );

        if (distance < tolerance && distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = j;
        }
      }

      if (nearestIndex !== -1) {
        curve.points.push(points[nearestIndex]);
        usedPoints.add(nearestIndex);
        currentPoint = points[nearestIndex];
        foundConnection = true;
      }
    }

    // Check if curve is closed
    if (curve.points.length > 2) {
      const firstPoint = curve.points[0];
      const lastPoint = curve.points[curve.points.length - 1];
      const closingDistance = Math.sqrt(
        Math.pow(firstPoint.x - lastPoint.x, 2) + 
        Math.pow(firstPoint.y - lastPoint.y, 2)
      );
      
      if (closingDistance < tolerance) {
        curve.closed = true;
        curve.points.pop(); // Remove duplicate closing point
      }
    }

    if (curve.points.length > 1) {
      curves.push(curve);
    }
  }

  return curves;
};

// Simplify curves by removing redundant points
export const simplifyCurves = (
  curves: Curve2D[], 
  tolerance: number = 0.005
): Curve2D[] => {
  return curves.map(curve => {
    if (curve.points.length <= 2) return curve;

    const simplified: Vector2[] = [curve.points[0]];

    for (let i = 1; i < curve.points.length - 1; i++) {
      const prev = curve.points[i - 1];
      const current = curve.points[i];
      const next = curve.points[i + 1];

      // Check collinearity using cross product
      const isCollinear = isPointOnLine(prev, current, next, tolerance);
      
      if (!isCollinear) {
        simplified.push(current);
      }
    }

    // Always include last point for open curves
    if (!curve.closed) {
      simplified.push(curve.points[curve.points.length - 1]);
    }

    return {
      ...curve,
      points: simplified
    };
  });
};

// Check if point lies on line between two other points
const isPointOnLine = (
  p1: Vector2, 
  p2: Vector2, 
  p3: Vector2, 
  tolerance: number
): boolean => {
  const lineLength = Math.sqrt(
    Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2)
  );
  
  if (lineLength < tolerance) return true;

  // Distance from point to line using cross product
  const distance = Math.abs(
    (p3.y - p1.y) * p2.x - (p3.x - p1.x) * p2.y + p3.x * p1.y - p3.y * p1.x
  ) / lineLength;

  return distance < tolerance;
};

// Calculate 2D bounding box for curves
export const calculate2DBoundingBox = (curves: Curve2D[]): BoundingBox2D => {
  if (curves.length === 0 || curves.every(curve => curve.points.length === 0)) {
    return {
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
      center: { x: 0, y: 0 },
      dimensions: { x: 0, y: 0 }
    };
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  curves.forEach(curve => {
    curve.points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY },
    center: { x: centerX, y: centerY },
    dimensions: { x: maxX - minX, y: maxY - minY }
  };
};

// Calculate profile metrics (area and perimeter)
export const calculateProfileMetrics = (curves: Curve2D[]): { area: number; length: number } => {
  let totalLength = 0;
  let totalArea = 0;

  curves.forEach(curve => {
    // Calculate curve length
    for (let i = 0; i < curve.points.length - 1; i++) {
      const p1 = curve.points[i];
      const p2 = curve.points[i + 1];
      totalLength += Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
    }

    // Add closing segment for closed curves
    if (curve.closed && curve.points.length > 2) {
      const first = curve.points[0];
      const last = curve.points[curve.points.length - 1];
      totalLength += Math.sqrt(
        Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
      );

      // Calculate area using shoelace formula
      let area = 0;
      for (let i = 0; i < curve.points.length; i++) {
        const j = (i + 1) % curve.points.length;
        area += curve.points[i].x * curve.points[j].y;
        area -= curve.points[j].x * curve.points[i].y;
      }
      totalArea += Math.abs(area) / 2;
    }
  });

  return { area: totalArea, length: totalLength };
};

// Main profile extraction function
export const extractProfile = (
  geometry: THREE.BufferGeometry,
  config: ProfileConfig
): ExtractedProfile => {
  // Create cutting plane
  const plane = createCuttingPlane(config);

  // Find intersection points
  const intersectionPoints = findIntersectionPoints(geometry, plane, config.tolerance);

  // Connect points to curves
  let curves = connectPointsToCurves(intersectionPoints, config.tolerance);

  // Apply simplification if enabled
  if (config.simplification) {
    curves = simplifyCurves(curves, config.tolerance);
  }

  // Calculate metrics
  const boundingBox = calculate2DBoundingBox(curves);
  const { area, length } = calculateProfileMetrics(curves);

  return {
    id: Date.now().toString(),
    curves,
    boundingBox,
    area,
    length
  };
};
```

### 6.3 SVG Export System (`src/utils/svgExporter.ts`)

**Purpose**: Generate SVG files optimized for Shaper Origin CNC machining

**Key Features**:
- Shaper Origin color coding
- Proper SVG structure and metadata
- Unit conversion and scaling
- Path optimization

**Implementation**:
```typescript
import { ExtractedProfile, SvgExportConfig, Curve2D } from '../types';

// Generate SVG path data from 2D curves
export const generateSvgPath = (curve: Curve2D, precision: number = 3): string => {
  if (curve.points.length === 0) return '';

  const formatNumber = (num: number): string => {
    return num.toFixed(precision);
  };

  let pathData = '';

  // Move to first point
  const firstPoint = curve.points[0];
  pathData += `M ${formatNumber(firstPoint.x)} ${formatNumber(firstPoint.y)}`;

  // Add line segments
  for (let i = 1; i < curve.points.length; i++) {
    const point = curve.points[i];
    pathData += ` L ${formatNumber(point.x)} ${formatNumber(point.y)}`;
  }

  // Close path if curve is closed
  if (curve.closed) {
    pathData += ' Z';
  }

  return pathData;
};

// Determine curve type based on characteristics
export const determineCurveType = (curve: Curve2D): 'throughCut' | 'pocket' | 'engraving' | 'guideLine' => {
  if (curve.closed) {
    // Closed curves: through cuts or pockets based on area
    const area = calculateCurveArea(curve);
    return area > 10 ? 'throughCut' : 'pocket';
  } else {
    // Open curves: engraving or guide lines based on length
    const length = calculateCurveLength(curve);
    return length > 50 ? 'engraving' : 'guideLine';
  }
};

// Calculate curve area using shoelace formula
const calculateCurveArea = (curve: Curve2D): number => {
  if (!curve.closed || curve.points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < curve.points.length; i++) {
    const j = (i + 1) % curve.points.length;
    area += curve.points[i].x * curve.points[j].y;
    area -= curve.points[j].x * curve.points[i].y;
  }
  return Math.abs(area) / 2;
};

// Calculate curve length
const calculateCurveLength = (curve: Curve2D): number => {
  let length = 0;
  
  for (let i = 0; i < curve.points.length - 1; i++) {
    const p1 = curve.points[i];
    const p2 = curve.points[i + 1];
    length += Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
  }

  // Add closing segment if closed
  if (curve.closed && curve.points.length > 2) {
    const first = curve.points[0];
    const last = curve.points[curve.points.length - 1];
    length += Math.sqrt(
      Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
    );
  }

  return length;
};

// Calculate overall bounding box for all profiles
const calculateOverallBoundingBox = (profiles: ExtractedProfile[]) => {
  if (profiles.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  profiles.forEach(profile => {
    minX = Math.min(minX, profile.boundingBox.min.x);
    maxX = Math.max(maxX, profile.boundingBox.max.x);
    minY = Math.min(minY, profile.boundingBox.min.y);
    maxY = Math.max(maxY, profile.boundingBox.max.y);
  });

  return { minX, minY, maxX, maxY };
};

// Unit conversion helper
const convertUnits = (value: number, fromMm: boolean, toInches: boolean): number => {
  if (fromMm && toInches) {
    return value / 25.4; // mm to inches
  } else if (!fromMm && !toInches) {
    return value * 25.4; // inches to mm
  }
  return value;
};

// Generate SVG metadata
const generateMetadata = (
  profiles: ExtractedProfile[], 
  config: SvgExportConfig,
  filename?: string
): string => {
  if (!config.includeMetadata) return '';

  return `
  <metadata>
    <title>STEP to SVG Profile Export</title>
    <description>Generated profiles from ${filename || 'STEP file'} for Shaper Origin CNC</description>
    <creator>STEP-to-SVG Converter</creator>
    <date>${new Date().toISOString()}</date>
    <profiles>${profiles.length}</profiles>
    <units>${config.units}</units>
    <scale>${config.scale}</scale>
  </metadata>`;
};

// Main SVG export function
export const exportToSvg = (
  profiles: ExtractedProfile[],
  config: SvgExportConfig,
  filename?: string
): string => {
  if (profiles.length === 0) {
    throw new Error('No profiles to export');
  }

  // Calculate overall bounding box
  const bbox = calculateOverallBoundingBox(profiles);
  
  // Apply scaling and unit conversion
  const scale = config.scale;
  const isMetric = config.units === 'mm';
  
  const convertCoord = (value: number) => {
    let converted = value * scale;
    if (!isMetric) {
      converted = convertUnits(converted, true, true);
    }
    return converted;
  };

  const width = convertCoord(bbox.maxX - bbox.minX);
  const height = convertCoord(bbox.maxY - bbox.minY);
  const viewBoxMinX = convertCoord(bbox.minX);
  const viewBoxMinY = convertCoord(bbox.minY);

  // Start SVG document
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width.toFixed(config.precision)}${config.units}"
     height="${height.toFixed(config.precision)}${config.units}"
     viewBox="${viewBoxMinX.toFixed(config.precision)} ${viewBoxMinY.toFixed(config.precision)} ${width.toFixed(config.precision)} ${height.toFixed(config.precision)}"
     version="1.1">`;

  // Add metadata
  svg += generateMetadata(profiles, config, filename);

  // Add profiles as groups
  profiles.forEach((profile, profileIndex) => {
    svg += `
  <g id="profile-${profileIndex + 1}" class="profile">`;

    profile.curves.forEach((curve, curveIndex) => {
      const curveType = determineCurveType(curve);
      const color = config.colorMapping[curveType];
      const pathData = generateSvgPath(curve, config.precision);

      // Scale path coordinates
      const scaledPathData = pathData.replace(/(-?\d+\.?\d*)/g, (match) => {
        const value = parseFloat(match);
        return convertCoord(value).toFixed(config.precision);
      });

      svg += `
    <path id="profile-${profileIndex + 1}-curve-${curveIndex + 1}"
          class="${curveType}"
          d="${scaledPathData}"
          stroke="${color}"
          stroke-width="${config.lineWeight}"
          fill="none"
          vector-effect="non-scaling-stroke" />`;
    });

    svg += `
  </g>`;
  });

  // Add style definitions for Shaper Origin compatibility
  svg += `
  <defs>
    <style type="text/css">
      <![CDATA[
        .throughCut { stroke: ${config.colorMapping.throughCut}; }
        .pocket { stroke: ${config.colorMapping.pocket}; }
        .engraving { stroke: ${config.colorMapping.engraving}; }
        .guideLine { stroke: ${config.colorMapping.guideLine}; }
        .profile { stroke-width: ${config.lineWeight}; fill: none; }
      ]]>
    </style>
  </defs>`;

  // Close SVG
  svg += `
</svg>`;

  return svg;
};

// Download SVG file
export const downloadSvg = (
  profiles: ExtractedProfile[],
  config: SvgExportConfig,
  filename: string = 'profile'
): void => {
  try {
    const svgContent = exportToSvg(profiles, config, filename);
    
    // Create blob and download
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/\.(step|stp)$/i, '')}_profile.svg`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting SVG:', error);
    throw new Error('Failed to export SVG file');
  }
};

// Validate SVG for Shaper Origin compatibility
export const validateSvgForShaperOrigin = (svgContent: string): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check required elements
  if (!svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    errors.push('Missing SVG namespace declaration');
  }

  if (!svgContent.includes('viewBox=')) {
    warnings.push('Missing viewBox attribute - may cause scaling issues');
  }

  // Check path commands
  const unsupportedCommands = svgContent.match(/[QSTAHV]/g);
  if (unsupportedCommands) {
    warnings.push('Contains potentially unsupported path commands');
  }

  // Validate colors
  const colorRegex = /#[0-9A-Fa-f]{6}/g;
  const colors = svgContent.match(colorRegex);
  if (!colors || colors.length === 0) {
    warnings.push('No valid hex colors found');
  }

  // Check line weights
  const strokeWidthRegex = /stroke-width="([^"]+)"/g;
  let match;
  while ((match = strokeWidthRegex.exec(svgContent)) !== null) {
    const width = parseFloat(match[1]);
    if (width < 0.1 || width > 2.0) {
      warnings.push(`Line weight ${width} may be outside optimal range (0.1-2.0mm)`);
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
};
```

---

## 7. Testing Strategy

### 7.1 Unit Testing (`src/utils/__tests__/`)

**Test Structure**:
```typescript
// stepParser.test.ts
describe('stepParser', () => {
  describe('validateStepFile', () => {
    it('should validate correct STEP format', () => {
      const validStep = `
        ISO-10303-21;
        HEADER;
        FILE_DESCRIPTION(('STEP file'),'2;1');
        ENDSEC;
        DATA;
        #1 = CARTESIAN_POINT('',(0.0,0.0,0.0));
        ENDSEC;
        END-ISO-10303-21;
      `;
      expect(validateStepFile(validStep)).toBe(true);
    });
    
    it('should reject invalid format', () => {
      expect(validateStepFile('not a step file')).toBe(false);
    });
  });
});

// svgExporter.test.ts
describe('svgExporter', () => {
  const mockProfile: ExtractedProfile = {
    id: 'test',
    curves: [{
      type: 'line',
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      closed: false
    }],
    boundingBox: { /* ... */ },
    area: 50,
    length: 30
  };

  it('should generate valid SVG', () => {
    const svg = exportToSvg([mockProfile], DEFAULT_SVG_CONFIG);
    expect(svg).toContain('<?xml version="1.0"');
    expect(svg).toContain('<svg xmlns=');
    expect(svg).toContain('</svg>');
  });
});
```

### 7.2 Integration Testing (Cypress)

**Test Configuration** (`cypress.config.ts`):
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true
  }
});
```

**E2E Test Examples** (`cypress/e2e/app.cy.ts`):
```typescript
describe('STEP to SVG Converter', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display main interface', () => {
    cy.contains('STEP to SVG Converter for Shaper Origin');
    cy.get('[data-testid="file-upload"]').should('be.visible');
  });

  it('should handle file upload workflow', () => {
    // Mock file upload
    cy.fixture('test.step').then(fileContent => {
      cy.get('input[type="file"]').selectFile({
        contents: fileContent,
        fileName: 'test.step'
      }, { force: true });
    });
    
    // Verify 3D viewer appears
    cy.get('[data-testid="3d-viewer"]').should('be.visible');
    
    // Test profile extraction
    cy.get('button').contains('Extract Profile').click();
    
    // Test export
    cy.get('button').contains('Export SVG').should('not.be.disabled');
  });
});
```

---

## 8. Performance Optimization

### 8.1 3D Rendering Optimization

**Memory Management**:
```typescript
// Geometry disposal in useEffect cleanup
useEffect(() => {
  return () => {
    if (geometry) {
      geometry.dispose();
    }
  };
}, [geometry]);

// Material disposal
const material = useMemo(() => {
  return new THREE.MeshLambertMaterial({ color: 0x888888 });
}, []);

useEffect(() => {
  return () => {
    material.dispose();
  };
}, [material]);
```

**Web Workers for Processing**:
```typescript
// worker.ts
self.onmessage = function(e) {
  const { stepFileContent, config } = e.data;
  
  // Process STEP file in worker thread
  const result = processStepFile(stepFileContent, config);
  
  self.postMessage(result);
};

// Main thread usage
const worker = new Worker('/worker.js');
worker.postMessage({ stepFileContent, config });
worker.onmessage = (e) => {
  const result = e.data;
  // Update UI with result
};
```

### 8.2 Bundle Optimization

**Code Splitting**:
```typescript
// Lazy load heavy components
const Viewer3D = React.lazy(() => import('./components/Viewer3D'));
const ProfilePanel = React.lazy(() => import('./components/ProfilePanel'));

// Usage with Suspense
<Suspense fallback={<CircularProgress />}>
  <Viewer3D geometry={geometry} />
</Suspense>
```

**Tree Shaking Configuration**:
```json
// package.json
{
  "sideEffects": false,
  "dependencies": {
    "three": "^0.158.0"
  }
}
```

---

## 9. Known Issues and Solutions

### 9.1 Dependency Compatibility Issues

**Issue**: React 19 + @react-three/fiber 8.x type conflicts
**Solution**: Use React 18.2.x with @react-three/fiber 8.15.x

**Issue**: Three.js 0.177 + @react-three/fiber 8.x missing exports
**Solution**: Use Three.js 0.158.x for compatibility

**Issue**: @react-three/drei + Three.js 0.158 dependency conflicts  
**Solution**: Remove @react-three/drei, implement custom OrbitControls

### 9.2 Material-UI Type Complexity

**Issue**: TypeScript union type complexity with sx props
**Solution**: Use inline styles instead of sx props for complex objects

```typescript
// ❌ Problematic
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

// ✅ Solution
<Box style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
```

### 9.3 OpenCascade.js Integration

**Issue**: Missing TypeScript declarations
**Solution**: Create custom type declaration file

```typescript
// src/types/opencascade.d.ts
declare module 'opencascade.js' {
  interface OpenCascadeInstance {
    // Add required type definitions
  }
  function opencascade(): Promise<OpenCascadeInstance>;
  export = opencascade;
}
```

---

## 10. Future Enhancement Roadmap

### 10.1 Phase 1: Core Functionality Enhancement
- Real OpenCascade.js STEP parsing implementation
- Advanced profile extraction algorithms
- Multi-threaded processing with Web Workers
- Enhanced error handling and user feedback

### 10.2 Phase 2: Advanced Features
- Multiple cutting plane support
- Profile merging and boolean operations
- Custom toolpath generation
- Advanced SVG optimization

### 10.3 Phase 3: Production Features
- User authentication and file storage
- Batch processing capabilities
- API integration with Shaper Origin cloud
- Advanced CAM features

---

## 11. Deployment Considerations

### 11.1 Build Optimization
```bash
# Production build with optimizations
npm run build

# Bundle analysis
npm install --global webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### 11.2 Environment Variables
```bash
# .env.production
REACT_APP_API_URL=https://api.production.com
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_VERSION=$npm_package_version
```

### 11.3 CDN Configuration
```json
// package.json
{
  "homepage": "https://cdn.example.com/step-to-svg/"
}
```

---

## 12. Development Workflow

### 12.1 Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
gh pr create --title "Add new feature" --body "Description"
```

### 12.2 Code Quality
```bash
# Type checking
npm run typecheck

# Testing
npm run test:coverage

# E2E testing  
npm run cypress:run

# Full validation
npm run validate
```

### 12.3 Debugging Setup
```typescript
// Debug configuration
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = {
    geometry,
    profiles,
    exportConfig
  };
}
```

---

This engineering document provides comprehensive guidance for rebuilding, refactoring, or extending the STEP-to-SVG converter application. Each section includes specific implementation details, code examples, and considerations that an AI agent would need to successfully work with this codebase.