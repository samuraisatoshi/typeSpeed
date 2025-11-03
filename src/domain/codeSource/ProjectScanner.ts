import * as fs from 'fs/promises';
import * as path from 'path';
import { FilePath } from '../shared/FilePath';
import { Language } from '../shared/Language';
import { CodeFile } from './CodeFile';

export interface ScanOptions {
  maxDepth?: number;
  includeHidden?: boolean;
  maxFileSize?: number;
  languages?: string[];
}

export interface ScanResult {
  files: CodeFile[];
  errors: string[];
  statistics: {
    totalFiles: number;
    totalSize: number;
    byLanguage: Map<string, number>;
  };
}

/**
 * Service for scanning project directories for source code files
 */
export class ProjectScanner {
  private static readonly IGNORED_DIRS = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'vendor',
    '__pycache__',
    '.vscode',
    '.idea',
    'target',
    'bin',
    'obj',
    '.next',
    '.nuxt',
    'coverage'
  ]);

  private static readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB default

  public async scanFolder(
    folderPath: string,
    options: ScanOptions = {}
  ): Promise<ScanResult> {
    const result: ScanResult = {
      files: [],
      errors: [],
      statistics: {
        totalFiles: 0,
        totalSize: 0,
        byLanguage: new Map()
      }
    };

    try {
      const normalizedPath = path.resolve(folderPath);
      await this.scanDirectory(normalizedPath, result, options, 0);
    } catch (error) {
      result.errors.push(`Failed to scan folder: ${error}`);
    }

    return result;
  }

  private async scanDirectory(
    dirPath: string,
    result: ScanResult,
    options: ScanOptions,
    depth: number
  ): Promise<void> {
    if (options.maxDepth !== undefined && depth > options.maxDepth) {
      return;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!this.shouldIgnoreDirectory(entry.name, options)) {
            await this.scanDirectory(fullPath, result, options, depth + 1);
          }
        } else if (entry.isFile()) {
          await this.processFile(fullPath, result, options);
        }
      }
    } catch (error) {
      result.errors.push(`Error scanning directory ${dirPath}: ${error}`);
    }
  }

  private shouldIgnoreDirectory(name: string, options: ScanOptions): boolean {
    if (!options.includeHidden && name.startsWith('.')) {
      return true;
    }

    return ProjectScanner.IGNORED_DIRS.has(name.toLowerCase());
  }

  private async processFile(
    filePath: string,
    result: ScanResult,
    options: ScanOptions
  ): Promise<void> {
    try {
      const extension = path.extname(filePath);
      const language = Language.fromExtension(extension);

      if (!language) {
        return; // Skip unsupported file types
      }

      // Check language filter
      if (options.languages && !options.languages.includes(language.name.toLowerCase())) {
        return;
      }

      // Check file size
      const stats = await fs.stat(filePath);
      const maxSize = options.maxFileSize || ProjectScanner.MAX_FILE_SIZE;

      if (stats.size > maxSize) {
        result.errors.push(`File too large: ${filePath} (${stats.size} bytes)`);
        return;
      }

      // Read and create CodeFile
      const content = await fs.readFile(filePath, 'utf-8');
      const filePathObj = FilePath.create(filePath);
      const codeFile = CodeFile.create(filePathObj, content);

      if (codeFile) {
        result.files.push(codeFile);
        result.statistics.totalFiles++;
        result.statistics.totalSize += stats.size;

        const langCount = result.statistics.byLanguage.get(language.name) || 0;
        result.statistics.byLanguage.set(language.name, langCount + 1);
      }
    } catch (error) {
      result.errors.push(`Error processing file ${filePath}: ${error}`);
    }
  }

  public filterByLanguage(files: CodeFile[], language: Language): CodeFile[] {
    return files.filter(file => file.language.equals(language));
  }

  public getRandomFile(files: CodeFile[], language?: Language): CodeFile | null {
    let filteredFiles = files;

    if (language) {
      filteredFiles = this.filterByLanguage(files, language);
    }

    if (filteredFiles.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * filteredFiles.length);
    return filteredFiles[randomIndex];
  }
}