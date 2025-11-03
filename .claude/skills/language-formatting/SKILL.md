---
name: language-formatting
description: >
  Handles language-specific code formatting and preparation for typing practice.
  Use this when processing source code files for display, ensuring proper
  indentation, syntax highlighting setup, and character encoding.
  PROACTIVELY applies formatting rules based on detected language.
allowed-tools: Read, Write, Edit, Grep
---

# Language Formatting Skill

## When to Use This Skill
- Processing source code for typing practice
- Applying language-specific formatting rules
- Setting up syntax highlighting
- Handling special characters and encodings

## Language Configurations

### JavaScript/TypeScript
```javascript
// Standard formatting
const config = {
  indent: 2,
  semi: true,
  quotes: 'single',
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always'
};
```

### Python
```python
# PEP 8 compliance
config = {
    'indent': 4,
    'max_line_length': 79,
    'blank_lines': {
        'top_level': 2,
        'method': 1
    }
}
```

### C/C++
```c
// K&R style
struct Config {
    int indent_width = 4;
    bool spaces_not_tabs = true;
    char* bracket_style = "k&r";
};
```

### Swift
```swift
// Swift style guide
let config = Config(
    indent: .spaces(2),
    lineLength: 120,
    blankLines: .auto
)
```

## Formatting Rules

### Indentation Normalization
1. Detect existing indentation (tabs vs spaces)
2. Count indent width
3. Normalize to project standard
4. Preserve relative indentation

### Line Ending Handling
- Convert CRLF to LF
- Remove trailing whitespace
- Ensure final newline

### Character Encoding
- UTF-8 normalization
- BOM removal
- Special character handling
- Emoji and unicode support

## Code Snippet Selection

### Ideal Snippet Criteria
- 50-200 lines length
- Complete logical units
- Balanced complexity
- No incomplete blocks
- Mixed syntax elements

### Extraction Strategy
1. Find function/class boundaries
2. Include necessary context
3. Avoid cut-off statements
4. Ensure syntactic completeness

## Syntax Highlighting Setup

### Prism.js Configuration
```javascript
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

// Theme selection
import 'prismjs/themes/prism-tomorrow.css';
```

### Token Classification
- Keywords: `function`, `class`, `if`, `for`
- Types: `string`, `number`, `boolean`
- Operators: `+`, `-`, `*`, `/`, `=`
- Punctuation: `;`, `,`, `.`, `:`
- Comments: `//`, `/* */`, `#`
- Strings: `"..."`, `'...'`, `` `...` ``

## Quality Checks

### Code Validation
1. Check syntax completeness
2. Verify bracket matching
3. Validate string closures
4. Ensure no syntax errors

### Security Scanning
- Remove API keys
- Strip passwords
- Clear tokens
- Sanitize URLs

### Complexity Assessment
- Count unique tokens
- Calculate nesting depth
- Measure line complexity
- Rate difficulty level