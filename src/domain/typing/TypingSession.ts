import { Entity } from '../shared/Entity';
import { Language } from '../shared/Language';
import { CodeFile } from '../codeSource/CodeFile';

export type TypingSessionId = string;

export enum SessionState {
  Idle = 'idle',
  Ready = 'ready',
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed'
}

export interface SessionMetrics {
  grossWPM: number;
  netWPM: number;
  accuracy: number;
  errors: number;
  corrections: number;
  totalCharacters: number;
  correctCharacters: number;
  elapsedTime: number;
}

export interface CharacterInput {
  expected: string;
  actual: string;
  timestamp: number;
  isCorrect: boolean;
  position: number;
}

/**
 * Entity representing a typing practice session
 */
export class TypingSession extends Entity<TypingSessionId> {
  private _state: SessionState;
  private _codeSnippet: string;
  private _language: Language;
  private _startTime?: Date;
  private _endTime?: Date;
  private _inputs: CharacterInput[];
  private _currentPosition: number;
  private _errors: number;
  private _corrections: number;

  constructor(id: TypingSessionId, codeFile: CodeFile, snippet: string) {
    super(id);
    this._state = SessionState.Idle;
    this._codeSnippet = snippet;
    this._language = codeFile.language;
    this._inputs = [];
    this._currentPosition = 0;
    this._errors = 0;
    this._corrections = 0;
  }

  public static create(codeFile: CodeFile, maxLines?: number): TypingSession {
    // Generate session ID that matches the validator pattern: session_<timestamp>_<alphanumeric>
    const randomPart = Math.random().toString(36).substr(2, 9);
    const id = `session_${Date.now()}_${randomPart}`;
    console.log('[TypingSession] Generated session ID:', id);

    // If maxLines is specified, use it to limit the snippet
    let snippet: string;
    if (maxLines && maxLines > 0) {
      const lines = codeFile.content.split('\n');
      if (lines.length > maxLines) {
        // Get a random section of maxLines length
        const startLine = Math.floor(Math.random() * Math.max(1, lines.length - maxLines));
        const endLine = startLine + maxLines;
        snippet = lines.slice(startLine, endLine).join('\n');
      } else {
        snippet = codeFile.content;
      }
    } else {
      // Use the default random snippet method
      snippet = codeFile.getRandomSnippet(50, 150);
    }

    return new TypingSession(id, codeFile, snippet);
  }

  public start(): void {
    if (this._state !== SessionState.Idle && this._state !== SessionState.Ready) {
      throw new Error(`Cannot start session in state: ${this._state}`);
    }

    this._state = SessionState.Active;
    this._startTime = new Date();
  }

  public pause(): void {
    if (this._state !== SessionState.Active) {
      throw new Error(`Cannot pause session in state: ${this._state}`);
    }

    this._state = SessionState.Paused;
  }

  public resume(): void {
    if (this._state !== SessionState.Paused) {
      throw new Error(`Cannot resume session in state: ${this._state}`);
    }

    this._state = SessionState.Active;
  }

  public complete(): void {
    if (this._state !== SessionState.Active) {
      throw new Error(`Cannot complete session in state: ${this._state}`);
    }

    this._state = SessionState.Completed;
    this._endTime = new Date();
  }

  public processInput(character: string): CharacterInput {
    if (this._state !== SessionState.Active) {
      throw new Error(`Cannot process input in state: ${this._state}`);
    }

    const expected = this._codeSnippet[this._currentPosition] || '';
    const isCorrect = character === expected;

    const input: CharacterInput = {
      expected,
      actual: character,
      timestamp: Date.now(),
      isCorrect,
      position: this._currentPosition
    };

    this._inputs.push(input);

    if (!isCorrect) {
      this._errors++;
    }

    if (character === '\b') { // Backspace
      this._corrections++;
      if (this._currentPosition > 0) {
        this._currentPosition--;
      }
    } else {
      this._currentPosition++;
    }

    // Check if session is complete
    if (this._currentPosition >= this._codeSnippet.length) {
      this.complete();
    }

    return input;
  }

  public calculateMetrics(): SessionMetrics {
    const elapsedTime = this.getElapsedTime();
    const totalCharacters = this._inputs.length;
    const correctCharacters = this._inputs.filter(i => i.isCorrect).length;
    const accuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;

    // Calculate WPM (words = characters / 5)
    const minutes = elapsedTime / 60;
    const grossWPM = minutes > 0 ? (totalCharacters / 5) / minutes : 0;
    const netWPM = minutes > 0 ? grossWPM - (this._errors / minutes) : 0;

    return {
      grossWPM: Math.round(grossWPM),
      netWPM: Math.max(0, Math.round(netWPM)),
      accuracy: Math.round(accuracy * 10) / 10,
      errors: this._errors,
      corrections: this._corrections,
      totalCharacters,
      correctCharacters,
      elapsedTime
    };
  }

  public getElapsedTime(): number {
    if (!this._startTime) {
      return 0;
    }

    const endTime = this._endTime || new Date();
    return (endTime.getTime() - this._startTime.getTime()) / 1000; // in seconds
  }

  public getProgress(): number {
    return (this._currentPosition / this._codeSnippet.length) * 100;
  }

  public get state(): SessionState {
    return this._state;
  }

  public get codeSnippet(): string {
    return this._codeSnippet;
  }

  public get language(): Language {
    return this._language;
  }

  public get currentPosition(): number {
    return this._currentPosition;
  }

  public get expectedCharacter(): string {
    return this._codeSnippet[this._currentPosition] || '';
  }

  public get inputs(): CharacterInput[] {
    return [...this._inputs];
  }
}