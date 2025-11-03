import { Language } from '../shared/Language';
import { IFormatter, BaseFormatter, TypeScriptFormatter, PythonFormatter } from './Formatter';

/**
 * Factory for creating language-specific formatters
 */
export class FormatterFactory {
  private static formatters = new Map<string, typeof BaseFormatter>();

  static {
    // Register formatters properly without type casting
    this.formatters.set('TypeScript', TypeScriptFormatter);
    this.formatters.set('JavaScript', TypeScriptFormatter);
    this.formatters.set('Python', PythonFormatter);
  }

  public static createFormatter(language: Language): IFormatter {
    const FormatterClass = this.formatters.get(language.name);

    if (FormatterClass) {
      return new FormatterClass(language);
    }

    // Return default formatter for unsupported languages
    return new DefaultFormatter(language);
  }

  public static registerFormatter(
    languageName: string,
    formatterClass: typeof BaseFormatter
  ): void {
    this.formatters.set(languageName, formatterClass);
  }
}

/**
 * Default formatter for languages without specific implementation
 */
class DefaultFormatter extends BaseFormatter {
  // Uses base formatter implementation
}