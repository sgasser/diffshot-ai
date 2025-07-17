import { Todo, ToolUse, Message, ContentBlock } from '../types/index.js';
import { ANSI_COLORS as colors } from '../config/constants.js';
import {
  TOOL_DISPLAY_NAMES,
  ICONS,
  FORMAT,
  TEXT_PATTERNS,
  TOOL_CATEGORIES,
  SPINNER_FRAMES,
  ENV,
} from './formatter-constants.js';

const todoStateHistory = new Map<string, Todo[]>();
let spinnerIndex = 0;

function formatToolHeaderWithParens(displayName: string, params: string): string {
  const bullet = colors.green(ICONS.bullet);
  const name = colors.bold(displayName);
  return `\n${bullet}${name}${colors.gray('(')}${colors.white(params)}${colors.gray(')')}\n`;
}

function formatToolHeaderPlain(displayName: string): string {
  const bullet = colors.green(ICONS.bullet);
  const name = colors.bold(displayName);
  return `\n${bullet}${name}\n`;
}

function formatToolUseHeader(
  name: string,
  input: Record<string, unknown>,
  workDir: string
): string {
  const displayName = TOOL_DISPLAY_NAMES[name] || name;

  if (
    ['Read', 'Write', 'Edit', 'MultiEdit'].includes(name) &&
    typeof input.file_path === 'string'
  ) {
    return formatToolHeaderWithParens(displayName, makeRelative(input.file_path, workDir));
  }

  if (['Grep', 'Glob'].includes(name) && typeof input.pattern === 'string') {
    return formatToolHeaderWithParens(displayName, input.pattern);
  }
  switch (name) {
    case 'Bash':
      if (typeof input.command === 'string') {
        return formatToolHeaderWithParens(displayName, formatCommand(input.command));
      }
      break;
    case 'LS':
      if (typeof input.path === 'string') {
        return formatToolHeaderWithParens(displayName, makeRelative(input.path, workDir) + '/');
      }
      break;
    case 'WebSearch':
      if (typeof input.query === 'string') {
        return formatToolHeaderWithParens(displayName, input.query);
      }
      break;
    case 'WebFetch':
      if (typeof input.url === 'string') {
        return formatToolHeaderWithParens(displayName, input.url);
      }
      break;
    case 'Task':
      if (typeof input.description === 'string') {
        return formatToolHeaderWithParens(displayName, input.description);
      }
      break;
  }

  return formatToolHeaderPlain(displayName);
}

function formatTodoItem(todo: Todo): string {
  const getIcon = () => {
    switch (todo.status) {
      case 'completed':
        return colors.green(ICONS.checkboxFilled);
      case 'in_progress':
        return colors.cyan(ICONS.checkboxEmpty);
      default:
        return colors.gray(ICONS.checkboxEmpty);
    }
  };

  const getContent = () => {
    switch (todo.status) {
      case 'completed':
        return colors.strikethrough(colors.green(todo.content));
      case 'in_progress':
        return colors.cyan(todo.content);
      default:
        return colors.gray(todo.content);
    }
  };

  return `${FORMAT.indent}${getIcon()} ${getContent()}\n`;
}

function formatToolBody(name: string, input: Record<string, unknown>, workDir: string): string {
  const headerOnlyTools = [
    ...(TOOL_CATEGORIES.headerOnly as readonly string[]),
    'Write',
    'MultiEdit',
    'Edit',
    'Glob',
    'WebSearch',
    'WebFetch',
  ];

  if (headerOnlyTools.includes(name)) {
    return '';
  }
  switch (name) {
    case 'Grep':
      if (typeof input.path === 'string') {
        return formatParam(colors.gray('in ' + makeRelative(input.path, workDir)));
      }
      return '';

    case 'TodoWrite':
      if (Array.isArray(input.todos) && input.todos.length > 0) {
        const sessionId = 'default';
        todoStateHistory.set(sessionId, [...(input.todos as Todo[])]);
        return (input.todos as Todo[]).map(formatTodoItem).join('');
      }
      return '';

    case 'Task':
      if (typeof input.prompt === 'string') {
        return formatParam(colors.gray(input.prompt));
      }
      return '';
  }

  const keys = Object.keys(input).filter((k) => input[k]);
  if (keys.length > 0) {
    const value =
      typeof input[keys[0]] === 'string'
        ? (input[keys[0]] as string)
        : JSON.stringify(input[keys[0]]);
    return formatParam(value);
  }

  return '';
}

function formatToolUse(toolUse: ToolUse, workDir: string): string {
  const header = formatToolUseHeader(toolUse.name, toolUse.input, workDir);
  const body = formatToolBody(toolUse.name, toolUse.input, workDir);
  return header + body;
}

function formatParam(value: string, prefix: string = ''): string {
  return `${FORMAT.indent}${colors.gray(ICONS.treeNode)}${prefix}${value}\n`;
}

function formatCommand(cmd: string): string {
  return cmd;
}

function makeRelative(path: string, workDir: string): string {
  if (path.startsWith(workDir)) {
    const relative = path.substring(workDir.length);
    return relative.startsWith('/') ? relative.substring(1) : relative;
  }
  return path;
}

function isDebugMode(): boolean {
  return process.env[ENV.debug] === 'true';
}

function logDebug(label: string, data: unknown): void {
  if (isDebugMode()) {
    console.log(
      `[DEBUG] ${label}:`,
      typeof data === 'object' ? JSON.stringify(data, null, 2) : data
    );
  }
}

