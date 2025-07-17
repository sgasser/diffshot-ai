import { query } from '@anthropic-ai/claude-code';
import path from 'path';
import { fileURLToPath } from 'url';

import { InitResult } from '../types/index.js';
import { CONFIG, ENV_VARS } from '../config/index.js';
import {
  logger,
  formatMessage,
  configExists,
  readFile,
  fileExists,
  validateDiffShotConfig,
  displayValidationResult,
  loadPromptTemplate,
  configManager,
} from '../utils/index.js';

/**
 * Initialize DiffShot by analyzing the project with Claude and generating DIFFSHOT.md
 */

export async function initDiffShot(workDir: string = process.cwd()): Promise<InitResult> {
  // Check for existing API keys in global config
  const apiKey = await configManager.getApiKey();
  const claudeToken = await configManager.getClaudeCodeToken();

  if (!apiKey && !claudeToken) {
    logger.header('DiffShot Init');
    logger.error('No authentication found');
    logger.info('\nBefore initializing your project, please configure your API key:');
    logger.info('  diffshot-ai config');
    return { success: false };
  }

  // Set environment variables for this session
  if (apiKey) {
    process.env[ENV_VARS.API_KEY] = apiKey;
  }
  if (claudeToken) {
    process.env.CLAUDE_CODE_OAUTH_TOKEN = claudeToken;
  }

  logger.header('DiffShot Init');
  logger.info(`Working directory: ${workDir}\n`);

  const configPath = path.join(workDir, CONFIG.FILE_NAME);
  if (configExists(workDir)) {
    logger.error(`${CONFIG.FILE_NAME} already exists`);
    logger.info('Delete it first if you want to regenerate');
    return { success: false };
  }

  try {
    console.log('Analyzing your project...\n');

    const captureScriptPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'scripts',
      'capture-screenshot.js'
    );

    const prompt = await loadPromptTemplate('init.md', {
      captureScriptPath,
      configPath,
    });

    let errorDetails: string | null = null;
    let messageCount = 0;

    for await (const message of query({
      prompt: prompt,
      options: {
        cwd: workDir,
        permissionMode: 'bypassPermissions',
      },
    })) {
      messageCount++;

      if (message.type === 'result' && message.is_error) {
        if (message.subtype === 'success' && 'result' in message) {
          errorDetails = message.result;
        } else {
          errorDetails = `Claude Code error: ${message.subtype.replace(/_/g, ' ')}`;
        }
      }

      if (message.type === 'system' && message.subtype === 'init') {
        // Initial system message - no action needed
      }

      const formatted = formatMessage(message, workDir);
      if (formatted) {
        process.stdout.write(formatted);
      }
    }

    if (errorDetails) {
      throw new Error(`Claude Code SDK error: ${errorDetails}`);
    }

    if (messageCount === 0) {
      throw new Error('No messages received from Claude Code SDK - likely an authentication issue');
    }

    if (!configExists(workDir)) {
      logger.error('Failed to create DIFFSHOT.md');
      return { success: false };
    }

    logger.success('\nCreated DIFFSHOT.md with validated configuration\n');

    const screenshotPath = path.join(workDir, '.diffshot/screenshots/init.png');
    if (await fileExists(screenshotPath)) {
      logger.success('Initial screenshot saved as .diffshot/screenshots/init.png\n');
    }

    const finalContent = await readFile(configPath);
    const validation = validateDiffShotConfig(finalContent);

    if (!validation.valid || validation.warnings.length > 0) {
      logger.info('');
      displayValidationResult(validation);
    }

    console.log(finalContent);

    logger.info('\nNext steps:');
    logger.info('1. Review DIFFSHOT.md configuration');

    const content = await readFile(configPath);
    if (content.includes('## Authentication')) {
      logger.info('2. Set up authentication with your credentials:');
      logger.info('   diffshot-ai setup-auth "your-email@example.com with password"');
      logger.info('3. Run `diffshot-ai` to generate screenshots');
    } else {
      logger.info('2. Run `diffshot-ai` to generate screenshots');
    }

    return { success: true, configPath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Claude Code process exited with code 1')) {
      logger.error('Authentication failed');
      logger.info('\nThis usually means your API key or OAuth token is invalid.');
      logger.info('\nPlease check:');
      logger.info('  1. Your API key/token is correct and not expired');
      logger.info('  2. You have access to the Claude API');
      logger.info('\nPlease check your authentication:');
      logger.info('  diffshot-ai config');
    } else if (errorMessage.includes('No messages received')) {
      logger.error('Failed to communicate with Claude API');
      logger.info('\nThis might be due to network issues or invalid credentials.');
    } else {
      logger.error(`Error analyzing project: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        logger.error('Stack trace: ' + error.stack);
      }
    }

    return { success: false };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const targetDir = process.argv[2] || process.cwd();
  initDiffShot(targetDir)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Fatal error: ' + String(error));
      process.exit(1);
    });
}
