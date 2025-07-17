import { readFile } from './fs.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

/**
 * Load and process a prompt template with variable substitution
 */
export async function loadPromptTemplate(
  templateName: string,
  variables: Record<string, string> = {}
): Promise<string> {
  const templatePath = path.join(PROMPTS_DIR, templateName);
  const templateContent = await readFile(templatePath);

  return templateContent.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    if (variableName in variables) {
      return variables[variableName];
    }
    return match;
  });
}
