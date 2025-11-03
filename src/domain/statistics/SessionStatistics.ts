import { Entity } from '../shared/Entity';
import { Language } from '../shared/Language';
import { TypingSessionId, SessionMetrics } from '../typing/TypingSession';

export type SessionStatisticsId = string;

export interface SessionRecord {
  sessionId: TypingSessionId;
  timestamp: Date;
  language: Language;
  duration: number; // seconds
  metrics: SessionMetrics;
  codeSnippetLength: number;
  difficulty: number;
}

/**
 * Entity for storing and analyzing session statistics
 */
export class SessionStatistics extends Entity<SessionStatisticsId> {
  private _userId: string;
  private _sessions: SessionRecord[];
  private _personalBests: Map<string, SessionRecord>; // By language

  constructor(id: SessionStatisticsId, userId: string) {
    super(id);
    this._userId = userId;
    this._sessions = [];
    this._personalBests = new Map();
  }

  public static create(userId: string): SessionStatistics {
    const id = `stats_${userId}_${Date.now()}`;
    return new SessionStatistics(id, userId);
  }

  public addSession(record: SessionRecord): void {
    this._sessions.push(record);
    this.updatePersonalBest(record);
  }

  private updatePersonalBest(record: SessionRecord): void {
    const languageName = record.language.name;
    const currentBest = this._personalBests.get(languageName);

    if (!currentBest || record.metrics.netWPM > currentBest.metrics.netWPM) {
      this._personalBests.set(languageName, record);
    }
  }

  public getSessionsByLanguage(language: Language): SessionRecord[] {
    return this._sessions.filter(s => s.language.equals(language));
  }

  public getRecentSessions(count: number = 10): SessionRecord[] {
    return this._sessions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  public getPersonalBest(language?: Language): SessionRecord | null {
    if (language) {
      return this._personalBests.get(language.name) || null;
    }

    // Return overall best
    let best: SessionRecord | null = null;
    this._personalBests.forEach(record => {
      if (!best || record.metrics.netWPM > best.metrics.netWPM) {
        best = record;
      }
    });

    return best;
  }

  public getAverageMetrics(language?: Language): SessionMetrics | null {
    const sessions = language
      ? this.getSessionsByLanguage(language)
      : this._sessions;

    if (sessions.length === 0) {
      return null;
    }

    const totals = sessions.reduce((acc, session) => {
      return {
        grossWPM: acc.grossWPM + session.metrics.grossWPM,
        netWPM: acc.netWPM + session.metrics.netWPM,
        accuracy: acc.accuracy + session.metrics.accuracy,
        errors: acc.errors + session.metrics.errors,
        corrections: acc.corrections + session.metrics.corrections,
        totalCharacters: acc.totalCharacters + session.metrics.totalCharacters,
        correctCharacters: acc.correctCharacters + session.metrics.correctCharacters,
        elapsedTime: acc.elapsedTime + session.metrics.elapsedTime
      };
    }, {
      grossWPM: 0,
      netWPM: 0,
      accuracy: 0,
      errors: 0,
      corrections: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      elapsedTime: 0
    });

    const count = sessions.length;

    return {
      grossWPM: Math.round(totals.grossWPM / count),
      netWPM: Math.round(totals.netWPM / count),
      accuracy: Math.round((totals.accuracy / count) * 10) / 10,
      errors: Math.round(totals.errors / count),
      corrections: Math.round(totals.corrections / count),
      totalCharacters: Math.round(totals.totalCharacters / count),
      correctCharacters: Math.round(totals.correctCharacters / count),
      elapsedTime: Math.round(totals.elapsedTime / count)
    };
  }

  public getProgressOverTime(days: number = 7): { date: Date; wpm: number; accuracy: number }[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentSessions = this._sessions.filter(s => s.timestamp >= cutoff);

    // Group by date
    const byDate = new Map<string, SessionRecord[]>();

    recentSessions.forEach(session => {
      const dateKey = session.timestamp.toISOString().split('T')[0];
      const sessions = byDate.get(dateKey) || [];
      sessions.push(session);
      byDate.set(dateKey, sessions);
    });

    // Calculate daily averages
    const progress: { date: Date; wpm: number; accuracy: number }[] = [];

    byDate.forEach((sessions, dateKey) => {
      const avgWpm = sessions.reduce((sum, s) => sum + s.metrics.netWPM, 0) / sessions.length;
      const avgAccuracy = sessions.reduce((sum, s) => sum + s.metrics.accuracy, 0) / sessions.length;

      progress.push({
        date: new Date(dateKey),
        wpm: Math.round(avgWpm),
        accuracy: Math.round(avgAccuracy * 10) / 10
      });
    });

    return progress.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  public getTotalPracticeTime(): number {
    return this._sessions.reduce((total, session) => total + session.duration, 0);
  }

  public getTotalCharactersTyped(): number {
    return this._sessions.reduce((total, session) => total + session.metrics.totalCharacters, 0);
  }

  public getMostPracticedLanguage(): Language | null {
    const languageCounts = new Map<string, number>();

    this._sessions.forEach(session => {
      const lang = session.language.name;
      languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
    });

    let maxCount = 0;
    let mostPracticed: string | null = null;

    languageCounts.forEach((count, lang) => {
      if (count > maxCount) {
        maxCount = count;
        mostPracticed = lang;
      }
    });

    return mostPracticed ? Language.fromName(mostPracticed) : null;
  }

  public get userId(): string {
    return this._userId;
  }

  public get sessionCount(): number {
    return this._sessions.length;
  }

  public get sessions(): SessionRecord[] {
    return [...this._sessions];
  }
}