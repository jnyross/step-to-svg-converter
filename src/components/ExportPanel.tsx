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

  const handleColorChange = (colorType: keyof typeof config.colorMapping, color: string) => {
    onConfigChange({
      ...config,
      colorMapping: {
        ...config.colorMapping,
        [colorType]: color
      }
    });
  };

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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Settings
        </Button>

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

      {/* Advanced Settings Dialog/Expansion */}
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

          <Alert severity="info" sx={{ mb: 2 }}>
            These settings optimize SVG output for Shaper Origin CNC machining.
          </Alert>

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