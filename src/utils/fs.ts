import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/constants.js';

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function configExists(workDir: string): boolean {
  return fs.existsSync(path.join(workDir, CONFIG.FILE_NAME));
}

export function readConfig(workDir: string): string {
  const configPath = path.join(workDir, CONFIG.FILE_NAME);
  return fs.readFileSync(configPath, 'utf-8');
}

export async function writeConfig(workDir: string, content: string): Promise<void> {
  const configPath = path.join(workDir, CONFIG.FILE_NAME);
  await fs.promises.writeFile(configPath, content);
}

export function getScreenshotFiles(workDir: string): string[] {
  const outputDir = path.join(workDir, CONFIG.OUTPUT_DIR);

  if (!fs.existsSync(outputDir)) {
    return [];
  }

  return fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith('.png') && f !== CONFIG.INIT_SCREENSHOT);
}

export async function readFile(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  return fs.promises.readFile(filePath, encoding);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(
  dirPath: string,
  filter?: (file: string) => boolean
): Promise<string[]> {
  const files = await fs.promises.readdir(dirPath);
  return filter ? files.filter(filter) : files;
}
