import { ANSI_COLORS as colors } from '../config/constants.js';

export class Logger {
  private static instance: Logger;
  private isDebug: boolean;
  private isVerbose: boolean = false;

  constructor() {
    this.isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  }

  setVerbose(verbose: boolean): void {
    this.isVerbose = verbose;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    console.log(message);
  }

  success(message: string): void {
    console.log(colors.green('✓ ') + message);
  }

  error(message: string): void {
    console.error(colors.red('✗ ') + message);
  }

  warning(message: string): void {
    console.log(colors.yellow('⚠ ') + message);
  }

  debug(message: string, data?: unknown): void {
    if (this.isDebug || this.isVerbose) {
      console.log(colors.gray('[DEBUG] ' + message));
      if (data) {
        console.log(colors.gray(JSON.stringify(data, null, 2)));
      }
    }
  }

  verbose(message: string): void {
    if (this.isVerbose) {
      console.log(colors.gray('→ ' + message));
    }
  }

  header(title: string): void {
    const terminalWidth = process.stdout.columns || 80;
    const separator = colors.dim('─'.repeat(Math.min(title.length + 10, terminalWidth)));
    console.log(colors.bold(title) + '\n' + separator + '\n');
  }

  section(text: string): void {
    console.log('\n' + colors.bold('▶ ' + text) + '\n');
  }
}

export const logger = Logger.getInstance();
