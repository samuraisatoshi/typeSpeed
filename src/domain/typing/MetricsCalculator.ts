import { TypingSession, CharacterInput } from './TypingSession';

export interface DetailedMetrics {
  wpm: {
    gross: number;
    net: number;
    burst: number; // Best 10-second window
  };
  accuracy: {
    overall: number;
    lastMinute: number;
    byCharacter: Map<string, number>;
  };
  errors: {
    count: number;
    rate: number; // Errors per 100 characters
    mostCommon: string[];
  };
  timing: {
    averageKeyDelay: number;
    consistency: number; // Standard deviation
    pauseCount: number; // Pauses > 2 seconds
  };
  difficulty: {
    score: number;
    factors: {
      symbolDensity: number;
      indentationDepth: number;
      lineComplexity: number;
    };
  };
}

/**
 * Service for calculating detailed typing metrics
 */
export class MetricsCalculator {
  private static readonly PAUSE_THRESHOLD = 2000; // 2 seconds in ms
  private static readonly BURST_WINDOW = 10; // seconds

  public calculateDetailedMetrics(session: TypingSession): DetailedMetrics {
    const inputs = session.inputs;
    const elapsedTime = session.getElapsedTime();

    return {
      wpm: this.calculateWPMMetrics(inputs, elapsedTime),
      accuracy: this.calculateAccuracyMetrics(inputs),
      errors: this.calculateErrorMetrics(inputs),
      timing: this.calculateTimingMetrics(inputs),
      difficulty: this.calculateDifficulty(session.codeSnippet)
    };
  }

  private calculateWPMMetrics(inputs: CharacterInput[], elapsedSeconds: number): DetailedMetrics['wpm'] {
    const minutes = elapsedSeconds / 60;
    const totalChars = inputs.length;
    const errors = inputs.filter(i => !i.isCorrect).length;

    const grossWPM = minutes > 0 ? (totalChars / 5) / minutes : 0;
    const netWPM = minutes > 0 ? grossWPM - (errors / minutes) : 0;

    // Calculate burst WPM (best 10-second window)
    const burstWPM = this.calculateBurstWPM(inputs);

    return {
      gross: Math.round(grossWPM),
      net: Math.max(0, Math.round(netWPM)),
      burst: Math.round(burstWPM)
    };
  }

  private calculateBurstWPM(inputs: CharacterInput[]): number {
    if (inputs.length < 2) return 0;

    const windowMs = MetricsCalculator.BURST_WINDOW * 1000;
    let maxWPM = 0;

    for (let i = 0; i < inputs.length; i++) {
      const windowStart = inputs[i].timestamp;
      const windowEnd = windowStart + windowMs;

      // Count characters in this window
      let charCount = 0;
      for (let j = i; j < inputs.length && inputs[j].timestamp <= windowEnd; j++) {
        charCount++;
      }

      const windowMinutes = MetricsCalculator.BURST_WINDOW / 60;
      const windowWPM = (charCount / 5) / windowMinutes;
      maxWPM = Math.max(maxWPM, windowWPM);
    }

    return maxWPM;
  }

  private calculateAccuracyMetrics(inputs: CharacterInput[]): DetailedMetrics['accuracy'] {
    const overall = this.calculateAccuracy(inputs);

    // Last minute accuracy
    const oneMinuteAgo = Date.now() - 60000;
    const recentInputs = inputs.filter(i => i.timestamp >= oneMinuteAgo);
    const lastMinute = this.calculateAccuracy(recentInputs);

    // By character accuracy
    const byCharacter = new Map<string, number>();
    const charCounts = new Map<string, { correct: number; total: number }>();

    inputs.forEach(input => {
      const char = input.expected;
      const stats = charCounts.get(char) || { correct: 0, total: 0 };
      stats.total++;
      if (input.isCorrect) {
        stats.correct++;
      }
      charCounts.set(char, stats);
    });

    charCounts.forEach((stats, char) => {
      byCharacter.set(char, (stats.correct / stats.total) * 100);
    });

    return {
      overall,
      lastMinute,
      byCharacter
    };
  }

  private calculateAccuracy(inputs: CharacterInput[]): number {
    if (inputs.length === 0) return 100;

    const correct = inputs.filter(i => i.isCorrect).length;
    return Math.round((correct / inputs.length) * 1000) / 10; // Round to 1 decimal
  }

  private calculateErrorMetrics(inputs: CharacterInput[]): DetailedMetrics['errors'] {
    const errors = inputs.filter(i => !i.isCorrect);
    const errorRate = (errors.length / Math.max(inputs.length, 1)) * 100;

    // Find most common errors
    const errorMap = new Map<string, number>();
    errors.forEach(error => {
      const key = `${error.expected}→${error.actual}`;
      errorMap.set(key, (errorMap.get(key) || 0) + 1);
    });

    const sortedErrors = Array.from(errorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key);

    return {
      count: errors.length,
      rate: Math.round(errorRate * 10) / 10,
      mostCommon: sortedErrors
    };
  }

  private calculateTimingMetrics(inputs: CharacterInput[]): DetailedMetrics['timing'] {
    if (inputs.length < 2) {
      return {
        averageKeyDelay: 0,
        consistency: 0,
        pauseCount: 0
      };
    }

    const delays: number[] = [];
    let pauseCount = 0;

    for (let i = 1; i < inputs.length; i++) {
      const delay = inputs[i].timestamp - inputs[i - 1].timestamp;
      delays.push(delay);

      if (delay > MetricsCalculator.PAUSE_THRESHOLD) {
        pauseCount++;
      }
    }

    const averageKeyDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
    const consistency = this.calculateStandardDeviation(delays);

    return {
      averageKeyDelay: Math.round(averageKeyDelay),
      consistency: Math.round(consistency),
      pauseCount
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

    return Math.sqrt(variance);
  }

  private calculateDifficulty(code: string): DetailedMetrics['difficulty'] {
    const lines = code.split('\n');

    // Symbol density
    const symbols = code.match(/[^a-zA-Z0-9\s]/g) || [];
    const symbolDensity = symbols.length / code.length;

    // Indentation depth
    const indentations = lines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    });
    const avgIndent = indentations.reduce((a, b) => a + b, 0) / indentations.length;
    const indentationDepth = avgIndent / 40; // Normalize

    // Line complexity
    const avgLineLength = code.length / lines.length;
    const lineComplexity = avgLineLength / 80; // Normalize by typical line length

    const score = 1.0 + (symbolDensity * 0.5) + (indentationDepth * 0.3) + (lineComplexity * 0.2);

    return {
      score: Math.min(2.0, Math.round(score * 100) / 100),
      factors: {
        symbolDensity: Math.round(symbolDensity * 100) / 100,
        indentationDepth: Math.round(indentationDepth * 100) / 100,
        lineComplexity: Math.round(lineComplexity * 100) / 100
      }
    };
  }
}