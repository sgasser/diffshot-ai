export interface DiffShotOptions {
  changedFiles?: string[];
  workDir?: string;
  branch?: string;
}

export interface DiffShotResult {
  success: boolean;
  scenarios?: number;
  screenshots?: number;
  outputDir?: string;
  error?: string;
  markdownSummary?: string;
}

export interface InitResult {
  success: boolean;
  configPath?: string;
}

export interface CLIOptions {
  branch: string;
  dir: string;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'high' | 'medium' | 'low';
}

export interface ToolUse {
  name: string;
  input: Record<string, unknown>;
}

export interface ContentBlock {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  output?: string;
  is_error?: boolean;
}

export interface Message {
  type: string;
  subtype?: string;
  message?: {
    content: ContentBlock[];
  };
  total_cost_usd?: number;
  duration_ms?: number;
}

export interface DiffShotConfig {
  devServer: {
    command: string;
    url: string;
  };
  framework: {
    type: string;
    language: string;
  };
  screenshots: {
    viewports: Record<string, number>;
    themes: {
      light: boolean;
      dark: boolean;
    };
  };
  authentication?: string;
}
