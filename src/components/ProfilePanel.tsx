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

  const handlePositionChange = (position: number) => {
    onConfigChange({
      ...config,
      position
    });
  };

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

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Position ({positionRange.min.toFixed(1)} to {positionRange.max.toFixed(1)} mm)
        </Typography>
        
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