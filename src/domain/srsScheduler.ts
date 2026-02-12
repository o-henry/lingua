import { SrsCard } from "@/lib/types";

export type SrsRating = "hard" | "good" | "easy";

const MIN_EASE = 1.3;
const MAX_EASE = 2.7;
const BASE_EASE = 2.3;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function getTodayDateKey(): string {
  return toDateKey(new Date());
}

export function scheduleNextReview(
  card: SrsCard,
  rating: SrsRating,
  todayDate = getTodayDateKey()
): Pick<SrsCard, "ease" | "intervalDays" | "dueDate" | "lastReviewedAt"> {
  let ease = Number.isFinite(card.ease) ? card.ease : BASE_EASE;
  let intervalDays = Number.isFinite(card.intervalDays) ? card.intervalDays : 0;

  switch (rating) {
    case "hard":
      ease = Math.max(MIN_EASE, ease - 0.2);
      intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
      break;
    case "good":
      intervalDays = intervalDays === 0 ? 1 : Math.round(intervalDays * ease);
      break;
    case "easy":
      ease = Math.min(MAX_EASE, ease + 0.15);
      intervalDays = intervalDays === 0 ? 2 : Math.round(intervalDays * ease * 1.2);
      break;
  }

  ease = Math.min(MAX_EASE, Math.max(MIN_EASE, ease));
  intervalDays = Math.max(1, intervalDays);

  const base = parseDateKey(todayDate);
  base.setDate(base.getDate() + intervalDays);

  return {
    ease,
    intervalDays,
    dueDate: toDateKey(base),
    lastReviewedAt: Date.now(),
  };
}