function formatToolResult(result: ContentBlock): string {
  logDebug('Tool Result Content Block', result);

  if (!result.output) return '';

  const lines = result.output.trim().split('\n');
  if (lines.length === 0) return '';

  if (lines[0].match(TEXT_PATTERNS.readLineCount)) {
    return `${FORMAT.indent}${ICONS.treeContinue}${colors.gray(lines[0])}\n`;
  }

  return lines
    .filter((line) => line.trim())
    .map((line, index) => {
      const prefix =
        index === 0 ? `${FORMAT.indent}${colors.gray(ICONS.treeNode)}` : FORMAT.indentContinue;
      return `${prefix}${colors.gray(line)}\n`;
    })
    .join('');
}

function shouldDisplayText(text: string, hasTools: boolean): boolean {
  const shouldSkip = TEXT_PATTERNS.skip.some((pattern) => pattern.test(text));
  const isImportant = TEXT_PATTERNS.important.some((pattern) => pattern.test(text));

  if (!shouldSkip || isImportant) {
    const isStatus = text.includes('created') || text.includes('Analysis') || text.includes('**');
    return isStatus || (!hasTools && text.length > FORMAT.minTextLength);
  }

  return false;
}

function formatAssistantMessage(message: Message, workDir: string): string {
  if (!message.message?.content) return '';

  let output = '';
  let hasTools = false;
  let lastContentWasTool = false;

  hasTools = message.message.content.some((content) => content.type === 'tool_use');

  for (const content of message.message.content) {
    if (content.type === 'text' && content.text?.trim()) {
      const text = content.text.trim();

      if (shouldDisplayText(text, hasTools)) {
        if (lastContentWasTool && output && !output.endsWith('\n\n')) {
          output += '\n';
        }
        output += '\n' + text + '\n';
      }
      lastContentWasTool = false;
    } else if (content.type === 'tool_use' && 'name' in content && 'input' in content) {
      output += formatToolUse(content as ToolUse, workDir);
      lastContentWasTool = true;
    } else if (content.type === 'tool_result' && content.output) {
      output += formatToolResult(content);
      lastContentWasTool = true;
    }
  }

  return output;
}

function formatResultMessage(message: Message): string {
  if (!message.total_cost_usd && !message.duration_ms) return '';

  let output = '\n' + colors.dim('─'.repeat(FORMAT.separatorLength)) + '\n';

  if (message.duration_ms) {
    output += colors.dim(`Duration: ${(message.duration_ms / 1000).toFixed(2)}s\n`);
  }

  if (message.total_cost_usd) {
    output += colors.dim(`Cost: $${message.total_cost_usd.toFixed(4)}\n`);
  }

  return output;
}

function extractMessageText(message: Message): string[] {
  if (!message.message?.content) return [];

  return message.message.content
    .filter((content) => content.type === 'text' && content.text?.trim())
    .map((content) => content.text?.trim() || '');
}

function formatSystemInitMessage(message: Message): string {
  logDebug('System init message', message);

  const texts = extractMessageText(message);
  let output = '';

  for (const text of texts) {
    if (text.length > 0 && !text.includes('Session started')) {
      output += colors.dim(`${FORMAT.indent}${text}`) + '\n';
    }
  }

  return output;
}

function formatErrorMessage(message: Message): string {
  const texts = extractMessageText(message);
  let output = '';

  for (const text of texts) {
    output += colors.yellow(`${FORMAT.indent}${ICONS.treeContinue}`) + colors.gray(text) + '\n';
  }

  return output;
}

function formatUnhandledMessage(message: Message): string {
  logDebug('Unhandled message type', { type: message.type, subtype: message.subtype });

  const texts = extractMessageText(message);
  let output = '';

  for (const text of texts) {
    if (TEXT_PATTERNS.apiError.test(text)) {
      output += colors.yellow(`${FORMAT.indent}${ICONS.treeContinue}`) + colors.gray(text) + '\n';
    }
  }

  return output;
}

export function formatMessage(message: Message, workDir: string = process.cwd()): string {
  logDebug('Message', message);

  switch (message.type) {
    case 'assistant':
      return formatAssistantMessage(message, workDir);

    case 'result':
      return formatResultMessage(message);

    case 'system':
      if (message.subtype === 'init') {
        return formatSystemInitMessage(message);
      }
      break;

    case 'error':
    case 'retry':
      return formatErrorMessage(message);
  }

  return formatUnhandledMessage(message);
}

export function formatHeader(title: string): string {
  const separator = colors.dim('─'.repeat(Math.min(title.length + 10, ENV.terminalWidth)));
  return colors.bold(title) + '\n' + separator + '\n';
}

export function formatSection(text: string): string {
  return `\n${colors.bold(ICONS.arrow + text)}\n`;
}

export function formatSuccess(text: string): string {
  return colors.green(ICONS.success) + text;
}

export function formatError(text: string): string {
  return colors.red(ICONS.error) + text;
}

export function formatInfo(text: string): string {
  return colors.blue(ICONS.info) + text;
}

export function formatWarning(text: string): string {
  return colors.yellow(ICONS.warning) + text;
}

export function getSpinner(): string {
  const frame = SPINNER_FRAMES[spinnerIndex];
  spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
  return colors.cyan(frame);
}
