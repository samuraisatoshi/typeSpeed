---
name: ddd-architecture
description: >
  Enforces Domain-Driven Design patterns and SOLID principles in TypeSpeed codebase.
  Use this when creating new domains, entities, value objects, or services.
  PROACTIVELY ensures architectural consistency and updates map_domain.json.
  Maintains 550-line file limit and proper domain boundaries.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# DDD Architecture Skill

## When to Use This Skill
- Creating new domain entities or value objects
- Implementing domain services or repositories
- Refactoring code to follow DDD patterns
- Updating map_domain.json after changes
- Enforcing SOLID principles

## Domain Structure

### Core Domain Layers
```
src/
├── domain/              # Core business logic
│   ├── codeSource/     # File management domain
│   ├── codeFormatter/  # Formatting domain
│   ├── typing/         # Typing mechanics domain
│   └── statistics/     # Performance tracking domain
├── application/         # Use cases and orchestration
├── infrastructure/      # External dependencies
└── presentation/        # UI components
```

## DDD Patterns

### Entity Template
```typescript
// Max 550 lines per file
export class TypingSession implements Entity<TypingSessionId> {
  private readonly _id: TypingSessionId;
  private _startTime: Date;
  private _endTime?: Date;
  private _metrics: SessionMetrics;

  constructor(id: TypingSessionId) {
    this._id = id;
    this._startTime = new Date();
    this._metrics = new SessionMetrics();
  }

  get id(): TypingSessionId {
    return this._id;
  }

  // Business logic methods
  processInput(input: string): void {
    // Domain logic here
  }
}
```

### Value Object Template
```typescript
export class Language implements ValueObject {
  private readonly _name: string;
  private readonly _extension: string;
  private readonly _formatter: FormatterType;

  constructor(extension: string) {
    this._extension = extension;
    this._name = this.detectLanguage(extension);
    this._formatter = this.getFormatter();
  }

  equals(other: Language): boolean {
    return this._extension === other._extension;
  }

  // Immutable, no setters
  get name(): string { return this._name; }
  get extension(): string { return this._extension; }
}
```

### Repository Template
```typescript
export interface CodeFileRepository {
  save(file: CodeFile): Promise<void>;
  findById(id: CodeFileId): Promise<CodeFile | null>;
  findByLanguage(language: Language): Promise<CodeFile[]>;
  getRandomFile(language?: Language): Promise<CodeFile>;
}

// Implementation in infrastructure layer
export class IndexedDBCodeFileRepository implements CodeFileRepository {
  // Implementation details
}
```

### Domain Service Template
```typescript
export class CodeFormatterService {
  constructor(
    private readonly factory: FormatterFactory,
    private readonly highlighter: SyntaxHighlighter
  ) {}

  formatCode(
    code: string,
    language: Language
  ): FormattedCode {
    const formatter = this.factory.createFormatter(language);
    const formatted = formatter.format(code);
    return this.highlighter.highlight(formatted, language);
  }
}
```

## SOLID Principles Enforcement

### Single Responsibility
- One class = one reason to change
- Separate concerns into different classes
- No god objects

### Open/Closed
```typescript
// Open for extension via interface
interface Formatter {
  format(code: string): string;
}

// Closed for modification
class TypeScriptFormatter implements Formatter {
  format(code: string): string {
    // Specific implementation
  }
}
```

### Liskov Substitution
```typescript
// Base class establishes contract
abstract class BaseFormatter {
  abstract format(code: string): string;

  validateCode(code: string): boolean {
    return code.length > 0;
  }
}

// Derived classes maintain contract
class PythonFormatter extends BaseFormatter {
  format(code: string): string {
    if (!this.validateCode(code)) {
      throw new Error('Invalid code');
    }
    // Python-specific formatting
  }
}
```

### Interface Segregation
```typescript
// Specific interfaces, not fat interfaces
interface Readable {
  read(): string;
}

interface Formattable {
  format(): void;
}

interface Highlightable {
  highlight(): void;
}

// Classes implement only what they need
class CodeFile implements Readable, Formattable {
  read(): string { /* ... */ }
  format(): void { /* ... */ }
  // No highlight method needed
}
```

### Dependency Inversion
```typescript
// Depend on abstractions
class TypingSessionService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly calculator: MetricsCalculator
  ) {}
}

// Not on concretions
// BAD: constructor(private readonly repo: MongoSessionRepository)
```

## File Size Management

### Splitting Large Files
When approaching 550 lines:

1. **Extract Value Objects**
2. **Separate Interfaces**
3. **Move Helper Functions**
4. **Create Sub-Services**

Example:
```typescript
// Before: UserService.ts (600+ lines)
// After:
// - UserService.ts (300 lines)
// - UserValidator.ts (150 lines)
// - UserRepository.ts (100 lines)
// - UserEvents.ts (50 lines)
```

## Domain Mapping Updates

### After Every Code Change
```bash
# Automatic update script
node scripts/update-domain-map.js

# Manual verification
npm run domain:validate
```

### map_domain.json Structure
```json
{
  "domains": {
    "domainName": {
      "description": "Clear purpose",
      "goal": "Business objective",
      "dependencies": ["otherDomain"],
      "classes": {
        "ClassName": {
          "description": "Class purpose",
          "goal": "Class objective",
          "methods": ["method1", "method2"],
          "dependencies": ["internal", "external"]
        }
      }
    }
  }
}
```

## Common Refactorings

### Extract Domain Service
Before:
```typescript
class CodeFile {
  format(): void {
    // 100 lines of formatting logic
  }
}
```

After:
```typescript
class CodeFile {
  // Just data and identity
}

class CodeFormatterService {
  format(file: CodeFile): FormattedCode {
    // Formatting logic moved here
  }
}
```

### Introduce Value Object
Before:
```typescript
class TypingSession {
  private language: string;
  private extension: string;
}
```

After:
```typescript
class TypingSession {
  private language: Language; // Value object
}

class Language {
  constructor(
    readonly name: string,
    readonly extension: string
  ) {}
}
```