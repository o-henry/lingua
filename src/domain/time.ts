export function parseTime(input: string): number | null {
  const raw = input.replace(/\s+/g, "");
  if (!raw) return null;

  const secondsOnlyMatch = raw.match(/^(\d+)$/);
  if (secondsOnlyMatch) {
    return Number.parseInt(secondsOnlyMatch[1], 10);
  }

  const minuteSecondMatch = raw.match(/^(\d{1,2}):([0-5]\d)$/);
  if (minuteSecondMatch) {
    const minutes = Number.parseInt(minuteSecondMatch[1], 10);
    const seconds = Number.parseInt(minuteSecondMatch[2], 10);
    return minutes * 60 + seconds;
  }

  const hourMinuteSecondMatch = raw.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
  if (hourMinuteSecondMatch) {
    const hours = Number.parseInt(hourMinuteSecondMatch[1], 10);
    const minutes = Number.parseInt(hourMinuteSecondMatch[2], 10);
    const seconds = Number.parseInt(hourMinuteSecondMatch[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
