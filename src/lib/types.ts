export interface Clip {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title?: string;
  channel?: string;
  durationSec?: number;
  level?: "beginner" | "intermediate" | "advanced" | string;
  tags?: string[];
  captionsAvailable?: boolean | "unknown";
  addedAt?: string;
  embeddable?: boolean;
}

export interface SegmentRef {
  clipId: string;
  videoId: string;
  startSec: number;
  endSec: number;
  label?: string;
  createdAt: number;
}

export interface MemoryItem {
  id: string;
  ref: SegmentRef;
  notes: string;
  userText?: string;
  meaningKo?: string;
  heardWords?: string[];
  topic?: "news" | "daily" | "docu" | "interview" | "lecture" | "other";
  confidence?: 1 | 2 | 3 | 4 | 5;
  supportingNotes?: Array<{
    kind: "summary" | "translation" | "hint";
    text: string;
    createdAt: number;
  }>;
  cloze?: {
    hint: string;
    blanksMeta?: {
      len: number;
    };
  };
  createdAt: number;
  updatedAt: number;
}

export interface SrsCard {
  id: string;
  memoryId: string;
  ease: number;
  intervalDays: number;
  dueDate: string;
  lastReviewedAt?: number;
}

export interface SessionLog {
  date: string;
  minutes: number;
  stepsCompleted?: {
    A?: boolean;
    B?: boolean;
    C?: boolean;
    D?: boolean;
  };
  savedCount: number;
}

export interface UserSettings {
  language: string;
  targetLanguage: string;
  learnerLevel: "입문" | "초급" | "중급" | "고급";
  userAge: number;
  userGender: "남" | "여" | "기타" | "비공개";
  goal: string;
  dailyMinutes: number;
  mode: "beginner" | "intermediate" | "advanced";
  darkMode: boolean;
  setupComplete: boolean;
}

export type LearningStep = "B" | "C";

export const STEP_INFO: Record<LearningStep, { label: string; description: string; minutes: number; icon: string }> = {
  B: { label: "구간·메모", description: "참조 기반 표현 저장", minutes: 10, icon: "🗂️" },
  C: { label: "듣고 따라 말하기", description: "따라 말하기 연습", minutes: 7, icon: "🎙️" },
};
