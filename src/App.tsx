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
      // Import parseStepFile and related functions
      const { parseStepFile, extractCartesianPoints, generateThreeJSGeometry } = 
        await import('./utils/stepParser');
      
      // Parse the actual STEP file
      const stepFileObj = await parseStepFile(file);
      setStepFile(stepFileObj);
      
      // Extract cartesian points for geometry generation
      const fileContent = await file.text();
      const cartesianPoints = extractCartesianPoints(fileContent);
      
      // Generate Three.js geometry from parsed data
      const parsedGeometry = generateThreeJSGeometry(cartesianPoints);
      setGeometry(parsedGeometry);
      
      setBoundingBox(stepFileObj.boundingBox);
      
      // Update profile config with real bounding box
      setProfileConfig(prev => ({
        ...prev,
        position: stepFileObj.boundingBox.center.z,
        origin: stepFileObj.boundingBox.center
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process STEP file');
      console.error('STEP file parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Profile extraction handler
  const handleExtractProfile = useCallback(async () => {
    if (!stepFile || !geometry) return;
    
    setIsLoading(true);
    try {
      // Import profile extraction functionality
      const { extractProfile } = await import('./utils/profileExtractor');
      
      // Extract 2D profile from the geometry using current cutting plane configuration
      const extractedProfile = extractProfile(geometry, profileConfig);
      
      setProfiles(prev => [...prev, extractedProfile]);
      
      console.log('Profile extracted successfully:', extractedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract profile');
      console.error('Profile extraction error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stepFile, geometry, profileConfig]);

  // SVG export handler
  const handleExport = useCallback(async () => {
    if (profiles.length === 0) return;
    
    setIsExporting(true);
    try {
      // Import SVG export functionality
      const { downloadSvg } = await import('./utils/svgExporter');
      
      // Export profiles to SVG file
      const filename = stepFile?.filename || 'profile';
      downloadSvg(profiles, exportConfig, filename);
      
      console.log('SVG export completed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export SVG');
      console.error('SVG export error:', err);
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
