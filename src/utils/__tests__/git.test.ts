import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChangedFiles, isGitRepository } from '../git.js';
import { execSync } from 'child_process';

vi.mock('child_process');

describe('Git utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChangedFiles', () => {
    it('should return array of changed files', () => {
      const mockOutput = 'src/file1.ts\nsrc/file2.ts\n';
      vi.mocked(execSync).mockReturnValue(mockOutput);

      const files = getChangedFiles('main', '/test/dir');

      expect(execSync).toHaveBeenCalledWith('git diff --name-only main', {
        encoding: 'utf-8',
        cwd: '/test/dir',
      });
      expect(files).toEqual(['src/file1.ts', 'src/file2.ts']);
    });

    it('should filter empty lines', () => {
      const mockOutput = 'src/file1.ts\n\n\nsrc/file2.ts\n\n';
      vi.mocked(execSync).mockReturnValue(mockOutput);

      const files = getChangedFiles();

      expect(files).toEqual(['src/file1.ts', 'src/file2.ts']);
    });

    it('should return empty array when no changes', () => {
      vi.mocked(execSync).mockReturnValue('');

      const files = getChangedFiles();

      expect(files).toEqual([]);
    });

    it('should throw DiffShotError on git failure', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('fatal: not a git repository');
      });

      expect(() => getChangedFiles()).toThrow('Failed to get git diff');
    });
  });

  describe('isGitRepository', () => {
    it('should return true when in git repo', () => {
      vi.mocked(execSync).mockReturnValue('.git');

      const result = isGitRepository('/test/dir');

      expect(execSync).toHaveBeenCalledWith('git rev-parse --git-dir', {
        cwd: '/test/dir',
        stdio: 'ignore',
      });
      expect(result).toBe(true);
    });

    it('should return false when not in git repo', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('fatal: not a git repository');
      });

      const result = isGitRepository();

      expect(result).toBe(false);
    });
  });
});
