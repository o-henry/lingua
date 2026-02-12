import { describe, expect, it } from "vitest";
import { scheduleNextReview } from "@/domain/srsScheduler";
import { SrsCard } from "@/lib/types";

const baseCard: SrsCard = {
  id: "s1",
  memoryId: "m1",
  ease: 2.3,
  intervalDays: 0,
  dueDate: "2026-02-12",
};

describe("scheduleNextReview", () => {
  it("handles hard rating with ease decrease and minimum interval", () => {
    const next = scheduleNextReview({ ...baseCard, intervalDays: 5 }, "hard", "2026-02-12");
    expect(next.ease).toBeCloseTo(2.1, 5);
    expect(next.intervalDays).toBe(4);
    expect(next.dueDate).toBe("2026-02-16");
  });

  it("handles good rating with bootstrap interval", () => {
    const next = scheduleNextReview(baseCard, "good", "2026-02-12");
    expect(next.intervalDays).toBe(1);
    expect(next.dueDate).toBe("2026-02-13");
  });

  it("handles easy rating with ease increase and bootstrap interval", () => {
    const next = scheduleNextReview(baseCard, "easy", "2026-02-12");
    expect(next.ease).toBeCloseTo(2.45, 5);
    expect(next.intervalDays).toBe(2);
    expect(next.dueDate).toBe("2026-02-14");
  });

  it("clamps ease to configured bounds", () => {
    const minEase = scheduleNextReview({ ...baseCard, ease: 1.3, intervalDays: 1 }, "hard", "2026-02-12");
    const maxEase = scheduleNextReview({ ...baseCard, ease: 2.7, intervalDays: 1 }, "easy", "2026-02-12");

    expect(minEase.ease).toBe(1.3);
    expect(maxEase.ease).toBe(2.7);
  });
});
