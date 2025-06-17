import { 
  validateStepFile, 
  parseStepEntities, 
  isEntitySupported, 
  validateStepEntities 
} from '../stepParser';

describe('stepParser', () => {
  describe('validateStepFile', () => {
    it('should validate a correct STEP file format', () => {
      const validStepContent = `
        ISO-10303-21;
        HEADER;
        FILE_DESCRIPTION(('STEP file'),'2;1');
        FILE_NAME('test.step','2023-01-01',('',''),('',''),'','','');
        FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
        ENDSEC;
        DATA;
        #1 = CARTESIAN_POINT('',(0.0,0.0,0.0));
        ENDSEC;
        END-ISO-10303-21;
      `;
      
      expect(validateStepFile(validStepContent)).toBe(true);
    });

    it('should reject invalid STEP file format', () => {
      const invalidStepContent = `
        This is not a STEP file
      `;
      
      expect(validateStepFile(invalidStepContent)).toBe(false);
    });

    it('should reject STEP file missing required sections', () => {
      const incompleteStepContent = `
        ISO-10303-21;
        HEADER;
        FILE_DESCRIPTION(('STEP file'),'2;1');
        ENDSEC;
      `;
      
      expect(validateStepFile(incompleteStepContent)).toBe(false);
    });
  });

  describe('parseStepEntities', () => {
    it('should parse STEP entities correctly', () => {
      const stepContent = `
        DATA;
        #1 = CARTESIAN_POINT('',(0.0,0.0,0.0));
        #2 = DIRECTION('',(1.0,0.0,0.0));
        #3 = LINE('',#1,#2);
        ENDSEC;
      `;
      
      const entities = parseStepEntities(stepContent);
      
      expect(entities).toHaveLength(3);
      expect(entities[0]).toEqual({
        id: 1,
        type: 'CARTESIAN_POINT',
        parameters: expect.any(Array),
        references: []
      });
      expect(entities[2]).toEqual({
        id: 3,
        type: 'LINE',
        parameters: expect.any(Array),
        references: [1, 2]
      });
    });

    it('should handle empty data section', () => {
      const stepContent = `
        DATA;
        ENDSEC;
      `;
      
      const entities = parseStepEntities(stepContent);
      expect(entities).toHaveLength(0);
    });
  });

  describe('isEntitySupported', () => {
    it('should identify supported entities', () => {
      expect(isEntitySupported('CARTESIAN_POINT')).toBe(true);
      expect(isEntitySupported('CIRCLE')).toBe(true);
      expect(isEntitySupported('LINE')).toBe(true);
      expect(isEntitySupported('PLANE')).toBe(true);
    });

    it('should identify unsupported entities', () => {
      expect(isEntitySupported('UNSUPPORTED_ENTITY')).toBe(false);
      expect(isEntitySupported('RANDOM_TYPE')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isEntitySupported('cartesian_point')).toBe(true);
      expect(isEntitySupported('Circle')).toBe(true);
    });
  });

  describe('validateStepEntities', () => {
    it('should validate supported entities', () => {
      const entities = [
        { id: 1, type: 'CARTESIAN_POINT', parameters: [], references: [] },
        { id: 2, type: 'CIRCLE', parameters: [], references: [] }
      ];
      
      const result = validateStepEntities(entities);
      
      expect(result.valid).toBe(true);
      expect(result.unsupportedEntities).toHaveLength(0);
    });

    it('should identify unsupported entities', () => {
      const entities = [
        { id: 1, type: 'CARTESIAN_POINT', parameters: [], references: [] },
        { id: 2, type: 'UNSUPPORTED_TYPE', parameters: [], references: [] }
      ];
      
      const result = validateStepEntities(entities);
      
      expect(result.valid).toBe(false);
      expect(result.unsupportedEntities).toContain('UNSUPPORTED_TYPE');
    });

    it('should handle duplicate unsupported entity types', () => {
      const entities = [
        { id: 1, type: 'UNSUPPORTED_TYPE', parameters: [], references: [] },
        { id: 2, type: 'UNSUPPORTED_TYPE', parameters: [], references: [] },
        { id: 3, type: 'ANOTHER_UNSUPPORTED', parameters: [], references: [] }
      ];
      
      const result = validateStepEntities(entities);
      
      expect(result.valid).toBe(false);
      expect(result.unsupportedEntities).toHaveLength(2);
      expect(result.unsupportedEntities).toContain('UNSUPPORTED_TYPE');
      expect(result.unsupportedEntities).toContain('ANOTHER_UNSUPPORTED');
    });
  });
});