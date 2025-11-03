import { SessionStatistics, SessionRecord } from './SessionStatistics';

/**
 * Repository interface for SessionStatistics persistence
 */
export interface IStatisticsRepository {
  save(statistics: SessionStatistics): Promise<void>;
  findByUserId(userId: string): Promise<SessionStatistics | null>;
  addSessionRecord(userId: string, record: SessionRecord): Promise<void>;
  getLeaderboard(limit: number): Promise<{ userId: string; bestWPM: number; language: string }[]>;
}

/**
 * In-memory implementation of StatisticsRepository
 */
export class InMemoryStatisticsRepository implements IStatisticsRepository {
  private statistics: Map<string, SessionStatistics> = new Map();

  public async save(stats: SessionStatistics): Promise<void> {
    this.statistics.set(stats.userId, stats);
  }

  public async findByUserId(userId: string): Promise<SessionStatistics | null> {
    return this.statistics.get(userId) || null;
  }

  public async addSessionRecord(userId: string, record: SessionRecord): Promise<void> {
    let stats = await this.findByUserId(userId);

    if (!stats) {
      stats = SessionStatistics.create(userId);
    }

    stats.addSession(record);
    await this.save(stats);
  }

  public async getLeaderboard(limit: number = 10): Promise<{ userId: string; bestWPM: number; language: string }[]> {
    const leaderboard: { userId: string; bestWPM: number; language: string }[] = [];

    this.statistics.forEach(stats => {
      const personalBest = stats.getPersonalBest();

      if (personalBest) {
        leaderboard.push({
          userId: stats.userId,
          bestWPM: personalBest.metrics.netWPM,
          language: personalBest.language.name
        });
      }
    });

    return leaderboard
      .sort((a, b) => b.bestWPM - a.bestWPM)
      .slice(0, limit);
  }
}