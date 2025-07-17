import 'dotenv/config';
import path from 'path';
import ora from 'ora';
import { runDiffShot } from '../services/index.js';
import { initDiffShot } from './init.js';
import { setupAuth } from './setup-auth.js';
import { CLIOptions } from '../types/index.js';
import { CONFIG, ANSI_COLORS as colors } from '../config/index.js';
import { logger, getChangedFiles, configExists } from '../utils/index.js';

/**
 * CLI entry point for DiffShot
 * Detects changed files using git diff
 */
async function runCLI(): Promise<void> {
  const args = process.argv.slice(2);

  if (args[0] === 'init') {
    const initDir = args[1] ? path.resolve(args[1]) : process.cwd();
    const result = await initDiffShot(initDir);
    process.exit(result.success ? 0 : 1);
  }

  if (args[0] === 'setup-auth') {
    if (!args[1]) {
      logger.error('Credentials required for setup-auth');
      logger.info('\nUsage: diffshot-ai setup-auth "<credentials>"');
      logger.info('\nExamples:');
      logger.info('  diffshot-ai setup-auth "use test@example.com with password123"');
      logger.info('  diffshot-ai setup-auth "login as john.doe@company.com password MySecret"');
      logger.info('  diffshot-ai setup-auth "email: admin@test.com, pass: admin123"');
      process.exit(1);
    }

    const credentials = args[1];
    const authDir = args[2] ? path.resolve(args[2]) : process.cwd();
    const result = await setupAuth(authDir, credentials);
    process.exit(result.success ? 0 : 1);
  }

  const options: CLIOptions = {
    branch: 'UNCOMMITTED',
    dir: process.cwd(),
    dryRun: false,
    verbose: false,
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
DiffShot - Screenshot generation for code changes

Usage: diffshot-ai [path] [options]
       diffshot-ai <command> [path]

Commands:
  init [path]                        Initialize DiffShot configuration
  setup-auth "<credentials>" [path]  Set up authentication with provided credentials

Options:
  --branch <ref>          Git reference to compare against (default: detects current uncommitted changes)
  --dry-run               Show what would be done without actually doing it
  --verbose, -v           Enable verbose output for debugging
  --help, -h              Show this help message

Examples:
  # Initialize configuration in current directory
  diffshot-ai init
  
  # Initialize configuration in specific directory
  diffshot-ai init ../my-project
  
  # Set up authentication with credentials
  diffshot-ai setup-auth "use test@example.com with password123"
  
  # Natural language credentials examples
  diffshot-ai setup-auth "login as admin@test.com password admin123"
  diffshot-ai setup-auth "john.doe@company.com / MySecret"
  
  # Detect current uncommitted changes (default behavior)
  diffshot-ai
  
  # Compare with main branch
  diffshot-ai --branch main
  
  # Compare with origin/main
  diffshot-ai --branch origin/main
  
  # See what would be captured without doing it
  diffshot-ai --dry-run
  
  # Debug mode with verbose output
  diffshot-ai --verbose --branch main
  
  # Run in different directory
  diffshot-ai ../other-project
  
  # Run in different directory with options
  diffshot-ai ../other-project --branch main --dry-run

Common Issues:
  - No screenshots generated? Check if your dev server is running
  - Authentication required? Add login steps to DIFFSHOT.md
  - No changes detected? Try --branch main or --branch HEAD~3
`);
    process.exit(0);
  }

  if (args.length > 0 && !args[0].startsWith('--') && !args[0].startsWith('-')) {
    options.dir = path.resolve(args[0]);
    args.shift();
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    const match = arg.match(/^--(.+?)(?:=(.*))?$/);
    if (match) {
      const [, key, value] = match;

      if (key === 'dry-run') {
        options.dryRun = true;
      } else if (key === 'verbose' || key === 'v') {
        options.verbose = true;
      } else if (key === 'branch') {
        const val = value !== undefined ? value : i + 1 < args.length ? args[++i] : undefined;
        if (val === undefined || val.startsWith('--')) {
          logger.error('Error: --branch requires a value');
          logger.info('Example: diffshot-ai --branch main');
          process.exit(1);
        }
        options.branch = val;
      }
    }
  }

  if (options.verbose) {
    logger.setVerbose(true);
    logger.verbose('Verbose mode enabled');
  }

  const originalDir = process.cwd();
  const targetDir = path.resolve(originalDir, options.dir);

  try {
    process.chdir(targetDir);
  } catch {
    logger.error(`Cannot access directory: ${targetDir}`);
    logger.info('Make sure the directory exists and you have permission to access it');
    process.exit(1);
  }

  logger.header('DiffShot - Screenshot Generation for Code Changes');

  if (!configExists(targetDir)) {
    logger.error(`${CONFIG.FILE_NAME} not found in this directory`);
    logger.error('Run "diffshot-ai init" first to initialize DiffShot for this project');
    process.chdir(originalDir);
    process.exit(1);
  }

  logger.info('Using DIFFSHOT.md configuration\n');

  let changedFiles = [];
  const detectSpinner = ora('Detecting changed files using git diff...').start();

  try {
    logger.verbose(`Working directory: ${targetDir}`);
    logger.verbose(
      `Mode: ${options.branch === 'UNCOMMITTED' ? 'Detecting current uncommitted changes' : `Comparing against: ${options.branch}`}`
    );

    changedFiles = getChangedFiles(options.branch, targetDir);
    detectSpinner.succeed(
      `Found ${changedFiles.length} changed file${changedFiles.length !== 1 ? 's' : ''}`
    );

    if (changedFiles.length > 0) {
      changedFiles.forEach((file, index) => {
        const prefix = index === 0 ? '  └─ ' : '     ';
        console.log(prefix + colors.cyan('◆ ') + colors.white(file));
      });
    }
  } catch (error) {
    detectSpinner.fail('Failed to get git diff');
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(errorMessage);
    logger.info('\nPossible solutions:');
    logger.info("  1. Make sure you're in a git repository");
    logger.info('  2. Try using --branch main or --branch master');
    logger.info('  3. Check if the branch exists: git branch -a');
    process.chdir(originalDir);
    process.exit(1);
  }

  if (changedFiles.length === 0) {
    logger.info('No changes detected. Try:');
    logger.info('  diffshot --branch main');
    logger.info('  diffshot --branch HEAD~3');
    process.chdir(originalDir);
    process.exit(0);
  }

  if (options.dryRun) {
    logger.info('\n🔍 DRY RUN MODE');
    logger.info('\nWould capture screenshots for:');
    changedFiles.forEach((f) => logger.info(`  - ${f}`));
    logger.info('\nRun without --dry-run to generate screenshots');
    process.chdir(originalDir);
    process.exit(0);
  }

  try {
    const result = await runDiffShot({
      changedFiles,
      workDir: targetDir,
      branch: options.branch,
    });

    if (result.success) {
      if (result.screenshots && result.screenshots > 0) {
        logger.success(
          `\nGenerated ${result.screenshots} screenshot${result.screenshots !== 1 ? 's' : ''}`
        );
        logger.info(`📸 Output: ${path.resolve(result.outputDir || CONFIG.OUTPUT_DIR)}`);

        if (result.markdownSummary) {
          logger.info('\n📝 Markdown Summary (copy for PR comments):');
          logger.info('━'.repeat(60));
          console.log(result.markdownSummary);
          logger.info('━'.repeat(60));
        }
      } else {
        logger.warning('\nNo screenshots were generated');
        logger.info('This might happen if:');
        logger.info("  - The changes don't affect UI components");
        logger.info("  - The AI couldn't determine which pages to capture");
        logger.info("  - Your dev server isn't running");

        if (result.markdownSummary) {
          logger.info('\n📝 Markdown Summary (copy for PR comments):');
          logger.info('━'.repeat(60));
          console.log(result.markdownSummary);
          logger.info('━'.repeat(60));
        }
      }
    } else {
      logger.error('\nScreenshot generation failed');
      if (result.error) {
        logger.error(`Error: ${result.error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error('Fatal error: ' + String(error));
    process.exit(1);
  } finally {
    process.chdir(originalDir);
  }
}

runCLI();
