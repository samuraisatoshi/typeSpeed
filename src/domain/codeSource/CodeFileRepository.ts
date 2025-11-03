import { CodeFile, CodeFileId } from './CodeFile';
import { Language } from '../shared/Language';

/**
 * Repository interface for CodeFile persistence
 */
export interface ICodeFileRepository {
  save(file: CodeFile): Promise<void>;
  findById(id: CodeFileId): Promise<CodeFile | null>;
  findByLanguage(language: Language): Promise<CodeFile[]>;
  findAll(): Promise<CodeFile[]>;
  getRandomFile(language?: Language): Promise<CodeFile | null>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

/**
 * In-memory implementation of CodeFileRepository
 */
export class InMemoryCodeFileRepository implements ICodeFileRepository {
  private files: Map<CodeFileId, CodeFile> = new Map();

  public async save(file: CodeFile): Promise<void> {
    this.files.set(file.id, file);
  }

  public async findById(id: CodeFileId): Promise<CodeFile | null> {
    return this.files.get(id) || null;
  }

  public async findByLanguage(language: Language): Promise<CodeFile[]> {
    const result: CodeFile[] = [];

    for (const file of this.files.values()) {
      if (file.language.equals(language)) {
        result.push(file);
      }
    }

    return result;
  }

  public async findAll(): Promise<CodeFile[]> {
    return Array.from(this.files.values());
  }

  public async getRandomFile(language?: Language): Promise<CodeFile | null> {
    let candidates: CodeFile[];

    if (language) {
      candidates = await this.findByLanguage(language);
    } else {
      candidates = await this.findAll();
    }

    if (candidates.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  public async clear(): Promise<void> {
    this.files.clear();
  }

  public async count(): Promise<number> {
    return this.files.size;
  }
}