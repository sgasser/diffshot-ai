import { describe, it, expect } from 'vitest';
import { DiffShotError, handleError, isNodeError } from '../errors.js';

describe('Error utilities', () => {
  describe('DiffShotError', () => {
    it('should create custom error with code and details', () => {
      const error = new DiffShotError('Test error', 'TEST_CODE', { foo: 'bar' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DiffShotError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.name).toBe('DiffShotError');
    });
  });

  describe('handleError', () => {
    it('should handle DiffShotError', () => {
      const error = new DiffShotError('Custom error', 'CUSTOM', { test: true });
      const result = handleError(error);

      expect(result.message).toBe('Custom error');
      expect(result.stack).toBeDefined();
    });

    it('should handle regular Error', () => {
      const error = new Error('Regular error');
      const result = handleError(error);

      expect(result.message).toBe('Regular error');
      expect(result.stack).toBeDefined();
    });

    it('should handle string error', () => {
      const result = handleError('String error');

      expect(result.message).toBe('String error');
      expect(result.stack).toBeUndefined();
    });

    it('should handle unknown error types', () => {
      const result = handleError({ weird: 'error' });

      expect(result.message).toBe('[object Object]');
      expect(result.stack).toBeUndefined();
    });
  });

  describe('isNodeError', () => {
    it('should return true for Node.js errors', () => {
      const error = new Error('test') as NodeJS.ErrnoException;
      error.code = 'ENOENT';

      expect(isNodeError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('test');

      expect(isNodeError(error)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isNodeError('string')).toBe(false);
      expect(isNodeError(123)).toBe(false);
      expect(isNodeError(null)).toBe(false);
      expect(isNodeError(undefined)).toBe(false);
    });
  });
});
