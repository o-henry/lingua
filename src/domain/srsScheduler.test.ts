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
  it("handles hard rating with ease decrease and short-term relearn", () => {
    const now = new Date("2026-02-12T10:00:00Z").getTime();
    const next = scheduleNextReview({ ...baseCard, intervalDays: 5 }, "hard", "2026-02-12", now);
    expect(next.ease).toBeCloseTo(2.1, 5);
    expect(next.intervalDays).toBe(3);
    expect(next.dueAt).toBe(now + 60 * 1000);
    expect(next.dueDate).toBe("2026-02-12");
  });

  it("handles good rating with bootstrap interval", () => {
    const now = new Date("2026-02-12T10:00:00Z").getTime();
    const next = scheduleNextReview(baseCard, "good", "2026-02-12", now);
    expect(next.intervalDays).toBe(1);
    expect(next.dueDate).toBe("2026-02-13");
    expect(next.dueAt).toBe(new Date("2026-02-13T00:00:00").getTime());
  });

  it("handles easy rating with ease increase and bootstrap interval", () => {
    const now = new Date("2026-02-12T10:00:00Z").getTime();
    const next = scheduleNextReview(baseCard, "easy", "2026-02-12", now);
    expect(next.ease).toBeCloseTo(2.45, 5);
    expect(next.intervalDays).toBe(2);
    expect(next.dueDate).toBe("2026-02-14");
    expect(next.dueAt).toBe(new Date("2026-02-14T00:00:00").getTime());
  });

  it("clamps ease to configured bounds", () => {
    const now = new Date("2026-02-12T10:00:00Z").getTime();
    const minEase = scheduleNextReview({ ...baseCard, ease: 1.3, intervalDays: 1 }, "hard", "2026-02-12", now);
    const maxEase = scheduleNextReview({ ...baseCard, ease: 2.7, intervalDays: 1 }, "easy", "2026-02-12", now);

    expect(minEase.ease).toBe(1.3);
    expect(maxEase.ease).toBe(2.7);
  });
});
