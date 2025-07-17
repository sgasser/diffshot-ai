import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger.js';

interface GlobalConfig {
  apiKey?: string;
  claudeCodeToken?: string;
  defaultBranch?: string;
  lastUpdated?: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configDir: string;
  private configPath: string;
  private config: GlobalConfig = {};

  private constructor() {
    // Use XDG Base Directory spec on Linux/macOS, APPDATA on Windows
    if (process.platform === 'win32') {
      this.configDir = path.join(
        process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
        'diffshot'
      );
    } else {
      // Use ~/.config/diffshot on Unix-like systems
      this.configDir = path.join(os.homedir(), '.config', 'diffshot');
    }
    this.configPath = path.join(this.configDir, 'config.json');
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
    } catch (error) {
      logger.error(`Failed to create config directory: ${error}`);
    }
  }

  async load(): Promise<GlobalConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
      return this.config;
    } catch {
      // Config doesn't exist yet, return empty config
      return {};
    }
  }

  async save(): Promise<void> {
    await this.ensureConfigDir();
    this.config.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), {
      mode: 0o600, // Read/write for owner only
    });
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.load();
    this.config.apiKey = apiKey;
    await this.save();
  }

  async setClaudeCodeToken(token: string): Promise<void> {
    await this.load();
    this.config.claudeCodeToken = token;
    await this.save();
  }

  async getApiKey(): Promise<string | undefined> {
    await this.load();
    return this.config.apiKey;
  }

  async getClaudeCodeToken(): Promise<string | undefined> {
    await this.load();
    return this.config.claudeCodeToken;
  }

  async clearConfig(): Promise<void> {
    this.config = {};
    try {
      await fs.unlink(this.configPath);
    } catch {
      // File doesn't exist, ignore
    }
  }

  getConfigPath(): string {
    return this.configPath;
  }
}

export const configManager = ConfigManager.getInstance();
