import { 
  generateSvgPath, 
  exportToSvg, 
  validateSvgForShaperOrigin 
} from '../svgExporter';
import { ExtractedProfile, DEFAULT_SVG_CONFIG } from '../../types';

describe('svgExporter', () => {
  const mockProfile: ExtractedProfile = {
    id: 'test-profile',
    curves: [
      {
        type: 'line',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 }
        ],
        closed: true
      }
    ],
    boundingBox: {
      min: { x: 0, y: 0 },
      max: { x: 10, y: 10 },
      center: { x: 5, y: 5 },
      dimensions: { x: 10, y: 10 }
    },
    area: 100,
    length: 40
  };

  describe('generateSvgPath', () => {
    it('should generate correct SVG path for open curve', () => {
      const openCurve = {
        type: 'line' as const,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 5 },
          { x: 20, y: 0 }
        ],
        closed: false
      };

      const path = generateSvgPath(openCurve, 2);
      expect(path).toBe('M 0.00 0.00 L 10.00 5.00 L 20.00 0.00');
    });

    it('should generate correct SVG path for closed curve', () => {
      const closedCurve = {
        type: 'line' as const,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 }
        ],
        closed: true
      };

      const path = generateSvgPath(closedCurve, 1);
      expect(path).toBe('M 0.0 0.0 L 10.0 0.0 L 10.0 10.0 Z');
    });

    it('should handle empty curve', () => {
      const emptyCurve = {
        type: 'line' as const,
        points: [],
        closed: false
      };

      const path = generateSvgPath(emptyCurve, 2);
      expect(path).toBe('');
    });

    it('should respect precision parameter', () => {
      const curve = {
        type: 'line' as const,
        points: [
          { x: 1.23456, y: 2.34567 },
          { x: 3.45678, y: 4.56789 }
        ],
        closed: false
      };

      const path3 = generateSvgPath(curve, 3);
      expect(path3).toBe('M 1.235 2.346 L 3.457 4.568');

      const path1 = generateSvgPath(curve, 1);
      expect(path1).toBe('M 1.2 2.3 L 3.5 4.6');
    });
  });

  describe('exportToSvg', () => {
    it('should generate valid SVG content', () => {
      const svg = exportToSvg([mockProfile], DEFAULT_SVG_CONFIG, 'test.step');
      
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox=');
      expect(svg).toContain('profile-1');
    });

    it('should include metadata when enabled', () => {
      const configWithMetadata = { ...DEFAULT_SVG_CONFIG, includeMetadata: true };
      const svg = exportToSvg([mockProfile], configWithMetadata, 'test.step');
      
      expect(svg).toContain('<metadata>');
      expect(svg).toContain('test.step');
      expect(svg).toContain('STEP to SVG Profile Export');
    });

    it('should exclude metadata when disabled', () => {
      const configWithoutMetadata = { ...DEFAULT_SVG_CONFIG, includeMetadata: false };
      const svg = exportToSvg([mockProfile], configWithoutMetadata, 'test.step');
      
      expect(svg).not.toContain('<metadata>');
    });

    it('should apply correct colors', () => {
      const svg = exportToSvg([mockProfile], DEFAULT_SVG_CONFIG);
      
      expect(svg).toContain(`stroke="${DEFAULT_SVG_CONFIG.colorMapping.throughCut}"`);
    });

    it('should apply scaling', () => {
      const scaledConfig = { ...DEFAULT_SVG_CONFIG, scale: 2.0 };
      const svg = exportToSvg([mockProfile], scaledConfig);
      
      // The viewBox should reflect the scaled dimensions
      expect(svg).toContain('viewBox="0.000 0.000 20.000 20.000"');
    });

    it('should handle unit conversion', () => {
      const inchConfig = { ...DEFAULT_SVG_CONFIG, units: 'inches' as const };
      const svg = exportToSvg([mockProfile], inchConfig);
      
      expect(svg).toContain('inches');
    });

    it('should throw error for empty profiles array', () => {
      expect(() => {
        exportToSvg([], DEFAULT_SVG_CONFIG);
      }).toThrow('No profiles to export');
    });

    it('should handle multiple profiles', () => {
      const profiles = [mockProfile, { ...mockProfile, id: 'test-profile-2' }];
      const svg = exportToSvg(profiles, DEFAULT_SVG_CONFIG);
      
      expect(svg).toContain('profile-1');
      expect(svg).toContain('profile-2');
    });
  });

  describe('validateSvgForShaperOrigin', () => {
    it('should validate correct SVG content', () => {
      const validSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 L 100 0" stroke="#FF0000" stroke-width="0.25" fill="none"/>
        </svg>
      `;
      
      const result = validateSvgForShaperOrigin(validSvg);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing namespace', () => {
      const invalidSvg = `
        <svg viewBox="0 0 100 100">
          <path d="M 0 0 L 100 0" stroke="#FF0000" stroke-width="0.25"/>
        </svg>
      `;
      
      const result = validateSvgForShaperOrigin(invalidSvg);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing SVG namespace declaration');
    });

    it('should warn about missing viewBox', () => {
      const svgWithoutViewBox = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 L 100 0" stroke="#FF0000" stroke-width="0.25"/>
        </svg>
      `;
      
      const result = validateSvgForShaperOrigin(svgWithoutViewBox);
      
      expect(result.warnings).toContain('Missing viewBox attribute - may cause scaling issues');
    });

    it('should warn about extreme line weights', () => {
      const svgWithExtremeLineWeight = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 L 100 0" stroke="#FF0000" stroke-width="5.0"/>
        </svg>
      `;
      
      const result = validateSvgForShaperOrigin(svgWithExtremeLineWeight);
      
      expect(result.warnings.some(w => w.includes('Line weight 5 may be outside optimal range'))).toBe(true);
    });

    it('should warn about unsupported path commands', () => {
      const svgWithUnsupportedCommands = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 Q 50 50 100 0" stroke="#FF0000" stroke-width="0.25"/>
        </svg>
      `;
      
      const result = validateSvgForShaperOrigin(svgWithUnsupportedCommands);
      
      expect(result.warnings).toContain('Contains potentially unsupported path commands');
    });

    it('should warn about missing colors', () => {
      const svgWithoutColors = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 0 0 L 100 0"/>
        </svg>
      `;
      
      const result = validateSvgForShaperOrigin(svgWithoutColors);
      
      expect(result.warnings).toContain('No valid hex colors found');
    });
  });
});