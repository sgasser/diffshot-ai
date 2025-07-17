import { execSync } from 'child_process';
import { DiffShotError } from './errors.js';
import { logger } from './logger.js';

export function getChangedFiles(
  branch: string = 'UNCOMMITTED',
  cwd: string = process.cwd()
): string[] {
  try {
    let gitCommand: string;
    let output: string;

    if (!branch || branch === 'undefined') {
      branch = 'UNCOMMITTED';
    }

    if (branch !== 'UNCOMMITTED') {
      gitCommand = `git diff --name-only ${branch}`;
      output = execSync(gitCommand, { encoding: 'utf-8', cwd });
    } else {
      const unstagedOutput = execSync('git diff --name-only', { encoding: 'utf-8', cwd });
      const stagedOutput = execSync('git diff --name-only --cached', { encoding: 'utf-8', cwd });
      const untrackedOutput = execSync('git ls-files --others --exclude-standard', {
        encoding: 'utf-8',
        cwd,
      });

      const allChanges = [
        ...unstagedOutput
          .trim()
          .split('\n')
          .filter((f) => f.length > 0),
        ...stagedOutput
          .trim()
          .split('\n')
          .filter((f) => f.length > 0),
        ...untrackedOutput
          .trim()
          .split('\n')
          .filter((f) => f.length > 0),
      ];

      const uniqueChanges = [...new Set(allChanges)];
      output = uniqueChanges.join('\n');
      gitCommand = 'git diff --name-only + git ls-files --others --exclude-standard';
    }

    logger.verbose(`Git command used: ${gitCommand}`);

    const allFiles = output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);

    const filteredFiles = allFiles.filter((file) => {
      if (file.includes('/Tests/') || file.includes('/test/') || file.includes('/__tests__/')) {
        logger.verbose(`Skipping test file: ${file}`);
        return false;
      }
      if (
        file.endsWith('.test.js') ||
        file.endsWith('.test.ts') ||
        file.endsWith('.spec.js') ||
        file.endsWith('.spec.ts')
      ) {
        logger.verbose(`Skipping test file: ${file}`);
        return false;
      }
      if (file.endsWith('Test.php') || file.endsWith('Test.java') || file.endsWith('_test.py')) {
        logger.verbose(`Skipping test file: ${file}`);
        return false;
      }

      if (file.endsWith('.gitignore') || file.endsWith('.env') || file.endsWith('.env.example')) {
        logger.verbose(`Skipping config file: ${file}`);
        return false;
      }
      if (
        file.endsWith('package.json') ||
        file.endsWith('package-lock.json') ||
        file.endsWith('composer.json')
      ) {
        logger.verbose(`Skipping config file: ${file}`);
        return false;
      }
      if (file.endsWith('.md') || file.endsWith('.txt') || file.endsWith('LICENSE')) {
        logger.verbose(`Skipping documentation file: ${file}`);
        return false;
      }

      if (file.includes('/dist/') || file.includes('/build/') || file.includes('/vendor/')) {
        logger.verbose(`Skipping build/dist file: ${file}`);
        return false;
      }

      if (file.includes('.diffshot/')) {
        logger.verbose(`Skipping .diffshot file: ${file}`);
        return false;
      }

      return true;
    });

    if (allFiles.length !== filteredFiles.length) {
      logger.verbose(
        `Filtered ${allFiles.length} total files down to ${filteredFiles.length} UI-relevant files`
      );
    }

    return filteredFiles;
  } catch (error) {
    throw new DiffShotError(
      'Failed to get git diff. Ensure you are in a git repository.',
      'GIT_DIFF_FAILED',
      { branch, error }
    );
  }
}

export function getGitDiff(branch: string = 'UNCOMMITTED', cwd: string = process.cwd()): string {
  try {
    let gitCommand: string;

    if (branch !== 'UNCOMMITTED') {
      gitCommand = `git diff ${branch}`;
    } else {
      const unstagedDiff = execSync('git diff', { encoding: 'utf-8', cwd });
      const stagedDiff = execSync('git diff --cached', { encoding: 'utf-8', cwd });
      return unstagedDiff + stagedDiff;
    }

    return execSync(gitCommand, { encoding: 'utf-8', cwd });
  } catch (error) {
    logger.verbose(`Failed to get git diff: ${error}`);
    return '';
  }
}

export function isGitRepository(cwd: string = process.cwd()): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
