import { formatTime, parseTime } from "@/domain/time";

export interface TranscriptLine {
  id: string;
  text: string;
  startSec?: number;
  endSec?: number;
}

export interface UserTranscriptParseOptions {
  autoDetectTimestamps: boolean;
  mergeConsecutiveLines: boolean;
}

export interface UserTranscriptParseResult {
  lines: TranscriptLine[];
  detectedTimecodeCount: number;
  hasTimedLines: boolean;
  cleanedInput: string;
}

const LEADING_TIMESTAMP_RE = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:[-–—]\s*)?(.*)$/;
const TIMESTAMP_HINT_RE = /\b(?:\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})\b/g;

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function parseTimecode(value: string): number | undefined {
  const cleaned = value.trim().replace(",", ".");
  const parts = cleaned.split(":").map((item) => Number(item));

  if (parts.some((part) => Number.isNaN(part))) return undefined;

  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }

  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }

  return undefined;
}

function parseTimestampRange(line: string): { startSec?: number; endSec?: number } {
  const match = line.match(/(\d{1,2}:\d{2}:\d{2}[\.,]\d{1,3}|\d{1,2}:\d{2}[\.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[\.,]\d{1,3}|\d{1,2}:\d{2}[\.,]\d{1,3})/);
  if (!match) return {};

  return {
    startSec: parseTimecode(match[1]),
    endSec: parseTimecode(match[2]),
  };
}

function applyImplicitEnds(lines: TranscriptLine[]): TranscriptLine[] {
  const next = lines.map((line) => ({ ...line }));

  for (let i = 0; i < next.length; i += 1) {
    const line = next[i];
    if (line.startSec === undefined) continue;
    if (line.endSec !== undefined) continue;

    for (let j = i + 1; j < next.length; j += 1) {
      const candidate = next[j];
      if (candidate.startSec === undefined) continue;
      if (candidate.startSec > line.startSec) {
        line.endSec = candidate.startSec;
      }
      break;
    }
  }

  return next;
}

function mergeConsecutiveTextOnlyLines(lines: TranscriptLine[]): TranscriptLine[] {
  if (lines.length <= 1) return lines;

  const merged: TranscriptLine[] = [];
  let textBuffer: string[] = [];

  const flushBuffer = () => {
    const text = textBuffer.join(" ").trim();
    if (text) {
      merged.push({
        id: `line_${merged.length}_${Date.now()}`,
        text,
      });
    }
    textBuffer = [];
  };

  for (const line of lines) {
    const isTimed = line.startSec !== undefined || line.endSec !== undefined;
    if (isTimed) {
      flushBuffer();
      merged.push(line);
      continue;
    }

    textBuffer.push(line.text);
  }

  flushBuffer();
  return merged;
}

function buildCleanedInput(lines: TranscriptLine[]): string {
  return lines
    .map((line) => {
      if (line.startSec === undefined) return normalizeLine(line.text);
      const label = formatTime(line.startSec);
      return `${label} ${normalizeLine(line.text)}`.trim();
    })
    .filter(Boolean)
    .join("\n");
}

function parsePlainTextTranscript(raw: string, autoDetectTimestamps: boolean): TranscriptLine[] {
  const sourceLines = raw
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const parsed: TranscriptLine[] = [];

  for (let i = 0; i < sourceLines.length; i += 1) {
    const line = sourceLines[i];

    if (autoDetectTimestamps) {
      const match = line.match(LEADING_TIMESTAMP_RE);
      if (match) {
        const parsedTime = parseTime(match[1]);
        if (parsedTime !== null) {
          let text = normalizeLine(match[2] || "");

          if (!text) {
            const nextLine = sourceLines[i + 1];
            if (nextLine && !LEADING_TIMESTAMP_RE.test(nextLine)) {
              text = normalizeLine(nextLine);
              i += 1;
            }
          }

          if (text) {
            parsed.push({
              id: `line_${parsed.length}_${Date.now()}`,
              text,
              startSec: parsedTime,
            });
            continue;
          }
        }
      }
    }

    parsed.push({
      id: `line_${parsed.length}_${Date.now()}`,
      text: line,
    });
  }

  return applyImplicitEnds(parsed);
}

export function parseTranscriptText(raw: string): TranscriptLine[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const blocks = normalized.split(/\n\s*\n/g);
  const parsed: TranscriptLine[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) continue;

    if (lines[0].toUpperCase() === "WEBVTT") continue;

    const timeLineIdx = lines.findIndex((line) => line.includes("-->"));

    if (timeLineIdx >= 0) {
      const { startSec, endSec } = parseTimestampRange(lines[timeLineIdx]);
      const textLines = lines.filter((_, idx) => idx !== timeLineIdx && !/^\d+$/.test(lines[idx]));
      const text = normalizeLine(textLines.join(" "));

      if (text) {
        parsed.push({
          id: `line_${parsed.length}_${Date.now()}`,
          text,
          startSec,
          endSec,
        });
      }
      continue;
    }

    const plainText = normalizeLine(lines.join(" "));
    if (plainText) {
      parsed.push({
        id: `line_${parsed.length}_${Date.now()}`,
        text: plainText,
      });
    }
  }

  return parsed;
}

export function parseUserProvidedTranscript(raw: string, options: UserTranscriptParseOptions): UserTranscriptParseResult {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  if (!normalized) {
    return {
      lines: [],
      detectedTimecodeCount: 0,
      hasTimedLines: false,
      cleanedInput: "",
    };
  }

  const detectedTimecodeCount = normalized.match(TIMESTAMP_HINT_RE)?.length ?? 0;
  const isStructuredFormat = normalized.includes("-->") || /^WEBVTT\b/im.test(normalized);

  let lines = isStructuredFormat
    ? parseTranscriptText(normalized)
    : parsePlainTextTranscript(normalized, options.autoDetectTimestamps);

  if (options.mergeConsecutiveLines) {
    lines = mergeConsecutiveTextOnlyLines(lines);
  }

  return {
    lines,
    detectedTimecodeCount,
    hasTimedLines: lines.some((line) => line.startSec !== undefined),
    cleanedInput: buildCleanedInput(lines),
  };
}
