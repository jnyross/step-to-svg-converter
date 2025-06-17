// SVG Export functionality optimized for Shaper Origin
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

// Determine curve type and color based on characteristics
export const determineCurveType = (curve: Curve2D): 'throughCut' | 'pocket' | 'engraving' | 'guideLine' => {
  // Simple heuristic - this could be enhanced based on curve analysis
  if (curve.closed) {
    // Closed curves are typically through cuts or pockets
    const area = calculateCurveArea(curve);
    return area > 10 ? 'throughCut' : 'pocket';
  } else {
    // Open curves are typically engraving or guide lines
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

// Convert units if needed
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
  
  // Convert coordinates if needed
  const convertCoord = (value: number) => {
    let converted = value * scale;
    if (!isMetric) {
      converted = convertUnits(converted, true, true); // mm to inches
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

// Export profiles to downloadable SVG file
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
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting SVG:', error);
    throw new Error('Failed to export SVG file');
  }
};

// Validate SVG content for Shaper Origin compatibility
export const validateSvgForShaperOrigin = (svgContent: string): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for required elements
  if (!svgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    errors.push('Missing SVG namespace declaration');
  }

  if (!svgContent.includes('viewBox=')) {
    warnings.push('Missing viewBox attribute - may cause scaling issues');
  }

  // Check for supported path commands
  const unsupportedCommands = svgContent.match(/[QSTAHV]/g);
  if (unsupportedCommands) {
    warnings.push('Contains potentially unsupported path commands');
  }

  // Check color format
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