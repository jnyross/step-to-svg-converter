import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Paper } from '@mui/material';

// Import OrbitControls directly from Three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Extend the catalog
extend({ OrbitControls });

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
  const planeRef = useRef<THREE.Mesh>(null);

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