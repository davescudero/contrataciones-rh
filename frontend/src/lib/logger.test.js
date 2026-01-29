import logger from './logger';

describe('Logger', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleGroupCollapsedSpy;
  let consoleGroupEndSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleGroupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logger object', () => {
    test('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });

    test('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    test('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    test('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    test('should have apiError method', () => {
      expect(typeof logger.apiError).toBe('function');
    });
  });

  describe('apiError', () => {
    test('should format API errors correctly', () => {
      const apiError = {
        message: 'API Error',
        code: '500',
        details: 'Server error',
        hint: 'Check server logs'
      };
      
      // Should not throw
      expect(() => logger.apiError('TestContext', 'fetch data', apiError)).not.toThrow();
    });

    test('should handle null error gracefully', () => {
      // Should not throw
      expect(() => logger.apiError('TestContext', 'fetch data', null)).not.toThrow();
    });

    test('should handle undefined error gracefully', () => {
      // Should not throw
      expect(() => logger.apiError('TestContext', 'fetch data', undefined)).not.toThrow();
    });
  });

  describe('error', () => {
    test('should not throw when called', () => {
      expect(() => logger.error('TestContext', 'Error message')).not.toThrow();
    });

    test('should not throw when called with data', () => {
      const error = new Error('Test error');
      expect(() => logger.error('TestContext', 'Error message', error)).not.toThrow();
    });
  });
});
