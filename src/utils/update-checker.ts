import { promises as fs } from 'fs';
import https from 'https';
import path, { dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface UpdateCheckCache {
  lastCheck: number;
  lastVersion?: string;
  hasUpdate?: boolean;
}

interface NpmPackageInfo {
  'dist-tags': {
    latest: string;
  };
}

/**
 * Compare two semantic versions
 * Returns true if version2 is greater than version1
 */
function isNewerVersion(version1: string, version2: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [major1, minor1, patch1] = parse(version1);
  const [major2, minor2, patch2] = parse(version2);

  if (major2 > major1) return true;
  if (major2 < major1) return false;
  if (minor2 > minor1) return true;
  if (minor2 < minor1) return false;
  return patch2 > patch1;
}

/**
 * Get the cache file path
 */
function getCacheFilePath(): string {
  const configDir = path.join(homedir(), '.config', 'diffshot-ai');
  return path.join(configDir, 'update-check.json');
}

/**
 * Read the update check cache
 */
async function readCache(): Promise<UpdateCheckCache | null> {
  try {
    const cacheFile = getCacheFilePath();
    const data = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Write to the update check cache
 */
async function writeCache(cache: UpdateCheckCache): Promise<void> {
  try {
    const cacheFile = getCacheFilePath();
    const dir = path.dirname(cacheFile);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));
  } catch {
    // Silently fail - update checking is not critical
  }
}

/**
 * Fetch the latest version from npm registry
 */
function fetchLatestVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'registry.npmjs.org',
      path: '/diffshot-ai',
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      timeout: 3000, // 3 second timeout
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const packageInfo = JSON.parse(data) as NpmPackageInfo;
          resolve(packageInfo['dist-tags'].latest);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

/**
 * Get the current package version
 */
async function getCurrentVersion(): Promise<string> {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageData = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageData);
    return packageJson.version;
  } catch {
    return '0.0.0';
  }
}

/**
 * Check for updates (main function)
 */
export async function checkForUpdates(): Promise<void> {
  // Skip if --skip-update-check flag is present
  if (process.argv.includes('--skip-update-check')) {
    return;
  }

  try {
    const cache = await readCache();
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Check if we need to check for updates
    if (cache && now - cache.lastCheck < oneWeek) {
      // Use cached result if available and recent
      if (cache.hasUpdate) {
        showUpdateNotification(cache.lastVersion || 'latest');
      }
      return;
    }

    // Perform update check
    const currentVersion = await getCurrentVersion();
    const latestVersion = await fetchLatestVersion();

    if (!latestVersion) {
      // Failed to fetch, update cache timestamp only
      await writeCache({ lastCheck: now });
      return;
    }

    const hasUpdate = isNewerVersion(currentVersion, latestVersion);

    // Update cache
    await writeCache({
      lastCheck: now,
      lastVersion: latestVersion,
      hasUpdate,
    });

    // Show notification if update available
    if (hasUpdate) {
      showUpdateNotification(latestVersion);
    }
  } catch {
    // Silently fail - update checking is not critical
  }
}

/**
 * Show update notification to the user
 */
function showUpdateNotification(latestVersion: string): void {
  logger.info('\n');
  logger.warning(`Update available → ${latestVersion}`);
  logger.info('Run this command to update:');
  logger.info('  npm update -g diffshot-ai');
  logger.info('');
  logger.info('To disable these notifications, use: --skip-update-check');
}
