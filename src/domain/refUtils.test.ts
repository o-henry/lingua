import { describe, expect, it } from "vitest";
import { clampToDuration, normalizeSegmentRef } from "@/domain/refUtils";

describe("normalizeSegmentRef", () => {
  it("swaps reversed ranges and enforces at least 1 second", () => {
    const ref = normalizeSegmentRef({
      clipId: "c1",
      videoId: "v1",
      startSec: 25,
      endSec: 12,
      createdAt: 1,
    });

    expect(ref.startSec).toBe(12);
    expect(ref.endSec).toBe(25);
  });

  it("clamps negatives and expands zero-length range", () => {
    const ref = normalizeSegmentRef({
      clipId: "c1",
      videoId: "v1",
      startSec: -4,
      endSec: -4,
      createdAt: 1,
    });

    expect(ref.startSec).toBe(0);
    expect(ref.endSec).toBe(1);
  });
});

describe("clampToDuration", () => {
  it("clamps to video duration", () => {
    const ref = clampToDuration(
      {
        clipId: "c1",
        videoId: "v1",
        startSec: 119,
        endSec: 400,
        createdAt: 1,
      },
      120
    );

    expect(ref.startSec).toBe(119);
    expect(ref.endSec).toBe(120);
  });
});
