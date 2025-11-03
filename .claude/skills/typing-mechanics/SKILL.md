---
name: typing-mechanics
description: >
  Implements core typing practice mechanics including input validation,
  WPM calculation, accuracy tracking, and real-time feedback systems.
  Use this when building typing session logic, calculating metrics, or
  handling user input. PROACTIVELY optimizes performance for smooth UX.
allowed-tools: Read, Write, Edit
---

# Typing Mechanics Skill

## When to Use This Skill
- Implementing typing session management
- Calculating WPM and accuracy metrics
- Processing user keyboard input
- Providing real-time feedback
- Optimizing typing performance

## Core Mechanics

### Input Processing Pipeline
```typescript
interface InputEvent {
  character: string;
  timestamp: number;
  position: number;
  isCorrect: boolean;
}

class InputProcessor {
  private buffer: string = '';
  private position: number = 0;

  processKey(event: KeyboardEvent): InputResult {
    const char = this.extractChar(event);
    const expected = this.getExpectedChar();
    const isCorrect = this.validate(char, expected);

    return {
      char,
      expected,
      isCorrect,
      position: this.position++
    };
  }
}
```

### WPM Calculation

#### Gross WPM
```typescript
calculateGrossWPM(
  charactersTyped: number,
  timeInSeconds: number
): number {
  const timeInMinutes = timeInSeconds / 60;
  const words = charactersTyped / 5; // Standard word length
  return Math.round(words / timeInMinutes);
}
```

#### Net WPM
```typescript
calculateNetWPM(
  grossWPM: number,
  errors: number,
  timeInMinutes: number
): number {
  const errorPenalty = errors / timeInMinutes;
  return Math.max(0, Math.round(grossWPM - errorPenalty));
}
```

### Accuracy Tracking
```typescript
interface AccuracyMetrics {
  totalCharacters: number;
  correctCharacters: number;
  errors: number;
  corrections: number;
  percentage: number;
}

calculateAccuracy(session: TypingSession): AccuracyMetrics {
  const percentage = (session.correct / session.total) * 100;

  return {
    totalCharacters: session.total,
    correctCharacters: session.correct,
    errors: session.errors,
    corrections: session.backspaces,
    percentage: Math.round(percentage * 10) / 10
  };
}
```

## Real-time Feedback

### Visual Feedback States
```css
.char-correct {
  background-color: #10b981;
  color: white;
}

.char-incorrect {
  background-color: #ef4444;
  color: white;
  text-decoration: line-through;
}

.char-current {
  background-color: #3b82f6;
  animation: blink 1s infinite;
}

.char-pending {
  color: #6b7280;
}
```

### Performance Optimization
```typescript
class OptimizedRenderer {
  private rafId: number | null = null;
  private pendingUpdates: Update[] = [];

  scheduleUpdate(update: Update): void {
    this.pendingUpdates.push(update);

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    // Batch DOM updates
    this.pendingUpdates.forEach(update => {
      update.apply();
    });
    this.pendingUpdates = [];
    this.rafId = null;
  }
}
```

## Special Character Handling

### Programming-Specific Characters
```typescript
const SPECIAL_CHARS = {
  brackets: ['(', ')', '[', ']', '{', '}'],
  operators: ['+', '-', '*', '/', '%', '=', '<', '>'],
  punctuation: [';', ',', '.', ':', '?', '!'],
  quotes: ['"', "'", '`'],
  special: ['@', '#', '$', '&', '|', '^', '~']
};

handleSpecialChar(char: string): CharacterType {
  if (SPECIAL_CHARS.brackets.includes(char)) {
    return CharacterType.Bracket;
  }
  // ... check other categories
}
```

### Whitespace Handling
```typescript
class WhitespaceHandler {
  normalizeWhitespace(input: string): string {
    return input
      .replace(/\t/g, '  ') // Tab to spaces
      .replace(/\r\n/g, '\n') // CRLF to LF
      .replace(/ +$/gm, ''); // Trailing spaces
  }

  isSignificantWhitespace(
    char: string,
    language: Language
  ): boolean {
    if (language.name === 'python') {
      return true; // Indentation matters
    }
    return char === '\n'; // Line breaks matter
  }
}
```

## Session Management

### Session State Machine
```typescript
enum SessionState {
  Idle = 'idle',
  Ready = 'ready',
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed'
}

class SessionStateMachine {
  private state = SessionState.Idle;

  transition(event: SessionEvent): void {
    switch (this.state) {
      case SessionState.Idle:
        if (event === 'load') {
          this.state = SessionState.Ready;
        }
        break;

      case SessionState.Ready:
        if (event === 'start') {
          this.state = SessionState.Active;
          this.startTimer();
        }
        break;

      case SessionState.Active:
        if (event === 'pause') {
          this.state = SessionState.Paused;
          this.pauseTimer();
        } else if (event === 'complete') {
          this.state = SessionState.Completed;
          this.stopTimer();
        }
        break;

      // ... other transitions
    }
  }
}
```

### Progress Tracking
```typescript
interface Progress {
  current: number;
  total: number;
  percentage: number;
  estimatedCompletion: number;
}

trackProgress(session: TypingSession): Progress {
  const current = session.position;
  const total = session.codeLength;
  const percentage = (current / total) * 100;

  const charactersPerSecond = current / session.elapsedTime;
  const remaining = total - current;
  const estimatedCompletion = remaining / charactersPerSecond;

  return {
    current,
    total,
    percentage,
    estimatedCompletion
  };
}
```

## Performance Metrics

### Advanced Metrics
```typescript
interface AdvancedMetrics {
  burstWPM: number;        // Peak 10-second WPM
  consistency: number;      // Standard deviation
  errorRate: number;        // Errors per 100 chars
  correctionRate: number;   // Corrections per 100 chars
  pauseFrequency: number;   // Pauses > 2 seconds
  difficultyScore: number;  // Based on code complexity
}

calculateAdvancedMetrics(
  session: TypingSession
): AdvancedMetrics {
  const windows = this.getTimeWindows(session, 10);
  const burstWPM = Math.max(...windows.map(w => w.wpm));

  const consistency = this.calculateStdDev(
    windows.map(w => w.wpm)
  );

  const errorRate = (session.errors / session.total) * 100;
  const correctionRate = (session.corrections / session.total) * 100;

  return {
    burstWPM,
    consistency,
    errorRate,
    correctionRate,
    pauseFrequency: session.pauses.length,
    difficultyScore: this.calculateDifficulty(session.code)
  };
}
```

### Difficulty Calculation
```typescript
calculateDifficulty(code: string): number {
  let score = 1.0;

  // Symbol density
  const symbols = code.match(/[^a-zA-Z0-9\s]/g) || [];
  score += symbols.length / code.length * 0.5;

  // Indentation depth
  const maxIndent = Math.max(
    ...code.split('\n').map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    })
  );
  score += maxIndent / 40; // Normalize by typical max

  // Line complexity
  const avgLineLength = code.length / code.split('\n').length;
  score += avgLineLength / 80 * 0.3;

  return Math.min(2.0, score); // Cap at 2x difficulty
}
```