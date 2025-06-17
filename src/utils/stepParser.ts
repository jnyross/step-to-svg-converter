// STEP File Parser with fallback implementation
import * as THREE from 'three';
import { StepFile, StepEntity, BoundingBox } from '../types';

// OpenCascade.js initialization (fallback for now)
let occt: any = null;

export const initializeOpenCascade = async (): Promise<void> => {
  // For now, use a fallback implementation without OpenCascade.js
  // In production, this would properly initialize OpenCascade.js WASM module
  if (!occt) {
    occt = { initialized: true };
  }
};

// STEP file validation
export const validateStepFile = (content: string): boolean => {
  // Check for required STEP file sections
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

// Extract CARTESIAN_POINT coordinates from STEP content
export const extractCartesianPoints = (content: string): Array<{ id: number; x: number; y: number; z: number }> => {
  const points: Array<{ id: number; x: number; y: number; z: number }> = [];
  
  // Match CARTESIAN_POINT entities with coordinates
  const pointRegex = /#(\d+)\s*=\s*CARTESIAN_POINT\s*\(\s*'[^']*'\s*,\s*\(([^)]+)\)\s*\)\s*;/g;
  let match;

  while ((match = pointRegex.exec(content)) !== null) {
    const [, id, coords] = match;
    
    // Parse coordinates
    const coordValues = coords.split(',').map(coord => {
      const num = parseFloat(coord.trim());
      return isNaN(num) ? 0 : num;
    });

    if (coordValues.length >= 3) {
      points.push({
        id: parseInt(id),
        x: coordValues[0],
        y: coordValues[1],
        z: coordValues[2]
      });
    }
  }

  return points;
};

// Parse STEP entities from file content
export const parseStepEntities = (content: string): StepEntity[] => {
  const entities: StepEntity[] = [];
  
  // Extract DATA section
  const dataSection = content.substring(
    content.indexOf('DATA;') + 5,
    content.indexOf('ENDSEC;', content.indexOf('DATA;'))
  );

  // Parse individual entities (simplified parser)
  const entityRegex = /#(\d+)\s*=\s*([A-Z_]+)\s*\((.*?)\)\s*;/g;
  let match;

  while ((match = entityRegex.exec(dataSection)) !== null) {
    const [, id, type, params] = match;
    
    // Parse parameters (simplified)
    const parameters = params.split(',').map(param => param.trim());
    
    // Extract references to other entities
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

// Calculate bounding box from CARTESIAN_POINT entities
export const calculateBoundingBox = (points: Array<{ x: number; y: number; z: number }>): BoundingBox => {
  if (points.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
      center: { x: 0, y: 0, z: 0 },
      dimensions: { x: 0, y: 0, z: 0 }
    };
  }

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  points.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
    center: { x: centerX, y: centerY, z: centerZ },
    dimensions: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
  };
};

// Parse STEP file and create StepFile object
export const parseStepFile = async (file: File): Promise<StepFile> => {
  await initializeOpenCascade();
  
  const content = await file.text();
  
  // Validate STEP file format
  if (!validateStepFile(content)) {
    throw new Error('Invalid STEP file format');
  }

  // Parse entities
  const entities = parseStepEntities(content);
  
  // Extract cartesian points and calculate real bounding box
  const cartesianPoints = extractCartesianPoints(content);
  const boundingBox = calculateBoundingBox(cartesianPoints);

  return {
    id: Date.now().toString(),
    filename: file.name,
    size: file.size,
    uploadDate: new Date(),
    entities,
    boundingBox
  };
};

// Generate Three.js geometry from STEP file points
export const generateThreeJSGeometry = (points: Array<{ x: number; y: number; z: number }>): THREE.BufferGeometry => {
  // For now, create a simple geometry that represents the bounding box as a wireframe
  // In a full implementation, this would use OpenCascade.js to generate proper mesh geometry
  
  if (points.length === 0) {
    return new THREE.BoxGeometry(1, 1, 1);
  }

  // Calculate bounding box
  const bbox = calculateBoundingBox(points);
  const { dimensions, center } = bbox;

  // Create a box geometry representing the part's bounds
  const geometry = new THREE.BoxGeometry(
    Math.max(dimensions.x, 0.1),
    Math.max(dimensions.y, 0.1), 
    Math.max(dimensions.z, 0.1)
  );

  // Translate to center position
  geometry.translate(center.x, center.y, center.z);

  return geometry;
};

// Load STEP file geometry using OpenCascade.js
export const loadStepGeometry = async (stepFile: StepFile): Promise<THREE.BufferGeometry> => {
  await initializeOpenCascade();
  
  // Extract points from the STEP file content
  // Note: This is a simplified approach. Real implementation would use OpenCascade.js
  // to parse the full B-Rep structure and generate proper mesh geometry
  
  // For demonstration, we'll generate geometry from the bounding box
  const cartesianPoints = stepFile.entities
    .filter(entity => entity.type === 'CARTESIAN_POINT')
    .map(entity => {
      // This is a simplified extraction - real implementation would be more robust
      return { x: 0, y: 0, z: 0 }; // Placeholder
    });

  return generateThreeJSGeometry(cartesianPoints);
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

// Check if entity is supported
export const isEntitySupported = (entityType: string): boolean => {
  return SUPPORTED_ENTITIES.includes(entityType.toUpperCase());
};

// Validate STEP file entities
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