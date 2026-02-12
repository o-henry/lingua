import { describe, expect, it } from "vitest";
import { parseTranscriptText, parseUserProvidedTranscript } from "@/domain/transcript";

describe("parseUserProvidedTranscript", () => {
  it("detects and parses leading timestamps in pasted text", () => {
    const result = parseUserProvidedTranscript("00:12 hello everyone\n00:15 today we'll start", {
      autoDetectTimestamps: true,
      mergeConsecutiveLines: true,
    });

    expect(result.detectedTimecodeCount).toBe(2);
    expect(result.hasTimedLines).toBe(true);
    expect(result.lines[0]?.startSec).toBe(12);
    expect(result.lines[0]?.endSec).toBe(15);
    expect(result.lines[1]?.startSec).toBe(15);
  });

  it("keeps text-only input as plain lines", () => {
    const result = parseUserProvidedTranscript("hello everyone\nnice to meet you", {
      autoDetectTimestamps: true,
      mergeConsecutiveLines: true,
    });

    expect(result.detectedTimecodeCount).toBe(0);
    expect(result.hasTimedLines).toBe(false);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]?.text).toBe("hello everyone nice to meet you");
  });

  it("can keep timestamps as text when auto detection is off", () => {
    const result = parseUserProvidedTranscript("00:12 hello everyone\n00:15 today we'll start", {
      autoDetectTimestamps: false,
      mergeConsecutiveLines: false,
    });

    expect(result.detectedTimecodeCount).toBe(2);
    expect(result.hasTimedLines).toBe(false);
    expect(result.lines[0]?.text).toContain("00:12");
  });
});

describe("parseTranscriptText", () => {
  it("parses basic srt blocks", () => {
    const parsed = parseTranscriptText(`1
00:00:01,000 --> 00:00:03,000
hello world

2
00:00:03,000 --> 00:00:05,000
second line`);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.startSec).toBe(1);
    expect(parsed[0]?.endSec).toBe(3);
    expect(parsed[0]?.text).toBe("hello world");
  });
});
