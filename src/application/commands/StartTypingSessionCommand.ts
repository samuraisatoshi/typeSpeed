import { ICodeFileRepository } from '../../domain/codeSource/CodeFileRepository';
import { TypingSession } from '../../domain/typing/TypingSession';
import { Language } from '../../domain/shared/Language';
import { FormatterFactory } from '../../domain/codeFormatter/FormatterFactory';
import { SyntaxHighlighter } from '../../domain/codeFormatter/SyntaxHighlighter';

export interface StartTypingSessionInput {
  language?: string;
  userId: string;
}

export interface StartTypingSessionOutput {
  sessionId: string;
  codeSnippet: string;
  formattedCode: string;
  highlightedHtml: string;
  language: string;
  difficulty: number;
}

/**
 * Command handler for starting a new typing session
 */
export class StartTypingSessionCommand {
  constructor(
    private readonly codeFileRepository: ICodeFileRepository,
    private readonly syntaxHighlighter: SyntaxHighlighter
  ) {}

  public async execute(input: StartTypingSessionInput): Promise<StartTypingSessionOutput | null> {
    // Get language if specified
    let language: Language | undefined;
    if (input.language) {
      language = Language.fromName(input.language) || undefined;
    }

    // Get random code file
    const codeFile = await this.codeFileRepository.getRandomFile(language);

    if (!codeFile) {
      return null;
    }

    // Create typing session
    const session = TypingSession.create(codeFile);

    // Format the code snippet
    const formatter = FormatterFactory.createFormatter(codeFile.language);
    const formattedCode = formatter.format(session.codeSnippet);

    // Highlight the code
    const tokens = this.syntaxHighlighter.highlight(formattedCode, codeFile.language);
    const highlightedHtml = this.syntaxHighlighter.toHTML(tokens);

    return {
      sessionId: session.id,
      codeSnippet: session.codeSnippet,
      formattedCode,
      highlightedHtml,
      language: codeFile.language.name,
      difficulty: codeFile.metadata.complexity
    };
  }
}