import { SegmentRef } from "@/lib/types";

export function normalizeSegmentRef(ref: SegmentRef): SegmentRef {
  let startSec = Math.max(0, Math.floor(Math.min(ref.startSec, ref.endSec)));
  let endSec = Math.max(0, Math.floor(Math.max(ref.startSec, ref.endSec)));

  if (endSec <= startSec) {
    endSec = startSec + 1;
  }

  if (endSec - startSec < 1) {
    endSec = startSec + 1;
  }

  return {
    ...ref,
    startSec,
    endSec,
  };
}

export function clampToDuration(ref: SegmentRef, durationSec?: number): SegmentRef {
  if (durationSec === undefined || Number.isNaN(durationSec) || durationSec <= 0) {
    return normalizeSegmentRef(ref);
  }

  const clampedStart = Math.max(0, Math.min(ref.startSec, Math.max(0, durationSec - 1)));
  const clampedEnd = Math.max(clampedStart + 1, Math.min(ref.endSec, durationSec));

  return normalizeSegmentRef({
    ...ref,
    startSec: clampedStart,
    endSec: clampedEnd,
  });
}
