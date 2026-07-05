import { DatabaseRepository, CleanupResult } from '../repositories/database.repository';

export class CleanupService {
  private repository = new DatabaseRepository();

  async cleanupExpiredData(retentionHours: number): Promise<CleanupResult> {
    if (!Number.isFinite(retentionHours) || retentionHours <= 0) {
      throw new Error(`Invalid retentionHours: ${retentionHours}. Must be a positive finite number.`);
    }

    const cutoff = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
    return this.repository.cleanupExpired(cutoff);
  }
}
