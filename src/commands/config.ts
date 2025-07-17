import { configManager, logger, prompt, confirm } from '../utils/index.js';

interface ConfigResult {
  success: boolean;
  message?: string;
}

export async function runConfig(args: string[]): Promise<ConfigResult> {
  const firstArg = args[0];

  // Handle help
  if (firstArg === '--help' || firstArg === '-h') {
    showHelp();
    return { success: true };
  }

  // Handle clear
  if (firstArg === '--clear') {
    return handleClear();
  }

  // Handle direct API key setting (for automation)
  if (firstArg === 'apiKey' && args[1]) {
    return handleSetApiKey(args[1]);
  }

  // Default to interactive mode
  if (!firstArg) {
    return await runInteractiveConfig();
  }

  // Unknown argument
  logger.error(`Unknown option: ${firstArg}`);
  showHelp();
  return { success: false };
}

function showHelp(): void {
  console.log(`
DiffShot Config - Manage DiffShot configuration

Usage: diffshot config [options]

Options:
  (none)              Interactive configuration mode
  apiKey <key>        Set API key directly (for automation)
  --clear             Clear all configuration
  --help, -h          Show this help message

Examples:
  diffshot config                    # Interactive mode (recommended)
  diffshot config apiKey sk-ant-...  # Set API key directly
  diffshot config --clear            # Clear all configuration

The interactive mode allows you to:
  - Set Anthropic API Key or Claude Code OAuth Token
  - View current configuration (masked)
  - Clear configuration
  - See where config is stored
`);
}

async function handleSetApiKey(apiKey: string): Promise<ConfigResult> {
  if (!apiKey.startsWith('sk-ant-api')) {
    logger.error('Invalid API key format. Expected format: sk-ant-api...');
    return { success: false };
  }
  await configManager.setApiKey(apiKey);
  logger.success(`API key saved to ${configManager.getConfigPath()}`);
  return { success: true };
}

async function handleClear(): Promise<ConfigResult> {
  const confirmed = await confirm('This will clear all configuration. Are you sure?');
  if (!confirmed) {
    logger.info('Cancelled');
    return { success: true };
  }

  await configManager.clearConfig();
  logger.success('Configuration cleared');
  return { success: true };
}

async function runInteractiveConfig(): Promise<ConfigResult> {
  logger.header('DiffShot Configuration');
  logger.info('\nManage your API keys for accessing Claude AI\n');

  const choices = [
    '1. Set Anthropic API Key',
    '2. Set Claude Code OAuth Token',
    '3. View current configuration',
    '4. Clear all configuration',
    '5. Exit',
  ];

  choices.forEach((choice) => logger.info(choice));

  const choice = await prompt('\nSelect an option (1-5): ');

  switch (choice) {
    case '1': {
      logger.info('\n📖 Anthropic API Key');
      logger.info('Get your API key from: https://console.anthropic.com/settings/keys');
      logger.info('\nAPI keys look like: sk-ant-api03-...');
      logger.info('\nIMPORTANT: Keep your API key secure and never share it publicly\n');

      const apiKey = await prompt('Paste your API key here: ', true);
      if (!apiKey) {
        logger.error('\nNo API key provided');
        return { success: false };
      }
      if (!apiKey.startsWith('sk-ant-api')) {
        logger.error('\nInvalid API key format. Expected format: sk-ant-api...');
        return { success: false };
      }
      await configManager.setApiKey(apiKey);
      logger.success(`\n✅ API key saved to ${configManager.getConfigPath()}`);
      return { success: true };
    }

    case '2': {
      logger.info('\n📖 Claude Code OAuth Token');
      logger.info('This token is used by the Claude Code CLI tool');
      logger.info('\nTokens look like: sk-ant-oat...');
      logger.info('\nIMPORTANT: Keep your token secure and never share it publicly\n');

      const token = await prompt('Paste your OAuth token here: ', true);
      if (!token) {
        logger.error('\nNo token provided');
        return { success: false };
      }
      if (!token.startsWith('sk-ant-oat')) {
        logger.error('\nInvalid token format. Expected format: sk-ant-oat...');
        return { success: false };
      }
      await configManager.setClaudeCodeToken(token);
      logger.success(`\n✅ Token saved to ${configManager.getConfigPath()}`);
      return { success: true };
    }

    case '3': {
      logger.info('\n📋 Current Configuration:\n');
      const apiKey = await configManager.getApiKey();
      const token = await configManager.getClaudeCodeToken();

      if (apiKey) {
        const masked = `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`;
        logger.info(`API Key: ${masked}`);
      } else {
        logger.info('API Key: Not set');
      }

      if (token) {
        const masked = `${token.substring(0, 10)}...${token.substring(token.length - 4)}`;
        logger.info(`Claude Token: ${masked}`);
      } else {
        logger.info('Claude Token: Not set');
      }

      logger.info(`\nConfig location: ${configManager.getConfigPath()}`);
      return { success: true };
    }

    case '4': {
      const confirmed = await confirm('\nThis will clear all configuration. Are you sure?');
      if (!confirmed) {
        logger.info('\nCancelled');
        return { success: true };
      }
      await configManager.clearConfig();
      logger.success('\n✅ Configuration cleared');
      return { success: true };
    }

    case '5':
      logger.info('\nGoodbye!');
      return { success: true };

    default:
      logger.error('\nInvalid choice');
      return { success: false };
  }
}
