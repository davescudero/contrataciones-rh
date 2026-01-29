import { validateCURP, CAMPAIGN_STATUS, PROPOSAL_STATUS, ROLES } from './constants';

describe('Constants', () => {
  describe('validateCURP', () => {
    test('should return true for valid CURP', () => {
      expect(validateCURP('GODE561231HDFRRL09')).toBe(true);
      expect(validateCURP('BADD110313HCMLNS09')).toBe(true);
    });

    test('should return false for invalid CURP', () => {
      expect(validateCURP('INVALID')).toBe(false);
      expect(validateCURP('12345678901234567')).toBe(false);
      expect(validateCURP('')).toBe(false);
      expect(validateCURP(null)).toBe(false);
      expect(validateCURP(undefined)).toBe(false);
    });

    test('should return false for CURP with wrong length', () => {
      expect(validateCURP('GODE561231HDFRRL0')).toBe(false); // 17 chars
      expect(validateCURP('GODE561231HDFRRL099')).toBe(false); // 19 chars
    });

    test('should be case insensitive', () => {
      expect(validateCURP('gode561231hdfrrl09')).toBe(true);
      expect(validateCURP('GoDe561231HdFrRl09')).toBe(true);
    });
  });

  describe('CAMPAIGN_STATUS', () => {
    test('should have all required statuses', () => {
      expect(CAMPAIGN_STATUS.DRAFT).toBeDefined();
      expect(CAMPAIGN_STATUS.UNDER_REVIEW).toBeDefined();
      expect(CAMPAIGN_STATUS.APPROVED).toBeDefined();
      expect(CAMPAIGN_STATUS.ACTIVE).toBeDefined();
      expect(CAMPAIGN_STATUS.INACTIVE).toBeDefined();
    });

    test('should have unique values', () => {
      const values = Object.values(CAMPAIGN_STATUS);
      const uniqueValues = [...new Set(values)];
      expect(values.length).toBe(uniqueValues.length);
    });
  });

  describe('PROPOSAL_STATUS', () => {
    test('should have all required statuses', () => {
      expect(PROPOSAL_STATUS.SUBMITTED).toBeDefined();
      expect(PROPOSAL_STATUS.IN_VALIDATION).toBeDefined();
      expect(PROPOSAL_STATUS.APPROVED).toBeDefined();
      expect(PROPOSAL_STATUS.REJECTED).toBeDefined();
    });

    test('should have unique values', () => {
      const values = Object.values(PROPOSAL_STATUS);
      const uniqueValues = [...new Set(values)];
      expect(values.length).toBe(uniqueValues.length);
    });
  });

  describe('ROLES', () => {
    test('should have all required roles', () => {
      expect(ROLES.PLANEACION).toBeDefined();
      expect(ROLES.ATENCION_SALUD).toBeDefined();
      expect(ROLES.RH).toBeDefined();
      expect(ROLES.COORD_ESTATAL).toBeDefined();
      expect(ROLES.VALIDADOR).toBeDefined();
      expect(ROLES.DG).toBeDefined();
    });

    test('role values should match their keys', () => {
      expect(ROLES.PLANEACION).toBe('PLANEACION');
      expect(ROLES.ATENCION_SALUD).toBe('ATENCION_SALUD');
      expect(ROLES.RH).toBe('RH');
      expect(ROLES.COORD_ESTATAL).toBe('COORD_ESTATAL');
      expect(ROLES.VALIDADOR).toBe('VALIDADOR');
      expect(ROLES.DG).toBe('DG');
    });
  });
});
