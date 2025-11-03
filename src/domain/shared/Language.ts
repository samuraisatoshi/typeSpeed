import { ValueObject } from './ValueObject';

export interface LanguageConfig {
  name: string;
  extensions: string[];
  formatter: string;
  indentSize: number;
  tabsOrSpaces: 'tabs' | 'spaces';
  keywords: string[];
}

/**
 * Value object representing a programming language
 */
export class Language extends ValueObject<LanguageConfig> {
  private static readonly LANGUAGES: Map<string, LanguageConfig> = new Map([
    ['typescript', {
      name: 'TypeScript',
      extensions: ['.ts', '.tsx'],
      formatter: 'prettier',
      indentSize: 2,
      tabsOrSpaces: 'spaces',
      keywords: ['function', 'const', 'let', 'var', 'class', 'interface', 'type', 'import', 'export', 'if', 'else', 'for', 'while', 'return']
    }],
    ['javascript', {
      name: 'JavaScript',
      extensions: ['.js', '.jsx', '.mjs'],
      formatter: 'prettier',
      indentSize: 2,
      tabsOrSpaces: 'spaces',
      keywords: ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'if', 'else', 'for', 'while', 'return']
    }],
    ['python', {
      name: 'Python',
      extensions: ['.py', '.pyw'],
      formatter: 'black',
      indentSize: 4,
      tabsOrSpaces: 'spaces',
      keywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'return', 'yield', 'with', 'as', 'try', 'except']
    }],
    ['swift', {
      name: 'Swift',
      extensions: ['.swift'],
      formatter: 'swiftformat',
      indentSize: 2,
      tabsOrSpaces: 'spaces',
      keywords: ['func', 'var', 'let', 'class', 'struct', 'enum', 'protocol', 'import', 'if', 'else', 'for', 'while', 'return', 'guard']
    }],
    ['c', {
      name: 'C',
      extensions: ['.c', '.h'],
      formatter: 'clang-format',
      indentSize: 4,
      tabsOrSpaces: 'spaces',
      keywords: ['int', 'char', 'float', 'double', 'void', 'if', 'else', 'for', 'while', 'return', 'struct', 'typedef', 'include', 'define']
    }],
    ['cpp', {
      name: 'C++',
      extensions: ['.cpp', '.hpp', '.cc', '.cxx'],
      formatter: 'clang-format',
      indentSize: 4,
      tabsOrSpaces: 'spaces',
      keywords: ['int', 'char', 'float', 'double', 'void', 'class', 'public', 'private', 'protected', 'if', 'else', 'for', 'while', 'return', 'namespace', 'using', 'template']
    }],
    ['java', {
      name: 'Java',
      extensions: ['.java'],
      formatter: 'google-java-format',
      indentSize: 2,
      tabsOrSpaces: 'spaces',
      keywords: ['class', 'public', 'private', 'protected', 'static', 'final', 'void', 'int', 'String', 'if', 'else', 'for', 'while', 'return', 'import', 'package']
    }],
    ['rust', {
      name: 'Rust',
      extensions: ['.rs'],
      formatter: 'rustfmt',
      indentSize: 4,
      tabsOrSpaces: 'spaces',
      keywords: ['fn', 'let', 'mut', 'const', 'struct', 'enum', 'impl', 'trait', 'use', 'if', 'else', 'for', 'while', 'loop', 'match', 'return']
    }],
    ['go', {
      name: 'Go',
      extensions: ['.go'],
      formatter: 'gofmt',
      indentSize: 0,
      tabsOrSpaces: 'tabs',
      keywords: ['func', 'var', 'const', 'type', 'struct', 'interface', 'package', 'import', 'if', 'else', 'for', 'range', 'return', 'defer', 'go']
    }],
    ['ruby', {
      name: 'Ruby',
      extensions: ['.rb'],
      formatter: 'rubocop',
      indentSize: 2,
      tabsOrSpaces: 'spaces',
      keywords: ['def', 'class', 'module', 'if', 'else', 'elsif', 'unless', 'for', 'while', 'until', 'return', 'yield', 'require', 'include']
    }]
  ]);

  private constructor(config: LanguageConfig) {
    super(config);
  }

  public static fromExtension(extension: string): Language | null {
    const normalizedExt = extension.toLowerCase();

    for (const [, config] of Language.LANGUAGES) {
      if (config.extensions.includes(normalizedExt)) {
        return new Language(config);
      }
    }

    return null;
  }

  public static fromName(name: string): Language | null {
    const config = Language.LANGUAGES.get(name.toLowerCase());
    return config ? new Language(config) : null;
  }

  public static getAllSupported(): Language[] {
    return Array.from(Language.LANGUAGES.values()).map(config => new Language(config));
  }

  public get name(): string {
    return this.value.name;
  }

  public get extensions(): string[] {
    return [...this.value.extensions];
  }

  public get formatter(): string {
    return this.value.formatter;
  }

  public get indentSize(): number {
    return this.value.indentSize;
  }

  public get keywords(): string[] {
    return [...this.value.keywords];
  }

  public isExtensionSupported(extension: string): boolean {
    return this.value.extensions.includes(extension.toLowerCase());
  }
}