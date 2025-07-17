import { query } from '@anthropic-ai/claude-code';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONFIG, ENV_VARS } from '../config/index.js';
import {
  logger,
  formatMessage,
  configExists,
  readFile,
  fileExists,
  loadPromptTemplate,
  configManager,
} from '../utils/index.js';

interface SetupAuthResult {
  success: boolean;
  error?: string;
}

/**
 * Set up and verify authentication for the application
 * @param workDir - Working directory
 * @param credentials - Natural language credentials string (e.g., "use test@example.com with password123")
 */
export async function setupAuth(
  workDir: string = process.cwd(),
  credentials?: string
): Promise<SetupAuthResult> {
  // Check global config for authentication
  const apiKey = await configManager.getApiKey();
  const claudeToken = await configManager.getClaudeCodeToken();

  if (!apiKey && !claudeToken) {
    logger.header('DiffShot Auth Setup');
    logger.error('No authentication found');
    logger.info('\nPlease run the init command to set up authentication:');
    logger.info('  diffshot-ai init');
    return { success: false };
  }

  // Set environment variables for this session
  if (apiKey) {
    process.env[ENV_VARS.API_KEY] = apiKey;
  }
  if (claudeToken) {
    process.env.CLAUDE_CODE_OAUTH_TOKEN = claudeToken;
  }

  logger.header('DiffShot Auth Setup');
  logger.info(`Working directory: ${workDir}\n`);

  // Check if DIFFSHOT.md exists
  const configPath = path.join(workDir, CONFIG.FILE_NAME);
  if (!configExists(workDir)) {
    logger.error(`${CONFIG.FILE_NAME} not found. Run "diffshot-ai init" first.`);
    return { success: false };
  }

  try {
    // Read DIFFSHOT.md
    const config = await readFile(configPath);

    // Check if authentication section exists
    if (!config.includes('## Authentication')) {
      logger.info('No authentication required for this application');
      return { success: true };
    }

    logger.info('Setting up authentication...\n');

    const captureScriptPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'scripts',
      'capture-screenshot.js'
    );

    const prompt = await loadPromptTemplate('setup-auth.md', {
      config,
      captureScriptPath,
      credentials: credentials || 'No credentials provided - will need to be set manually',
    });

    let processInterrupted = false;
    const handleInterrupt = () => {
      processInterrupted = true;
      logger.warning('\nProcess interrupted by user');
    };

    process.on('SIGINT', handleInterrupt);
    process.on('SIGTERM', handleInterrupt);

    try {
      for await (const message of query({
        prompt,
        options: {
          cwd: workDir,
          permissionMode: 'bypassPermissions' as const,
          allowedTools: ['Read', 'Grep', 'Glob', 'Write', 'Edit', 'Bash', 'TodoWrite'],
        },
      })) {
        if (processInterrupted) {
          break;
        }

        const formatted = formatMessage(message, workDir);
        if (formatted) {
          process.stdout.write(formatted);
        }
      }
    } finally {
      process.removeListener('SIGINT', handleInterrupt);
      process.removeListener('SIGTERM', handleInterrupt);
    }

    if (processInterrupted) {
      return { success: false, error: 'Process interrupted by user' };
    }

    // Verify auth script was created
    const authScriptPath = path.join(workDir, '.diffshot', 'auth', 'login.js');
    if (!(await fileExists(authScriptPath))) {
      logger.error('\nAuth script was not created');
      return { success: false, error: 'Failed to create auth script' };
    }

    // If no credentials were provided, inform the user
    if (!credentials) {
      logger.warning('\nAuthentication script created but no credentials provided');
      logger.info('\nTo test authentication, run:');
      logger.info('  diffshot-ai setup-auth "your credentials here"');
      logger.info('\nExample:');
      logger.info('  diffshot-ai setup-auth "use test@example.com with password123"');
      return { success: true };
    }

    // If we have credentials and auth.json exists, authentication was successful
    const authJsonPath = path.join(workDir, '.diffshot', 'auth.json');
    if (await fileExists(authJsonPath)) {
      logger.success('\nAuthentication setup complete!');
      logger.info('Auth state saved to .diffshot/auth.json');
      logger.info('\nYou can now run "diffshot-ai" to generate screenshots');
      return { success: true };
    }

    logger.info('\nAuthentication script created');
    logger.info('Run this command again after setting credentials to verify authentication');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Claude Code process exited with code 1')) {
      logger.error('Authentication failed');
      logger.info('\nThis usually means your API key or OAuth token is invalid.');
    } else {
      logger.error(`Error setting up authentication: ${errorMessage}`);
    }

    return { success: false, error: errorMessage };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const credentials = process.argv[2];
  const targetDir = process.argv[3] || process.cwd();
  setupAuth(targetDir, credentials)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Fatal error: ' + String(error));
      process.exit(1);
    });
}
