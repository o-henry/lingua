import { scheduleNextReview, SrsRating, getTodayDateKey } from "@/domain/srsScheduler";
import { SrsCard } from "@/lib/types";

export type { SrsRating };

export function reviewCard(card: SrsCard, rating: SrsRating, todayDate = getTodayDateKey()): SrsCard {
  return {
    ...card,
    ...scheduleNextReview(card, rating, todayDate),
  };
}

export function createSrsCard(memoryId: string): SrsCard {
  return {
    id: `srs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    memoryId,
    ease: 2.3,
    intervalDays: 0,
    dueDate: getTodayDateKey(),
    dueAt: Date.now(),
  };
}
