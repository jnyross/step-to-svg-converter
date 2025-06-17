// 2D Profile Extraction from 3D geometry
import * as THREE from 'three';
import { ProfileConfig, ExtractedProfile, Curve2D, Vector2, BoundingBox2D } from '../types';

// Create cutting plane from configuration
export const createCuttingPlane = (config: ProfileConfig): THREE.Plane => {
  const normal = new THREE.Vector3(config.normal.x, config.normal.y, config.normal.z);
  normal.normalize();
  
  // Calculate the constant d for plane equation ax + by + cz + d = 0
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

  // Process triangles
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

    // Check each edge for intersection with plane
    const edges = [
      [v1, v2],
      [v2, v3],
      [v3, v1]
    ];

    edges.forEach(([start, end]) => {
      const intersection = new THREE.Vector3();
      const line = new THREE.Line3(start, end);
      
      if (plane.intersectLine(line, intersection)) {
        // Project intersection point to 2D
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

  // Process all triangles
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
  // Create a local coordinate system on the plane
  const normal = plane.normal.clone().normalize();
  
  // Choose two orthogonal vectors in the plane
  let u = new THREE.Vector3();
  let v = new THREE.Vector3();
  
  // Find a vector not parallel to normal
  if (Math.abs(normal.x) < 0.9) {
    u.set(1, 0, 0);
  } else {
    u.set(0, 1, 0);
  }
  
  // Create orthogonal basis
  v.crossVectors(normal, u).normalize();
  u.crossVectors(v, normal).normalize();
  
  // Project point onto the plane's local coordinate system
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

  // Simple algorithm to connect nearby points
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

      // Check if current point is on the line between prev and next
      const isCollinear = isPointOnLine(prev, current, next, tolerance);
      
      if (!isCollinear) {
        simplified.push(current);
      }
    }

    // Always include the last point
    if (!curve.closed) {
      simplified.push(curve.points[curve.points.length - 1]);
    }

    return {
      ...curve,
      points: simplified
    };
  });
};

// Check if point is on line between two other points
const isPointOnLine = (
  p1: Vector2, 
  p2: Vector2, 
  p3: Vector2, 
  tolerance: number
): boolean => {
  // Calculate distance from point to line
  const lineLength = Math.sqrt(
    Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2)
  );
  
  if (lineLength < tolerance) return true;

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

// Calculate profile area and perimeter
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

    // If closed curve, add closing segment
    if (curve.closed && curve.points.length > 2) {
      const first = curve.points[0];
      const last = curve.points[curve.points.length - 1];
      totalLength += Math.sqrt(
        Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
      );

      // Calculate area using shoelace formula for closed curves
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

  // Simplify curves if enabled
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