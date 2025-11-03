/**
 * CodeSnippetSelector Domain Service
 * Selects interesting code snippets from files
 * Single Responsibility: Smart selection of practice snippets
 */
export class CodeSnippetSelector {
    selectSnippet(content, maxLines = 50) {
        const lines = content.split('\n');

        if (lines.length <= maxLines) {
            return content;
        }

        // Try to find interesting code sections
        let bestSnippet = null;
        let bestScore = -1;

        for (let attempt = 0; attempt < 5; attempt++) {
            const startLine = Math.floor(Math.random() * Math.max(1, lines.length - maxLines));
            const snippet = lines.slice(startLine, startLine + maxLines);

            const score = this.scoreSnippet(snippet);

            if (score > bestScore) {
                bestScore = score;
                bestSnippet = snippet;
            }

            // Good enough snippet found
            if (score > 0.6) {
                break;
            }
        }

        return bestSnippet ? bestSnippet.join('\n') :
               lines.slice(0, maxLines).join('\n');
    }

    scoreSnippet(lines) {
        let nonEmptyLines = 0;
        let codeLines = 0;
        const totalLines = lines.length;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
                nonEmptyLines++;
                // Not just a comment or import
                if (!this.isCommentOrImport(trimmed)) {
                    codeLines++;
                }
            }
        }

        // Score based on code density
        return (nonEmptyLines / totalLines) * 0.5 + (codeLines / totalLines) * 0.5;
    }

    isCommentOrImport(line) {
        return line.startsWith('//') ||
               line.startsWith('#') ||
               line.startsWith('/*') ||
               line.startsWith('*') ||
               line.startsWith('import') ||
               line.startsWith('from') ||
               line.startsWith('using') ||
               line.startsWith('include');
    }
}