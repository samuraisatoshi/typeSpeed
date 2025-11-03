import { Entity } from '../shared/Entity';
import { FilePath } from '../shared/FilePath';
import { Language } from '../shared/Language';

export type CodeFileId = string;

export interface CodeFileMetadata {
  size: number;
  lines: number;
  lastModified: Date;
  complexity: number;
}

/**
 * Entity representing a source code file
 */
export class CodeFile extends Entity<CodeFileId> {
  private _path: FilePath;
  private _language: Language;
  private _content: string;
  private _metadata: CodeFileMetadata;

  constructor(
    id: CodeFileId,
    path: FilePath,
    language: Language,
    content: string,
    metadata: CodeFileMetadata
  ) {
    super(id);
    this._path = path;
    this._language = language;
    this._content = content;
    this._metadata = metadata;
  }

  public static create(
    filePath: FilePath,
    content: string
  ): CodeFile | null {
    const extension = filePath.getExtension();
    const language = Language.fromExtension(extension);

    if (!language) {
      return null;
    }

    const id = this.generateId(filePath);
    const metadata = this.calculateMetadata(content, language);

    return new CodeFile(id, filePath, language, content, metadata);
  }

  private static generateId(_path: FilePath): CodeFileId {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateMetadata(content: string, language: Language): CodeFileMetadata {
    const lines = content.split('\n');
    const size = Buffer.byteLength(content, 'utf-8');

    // Calculate complexity based on various factors
    let complexity = 1.0;

    // Symbol density
    const symbols = content.match(/[^a-zA-Z0-9\s]/g) || [];
    complexity += (symbols.length / content.length) * 0.5;

    // Keyword density
    const keywords = language.keywords;
    let keywordCount = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      keywordCount += matches ? matches.length : 0;
    });
    complexity += (keywordCount / lines.length) * 0.3;

    // Nesting depth (approximation)
    const maxIndent = Math.max(
      ...lines.map(line => {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
      })
    );
    complexity += (maxIndent / 40) * 0.2;

    return {
      size,
      lines: lines.length,
      lastModified: new Date(),
      complexity: Math.min(2.0, complexity)
    };
  }

  public get path(): FilePath {
    return this._path;
  }

  public get language(): Language {
    return this._language;
  }

  public get content(): string {
    return this._content;
  }

  public get metadata(): CodeFileMetadata {
    return { ...this._metadata };
  }

  public getSnippet(startLine: number, endLine: number): string {
    const lines = this._content.split('\n');
    return lines.slice(startLine - 1, endLine).join('\n');
  }

  public getRandomSnippet(minLines: number = 50, maxLines: number = 200): string {
    const lines = this._content.split('\n');

    if (lines.length <= minLines) {
      return this._content;
    }

    const snippetLength = Math.min(
      lines.length,
      Math.floor(Math.random() * (maxLines - minLines + 1)) + minLines
    );

    const maxStart = Math.max(0, lines.length - snippetLength);
    const startLine = Math.floor(Math.random() * (maxStart + 1));

    return lines.slice(startLine, startLine + snippetLength).join('\n');
  }
}