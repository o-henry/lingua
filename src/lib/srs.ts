import { SrsCard } from "./types";

export type SrsRating = "hard" | "good" | "easy";

export function reviewCard(card: SrsCard, rating: SrsRating): SrsCard {
  const now = new Date();
  let { ease, intervalDays } = card;

  switch (rating) {
    case "hard":
      ease = Math.max(1.3, ease - 0.2);
      intervalDays = Math.max(1, Math.round(intervalDays * 0.7));
      break;
    case "good":
      intervalDays = Math.max(1, Math.round(intervalDays * ease));
      break;
    case "easy":
      ease = Math.min(3.0, ease + 0.15);
      intervalDays = Math.max(1, Math.round(intervalDays * ease * 1.3));
      break;
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return {
    ...card,
    ease,
    intervalDays,
    dueDate: dueDate.toISOString().split("T")[0],
    lastReviewedAt: now.toISOString(),
  };
}

export function createSrsCard(
  sentenceId: string,
  clipId: string,
  text: string,
  translation?: string
): SrsCard {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: `srs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sentenceId,
    clipId,
    text,
    translation,
    ease: 2.5,
    intervalDays: 1,
    dueDate: today,
    lastReviewedAt: today,
  };
}
