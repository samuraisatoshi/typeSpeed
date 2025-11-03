import { Language } from '../shared/Language';

/**
 * Interface for code formatters
 */
export interface IFormatter {
  format(code: string): string;
  normalizeIndentation(code: string): string;
  normalizeLineEndings(code: string): string;
}

/**
 * Base formatter with common formatting operations
 */
export class BaseFormatter implements IFormatter {
  protected language: Language;

  constructor(language: Language) {
    this.language = language;
  }

  public format(code: string): string {
    let formatted = code;
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.normalizeIndentation(formatted);
    formatted = this.removeTrailingWhitespace(formatted);
    return formatted;
  }

  public normalizeLineEndings(code: string): string {
    return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  public normalizeIndentation(code: string): string {
    const lines = code.split('\n');
    const indentChar = this.language.getValue().tabsOrSpaces === 'tabs' ? '\t' : ' ';
    const indentSize = this.language.indentSize || 2;
    const indentString = indentChar === '\t' ? '\t' : indentChar.repeat(indentSize);

    return lines.map(line => {
      if (line.trim() === '') return '';

      // Detect current indentation
      const match = line.match(/^(\s*)/);
      if (!match) return line;

      const currentIndent = match[1];
      const indentLevel = this.calculateIndentLevel(currentIndent);

      // Replace with normalized indentation
      const normalizedIndent = indentString.repeat(indentLevel);
      return normalizedIndent + line.trimStart();
    }).join('\n');
  }

  private calculateIndentLevel(indent: string): number {
    // Count tabs as one level
    const tabs = (indent.match(/\t/g) || []).length;

    // Count spaces (assuming 2 or 4 spaces per level)
    const spaces = indent.replace(/\t/g, '').length;
    const spacesPerLevel = this.language.indentSize || 2;
    const spaceLevel = Math.floor(spaces / spacesPerLevel);

    return tabs + spaceLevel;
  }

  private removeTrailingWhitespace(code: string): string {
    return code.split('\n').map(line => line.trimEnd()).join('\n');
  }
}

/**
 * TypeScript/JavaScript formatter
 */
export class TypeScriptFormatter extends BaseFormatter {
  public format(code: string): string {
    let formatted = super.format(code);

    // Add semicolons if missing (simplified)
    formatted = this.ensureSemicolons(formatted);

    return formatted;
  }

  private ensureSemicolons(code: string): string {
    const lines = code.split('\n');

    return lines.map(line => {
      const trimmed = line.trim();

      // Skip empty lines, comments, and lines that already end with semicolon
      if (
        !trimmed ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('*') ||
        trimmed.endsWith(';') ||
        trimmed.endsWith('{') ||
        trimmed.endsWith('}') ||
        trimmed.endsWith(',')
      ) {
        return line;
      }

      // Check if line should have semicolon
      const shouldHaveSemicolon = /^(const|let|var|return|import|export)\s+/.test(trimmed);

      if (shouldHaveSemicolon) {
        return line + ';';
      }

      return line;
    }).join('\n');
  }
}

/**
 * Python formatter
 */
export class PythonFormatter extends BaseFormatter {
  public format(code: string): string {
    let formatted = super.format(code);

    // Python-specific formatting
    formatted = this.ensureColons(formatted);

    return formatted;
  }

  private ensureColons(code: string): string {
    const lines = code.split('\n');

    return lines.map(line => {
      const trimmed = line.trim();

      // Check if line should end with colon
      if (
        /^(if|elif|else|for|while|with|def|class|try|except|finally)\s+/.test(trimmed) &&
        !trimmed.endsWith(':')
      ) {
        return line + ':';
      }

      return line;
    }).join('\n');
  }
}