import { Language } from '../shared/Language';

export interface HighlightedToken {
  text: string;
  type: TokenType;
  position: number;
}

export enum TokenType {
  Keyword = 'keyword',
  String = 'string',
  Number = 'number',
  Comment = 'comment',
  Function = 'function',
  Variable = 'variable',
  Operator = 'operator',
  Punctuation = 'punctuation',
  Type = 'type',
  Plain = 'plain'
}

/**
 * Service for syntax highlighting code
 */
export class SyntaxHighlighter {
  private theme: string = 'default';

  public highlight(code: string, language: Language): HighlightedToken[] {
    const tokens: HighlightedToken[] = [];
    const keywords = new Set(language.keywords);

    // Simple tokenizer - splits by common delimiters while preserving them
    const pattern = /(\s+|[(){}[\];,.]|\/\/.*$|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|`[^`]*`|\d+|\w+|[+\-*/=<>!&|]+)/gm;
    let match;
    let position = 0;

    while ((match = pattern.exec(code)) !== null) {
      const text = match[0];

      const token: HighlightedToken = {
        text,
        type: this.getTokenType(text, keywords),
        position
      };

      tokens.push(token);
      position += text.length;
    }

    return tokens;
  }

  private getTokenType(text: string, keywords: Set<string>): TokenType {
    // Comments
    if (text.startsWith('//') || text.startsWith('/*')) {
      return TokenType.Comment;
    }

    // Strings
    if (/^["'`].*["'`]$/.test(text)) {
      return TokenType.String;
    }

    // Numbers
    if (/^\d+(\.\d+)?$/.test(text)) {
      return TokenType.Number;
    }

    // Keywords
    if (keywords.has(text)) {
      return TokenType.Keyword;
    }

    // Operators
    if (/^[+\-*/=<>!&|]+$/.test(text)) {
      return TokenType.Operator;
    }

    // Punctuation
    if (/^[(){}[\];,.]$/.test(text)) {
      return TokenType.Punctuation;
    }

    // Function names (simplified heuristic)
    if (/^[a-zA-Z_]\w*$/.test(text) && text.charAt(0) === text.charAt(0).toLowerCase()) {
      return TokenType.Function;
    }

    // Type names (capitalized identifiers)
    if (/^[A-Z]\w*$/.test(text)) {
      return TokenType.Type;
    }

    return TokenType.Plain;
  }

  public setTheme(theme: string): void {
    this.theme = theme;
  }

  public getTheme(): string {
    return this.theme;
  }

  public getTokenStyles(): Record<TokenType, string> {
    // CSS classes for each token type
    return {
      [TokenType.Keyword]: 'text-blue-600 font-semibold',
      [TokenType.String]: 'text-green-600',
      [TokenType.Number]: 'text-orange-600',
      [TokenType.Comment]: 'text-gray-500 italic',
      [TokenType.Function]: 'text-purple-600',
      [TokenType.Variable]: 'text-gray-800',
      [TokenType.Operator]: 'text-red-600',
      [TokenType.Punctuation]: 'text-gray-600',
      [TokenType.Type]: 'text-teal-600',
      [TokenType.Plain]: 'text-gray-800'
    };
  }

  public toHTML(tokens: HighlightedToken[]): string {
    const styles = this.getTokenStyles();

    return tokens.map(token => {
      const className = styles[token.type] || styles[TokenType.Plain];
      const escapedText = this.escapeHTML(token.text);

      return `<span class="${className}">${escapedText}</span>`;
    }).join('');
  }

  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}