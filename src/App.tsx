import React, { useState, useCallback } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Typography,
  AppBar,
  Toolbar,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Engineering } from '@mui/icons-material';
import FileUpload from './components/FileUpload';
import Viewer3D from './components/Viewer3D';
import ProfilePanel from './components/ProfilePanel';
import ExportPanel from './components/ExportPanel';
import { 
  StepFile, 
  ProfileConfig, 
  SvgExportConfig, 
  ExtractedProfile,
  DEFAULT_SVG_CONFIG 
} from './types';
import * as THREE from 'three';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  // State management
  const [stepFile, setStepFile] = useState<StepFile | null>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | undefined>();
  const [boundingBox, setBoundingBox] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ExtractedProfile[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // 3D Viewer state
  const [renderMode] = useState<'wireframe' | 'solid' | 'translucent'>('solid');
  const [showCuttingPlane, setShowCuttingPlane] = useState(true);
  
  // Profile configuration
  const [profileConfig, setProfileConfig] = useState<ProfileConfig>({
    planeType: 'XY',
    position: 0,
    normal: { x: 0, y: 0, z: 1 },
    origin: { x: 0, y: 0, z: 0 },
    tolerance: 0.01,
    simplification: true
  });
  
  // Export configuration
  const [exportConfig, setExportConfig] = useState<SvgExportConfig>(DEFAULT_SVG_CONFIG);

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create STEP file object
      const stepFileObj: StepFile = {
        id: Date.now().toString(),
        filename: file.name,
        size: file.size,
        uploadDate: new Date(),
        entities: [], // Will be populated by STEP parser
        boundingBox: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 0, y: 0, z: 0 },
          center: { x: 0, y: 0, z: 0 },
          dimensions: { x: 0, y: 0, z: 0 }
        }
      };
      
      setStepFile(stepFileObj);
      
      // TODO: Implement actual STEP file parsing with OpenCascade.js
      // For now, create a simple test geometry
      const testGeometry = new THREE.BoxGeometry(10, 5, 2);
      setGeometry(testGeometry);
      
      const testBoundingBox = {
        min: { x: -5, y: -2.5, z: -1 },
        max: { x: 5, y: 2.5, z: 1 },
        center: { x: 0, y: 0, z: 0 },
        dimensions: { x: 10, y: 5, z: 2 }
      };
      setBoundingBox(testBoundingBox);
      
      // Update profile config with bounding box
      setProfileConfig(prev => ({
        ...prev,
        position: testBoundingBox.center.z,
        origin: testBoundingBox.center
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process STEP file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Profile extraction handler
  const handleExtractProfile = useCallback(async () => {
    if (!stepFile || !geometry) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement actual 2D profile extraction
      // For now, create a test profile
      const testProfile: ExtractedProfile = {
        id: Date.now().toString(),
        curves: [
          {
            type: 'line',
            points: [
              { x: -5, y: -2.5 },
              { x: 5, y: -2.5 },
              { x: 5, y: 2.5 },
              { x: -5, y: 2.5 }
            ],
            closed: true
          }
        ],
        boundingBox: {
          min: { x: -5, y: -2.5 },
          max: { x: 5, y: 2.5 },
          center: { x: 0, y: 0 },
          dimensions: { x: 10, y: 5 }
        },
        area: 50,
        length: 30
      };
      
      setProfiles(prev => [...prev, testProfile]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract profile');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepFile, geometry]);

  // SVG export handler
  const handleExport = useCallback(async () => {
    if (profiles.length === 0) return;
    
    setIsExporting(true);
    try {
      // TODO: Implement actual SVG generation
      // For now, create a simple SVG string
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="-5 -2.5 10 5" 
     width="10mm" 
     height="5mm">
  <metadata>
    <title>STEP to SVG Export</title>
    <description>Generated from ${stepFile?.filename}</description>
    <date>${new Date().toISOString()}</date>
  </metadata>
  <g id="profile-1" stroke="${exportConfig.colorMapping.throughCut}" 
     stroke-width="${exportConfig.lineWeight}" fill="none">
    <rect x="-5" y="-2.5" width="10" height="5"/>
  </g>
</svg>`;
      
      // Download the SVG file
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stepFile?.filename.replace(/\.(step|stp)$/i, '')}_profile.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export SVG');
    } finally {
      setIsExporting(false);
    }
  }, [profiles, exportConfig, stepFile]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar position="static">
          <Toolbar>
            <Engineering style={{ marginRight: 16 }} />
            <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
              STEP to SVG Converter for Shaper Origin
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth={false} style={{ flexGrow: 1, paddingTop: 16, paddingBottom: 16 }}>
          {/* File Upload */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <FileUpload onFileUpload={handleFileUpload} disabled={isLoading} />
          </div>

          {/* Error Display */}
          {error && (
            <Alert severity="error" style={{ marginBottom: 16 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <CircularProgress />
            </div>
          )}

          {/* Main Interface */}
          {stepFile && (
            <Grid container spacing={2} style={{ height: 'calc(100vh - 200px)' }} data-testid="main-grid">
              {/* 3D Viewer */}
              <Grid item xs={12} md={8}>
                <Viewer3D
                  geometry={geometry}
                  boundingBox={boundingBox}
                  cuttingPlane={{
                    position: profileConfig.position,
                    normal: profileConfig.normal,
                    visible: showCuttingPlane
                  }}
                  renderMode={renderMode}
                />
              </Grid>

              {/* Profile Panel */}
              <Grid item xs={12} md={4}>
                <ProfilePanel
                  config={profileConfig}
                  onConfigChange={setProfileConfig}
                  boundingBox={boundingBox}
                  onExtractProfile={handleExtractProfile}
                  showCuttingPlane={showCuttingPlane}
                  onToggleCuttingPlane={() => setShowCuttingPlane(!showCuttingPlane)}
                />
              </Grid>
            </Grid>
          )}
        </Container>

        {/* Export Panel */}
        {stepFile && (
          <ExportPanel
            config={exportConfig}
            onConfigChange={setExportConfig}
            profiles={profiles}
            onExport={handleExport}
            isExporting={isExporting}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
