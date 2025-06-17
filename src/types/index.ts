// Data Models as specified in PRD

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

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

export interface ProfileConfig {
  planeType: 'XY' | 'XZ' | 'YZ' | 'CUSTOM';
  position: number;
  normal: Vector3;
  origin: Vector3;
  tolerance: number;
  simplification: boolean;
}

export interface Curve2D {
  type: 'line' | 'circle' | 'spline';
  points: Vector2[];
  closed: boolean;
}

export interface ExtractedProfile {
  id: string;
  curves: Curve2D[];
  boundingBox: BoundingBox2D;
  area: number;
  length: number;
}

export interface ColorMapping {
  throughCut: string;
  pocket: string;
  engraving: string;
  guideLine: string;
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