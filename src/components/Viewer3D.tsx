import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Paper } from '@mui/material';

// Import OrbitControls directly from Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Extend the catalog
extend({ OrbitControls });

// Cutting Plane Component
interface CuttingPlaneProps {
  position: number;
  normal: { x: number; y: number; z: number };
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}

const CuttingPlane: React.FC<CuttingPlaneProps> = ({ position, normal, boundingBox }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      const mesh = meshRef.current;
      
      // Calculate plane size based on bounding box
      const width = Math.abs(boundingBox.max.x - boundingBox.min.x) * 1.2;
      const height = Math.abs(boundingBox.max.y - boundingBox.min.y) * 1.2;
      const depth = Math.abs(boundingBox.max.z - boundingBox.min.z) * 1.2;
      const size = Math.max(width, height, depth);
      
      // Update plane geometry
      mesh.geometry = new THREE.PlaneGeometry(size, size);
      
      // Calculate position based on normal and position value
      // Position is an absolute coordinate, not an offset from center
      let planePosition = { x: 0, y: 0, z: 0 };
      
      if (Math.abs(normal.z) > 0.9) {
        // XY plane (normal is Z)
        planePosition = {
          x: (boundingBox.min.x + boundingBox.max.x) / 2,
          y: (boundingBox.min.y + boundingBox.max.y) / 2,
          z: position
        };
      } else if (Math.abs(normal.y) > 0.9) {
        // XZ plane (normal is Y)
        planePosition = {
          x: (boundingBox.min.x + boundingBox.max.x) / 2,
          y: position,
          z: (boundingBox.min.z + boundingBox.max.z) / 2
        };
      } else if (Math.abs(normal.x) > 0.9) {
        // YZ plane (normal is X)
        planePosition = {
          x: position,
          y: (boundingBox.min.y + boundingBox.max.y) / 2,
          z: (boundingBox.min.z + boundingBox.max.z) / 2
        };
      } else {
        // Custom plane
        const center = {
          x: (boundingBox.min.x + boundingBox.max.x) / 2,
          y: (boundingBox.min.y + boundingBox.max.y) / 2,
          z: (boundingBox.min.z + boundingBox.max.z) / 2
        };
        planePosition = {
          x: center.x + normal.x * position,
          y: center.y + normal.y * position,
          z: center.z + normal.z * position
        };
      }
      
      mesh.position.set(planePosition.x, planePosition.y, planePosition.z);
      
      // Orient the plane based on the normal
      const normalVector = new THREE.Vector3(normal.x, normal.y, normal.z).normalize();
      mesh.lookAt(
        mesh.position.x + normalVector.x,
        mesh.position.y + normalVector.y,
        mesh.position.z + normalVector.z
      );
    }
  }, [position, normal, boundingBox]);
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        color={0xff6666} 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Custom OrbitControls component
function Controls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>();
  
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.minDistance = 0.1;
      controls.maxDistance = 100;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
      controls.minAzimuthAngle = -Math.PI;
      controls.maxAzimuthAngle = Math.PI;
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
    // @ts-ignore
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

  useFrame(() => {
    // Animation updates if needed
  });

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
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      
      {/* Simple grid helper */}
      <gridHelper args={[100, 100]} />
      
      {/* 3D Model */}
      {geometry && (
        <mesh ref={meshRef} geometry={geometry} material={getMaterial()} />
      )}
      
      {/* Cutting Plane */}
      {cuttingPlane && cuttingPlane.visible && boundingBox && (
        <CuttingPlane 
          position={cuttingPlane.position}
          normal={cuttingPlane.normal}
          boundingBox={boundingBox}
        />
      )}
      
      {/* Bounding box visualization */}
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