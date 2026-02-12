import { Clip, SrsCard, SessionLog, UserSettings } from "./types";

const KEYS = {
  CLIPS: "lingoplay_clips",
  SRS_CARDS: "lingoplay_srs",
  SESSIONS: "lingoplay_sessions",
  SETTINGS: "lingoplay_settings",
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write failed:", e);
  }
}

// Clips
export function getClips(): Clip[] {
  return get<Clip[]>(KEYS.CLIPS, []);
}

export function saveClip(clip: Clip): void {
  const clips = getClips();
  const idx = clips.findIndex((c) => c.id === clip.id);
  if (idx >= 0) clips[idx] = clip;
  else clips.push(clip);
  set(KEYS.CLIPS, clips);
}

export function deleteClip(id: string): void {
  set(KEYS.CLIPS, getClips().filter((c) => c.id !== id));
}

export function getClipById(id: string): Clip | undefined {
  return getClips().find((c) => c.id === id);
}

// SRS
export function getSrsCards(): SrsCard[] {
  return get<SrsCard[]>(KEYS.SRS_CARDS, []);
}

export function saveSrsCard(card: SrsCard): void {
  const cards = getSrsCards();
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) cards[idx] = card;
  else cards.push(card);
  set(KEYS.SRS_CARDS, cards);
}

export function deleteSrsCard(id: string): void {
  set(KEYS.SRS_CARDS, getSrsCards().filter((c) => c.id !== id));
}

export function getDueCards(): SrsCard[] {
  const today = new Date().toISOString().split("T")[0];
  return getSrsCards().filter((c) => c.dueDate <= today);
}

// Sessions
export function getSessionLogs(): SessionLog[] {
  return get<SessionLog[]>(KEYS.SESSIONS, []);
}

export function saveSessionLog(log: SessionLog): void {
  const logs = getSessionLogs();
  const idx = logs.findIndex((l) => l.date === log.date);
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  set(KEYS.SESSIONS, logs);
}

// Settings
const DEFAULT_SETTINGS: UserSettings = {
  language: "ko",
  targetLanguage: "en",
  goal: "conversation",
  dailyMinutes: 20,
  mode: "beginner",
  darkMode: false,
  onboardingComplete: false,
  setupComplete: false,
};

export function getSettings(): UserSettings {
  return get<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function updateSettings(partial: Partial<UserSettings>): UserSettings {
  const settings = { ...getSettings(), ...partial };
  set(KEYS.SETTINGS, settings);
  return settings;
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function getTotalStudyMinutes(): number {
  return getSessionLogs().reduce((sum, l) => sum + l.minutes, 0);
}

export function getStreak(): number {
  const logs = getSessionLogs().sort((a, b) => b.date.localeCompare(a.date));
  if (logs.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < logs.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (logs[i]?.date === expectedStr) streak++;
    else break;
  }
  return streak;
}
