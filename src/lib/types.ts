export interface Clip {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string;
  channel: string;
  durationSec: number;
  level: "beginner" | "intermediate" | "advanced";
  tags: string[];
  sentences: Sentence[];
  addedAt: string;
  embeddable: boolean;
}

export interface Sentence {
  id: string;
  clipId: string;
  startSec: number;
  endSec: number;
  text: string;
  translation?: string;
  notes?: string;
}

export interface SrsCard {
  id: string;
  sentenceId: string;
  clipId: string;
  text: string;
  translation?: string;
  ease: number;
  intervalDays: number;
  dueDate: string;
  lastReviewedAt: string;
}

export interface SessionLog {
  date: string;
  minutes: number;
  stepsCompleted: ("A" | "B" | "C" | "D")[];
  savedCount: number;
}

export interface UserSettings {
  language: string;
  targetLanguage: string;
  goal: string;
  dailyMinutes: number;
  mode: "beginner" | "intermediate" | "advanced";
  darkMode: boolean;
  onboardingComplete: boolean;
  setupComplete: boolean;
}

export type LearningStep = "A" | "B" | "C" | "D";

export const STEP_INFO: Record<LearningStep, { label: string; description: string; minutes: number; icon: string }> = {
  A: { label: "예열", description: "클립 전체 감상", minutes: 3, icon: "🔥" },
  B: { label: "대본·집중", description: "문장 단위 학습", minutes: 10, icon: "📖" },
  C: { label: "섀도잉", description: "따라 말하기 연습", minutes: 7, icon: "🎙️" },
  D: { label: "인출", description: "기억 확인 과제", minutes: 7, icon: "🧠" },
};
