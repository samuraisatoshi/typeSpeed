import { ProjectScanner, ScanOptions, ScanResult } from '../../domain/codeSource/ProjectScanner';
import { ICodeFileRepository } from '../../domain/codeSource/CodeFileRepository';

export interface ScanProjectCommandInput {
  folderPath: string;
  options?: ScanOptions;
}

/**
 * Command handler for scanning project folders
 */
export class ScanProjectCommand {
  constructor(
    private readonly scanner: ProjectScanner,
    private readonly repository: ICodeFileRepository
  ) {}

  public async execute(input: ScanProjectCommandInput): Promise<ScanResult> {
    // Scan the folder
    const result = await this.scanner.scanFolder(input.folderPath, input.options);

    // Store files in repository
    for (const file of result.files) {
      await this.repository.save(file);
    }

    return result;
  }
}