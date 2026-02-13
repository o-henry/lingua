export type AiAskTarget = "chatgpt" | "gemini";
export type AiPromptMode = "general" | "shadowing-pronunciation";

interface BuildAiPromptParams {
  youtubeUrl: string;
  videoId: string;
  startSec: number;
  endSec: number;
  userText: string;
  notes?: string;
  hasRecording?: boolean;
  targetLanguage: string;
  learnerLevel: string;
  userAge: number;
  userGender: string;
}

export function buildYouTubeTimeUrl(videoId: string, startSec: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.max(0, Math.floor(startSec))}s`;
}

export function targetLabel(target: AiAskTarget): string {
  if (target === "gemini") return "Gemini";
  return "ChatGPT";
}

export function targetHomeUrl(target: AiAskTarget): string {
  if (target === "gemini") return "https://gemini.google.com/";
  return "https://chat.openai.com/";
}

const normalizeTargetLanguage = (value: string): "Japanese" | "English" => {
  const code = value.trim().toLowerCase();
  if (code === "ja" || code === "jp" || code.includes("japan")) {
    return "Japanese";
  }
  return "English";
};

const resolveLocaleContext = (targetLanguage: "Japanese" | "English"): string => {
  if (targetLanguage === "Japanese") return "일본(일본어권)";
  return "미국(미국 영어권)";
};

const resolveAgeBand = (age: number): string => {
  const safeAge = Math.max(1, Math.floor(age || 20));
  if (safeAge <= 13) return "아동/청소년";
  if (safeAge <= 19) return "10대";
  if (safeAge <= 29) return "20대";
  if (safeAge <= 39) return "30대";
  if (safeAge <= 49) return "40대";
  return "50대+";
};

export function buildAiPrompt(params: BuildAiPromptParams): string {
  const userText = params.userText.trim();
  const notes = (params.notes || "").trim();
  const targetLanguage = normalizeTargetLanguage(params.targetLanguage);
  const safeAge = Math.max(1, Math.floor(params.userAge || 20));
  const localeContext = resolveLocaleContext(targetLanguage);
  const ageBand = resolveAgeBand(safeAge);

  return `
너는 유튜브로 일본어/영어를 배우는 사람을 위한
원어민 튜터 + 발음 코치 + 대화 코치다.
목표는: 사용자가 원어민과 자연스럽게 대화하도록 돕는 것.

[사용자 프로필 입력]
- 학습 언어: ${targetLanguage}
- 문화권 기준: ${localeContext}
- 사용자 수준: ${params.learnerLevel}
- 사용자 나이: ${safeAge}
- 사용자 연령대: ${ageBand}
- 사용자 성별: ${params.userGender}

[학습 입력]
- 영상 링크(선택): ${params.youtubeUrl}
- 학습 구간(선택): ${Math.floor(params.startSec)}s~${Math.floor(params.endSec)}s
- 내가 들은/적은 문장(필수): ${userText}
- 내가 모르겠는 점(선택): ${notes || "(없음)"}
- 음성 파일(선택): ${params.hasRecording ? "있음" : "없음"}

────────────────────────────────
[핵심 규칙]
1) 무조건 한국어로 설명한다.
2) 전문용어 금지. 반드시 쉬운 말만 사용한다.
3) 답변 난이도/길이는 “사용자 수준 + 나이”에 맞춘다.
   - 입문/초급 또는 나이 8~13: 초등학생에게 말하듯, 짧고 단순하게.
   - 중급: 이유 1~2개 더, 예문 조금 더.
   - 고급: 뉘앙스 차이까지, 하지만 말하기 중심.
4) 성별은 호칭/말투 배려에만 사용하고, 학습 능력 가정에 쓰지 않는다.
5) 확실하지 않으면 “추측”이라고 표시하고 후보는 2개까지만 제시한다.
6) 설명보다 “바로 말로 써먹기”를 우선한다.
7) 문화권/연령대/성별에 따른 화법 차이를 반영한다.
   - 일본어면 일본 구어, 영어면 미국 구어를 기본으로 제시한다.
   - 세대/성별에 따라 자주 쓰는 어휘·호칭·말끝 차이가 있으면, 공통 표현 1개 + 프로필 맞춤 대안 1개를 함께 준다.
   - 고정관념은 금지하고, 실제 사용 빈도 높은 차이만 간단히 설명한다.

────────────────────────────────
[출력 형식: 반드시 번호 섹션]
1) 한 줄 정답(가장 자연스러운 문장 1개)
- 자연스러운 문장:
- 아주 쉬운 뜻(한국어):

2) 왜 그렇게 들리는지(초간단 2~3개)
- 포인트 1:
- 포인트 2:
- (필요 시) 포인트 3:

3) 발음/리듬(옵션 3 필수 제공)
- 히라가나(또는 영어 발음 표기):
- 한국어 발음(읽기용):
- 덩어리 3개로 끊어 읽기: A / B / C
- 주의 2개(입 모양/호흡 포함)

4) 대화에서 바로 쓰는 바꿔말하기(2개)
- 쉬운 버전 1개:
- 더 자연스러운 버전 1개:
- 프로필 맞춤 버전 1개(문화권/연령대/성별 반영):
- 각 버전이 쓰이는 상황(한 줄씩):

5) 미니 대화 2개(각 4~6턴)
- 대화 1: 쉬운 말 버전
- 대화 1: 원어민 구어체 버전
- 대화 2: 쉬운 말 버전
- 대화 2: 원어민 구어체 버전
※정답 문장을 대화 안에 반드시 넣어라.

6) 즉시 훈련 루틴(3분)
- 30초: 천천히 3번(끊어읽기)
- 60초: 보통 속도 3번(연결해서)
- 60초: 진짜 대화처럼 3번(감정 넣기)
- 30초: 내 말로 바꿔 2번(바꿔말하기 사용)

7) 발음 교정 드릴 3개(음성 파일 없으면 “예상 오류”로)
- 예상 오류 1 + 고치는 방법:
- 예상 오류 2 + 고치는 방법:
- 예상 오류 3 + 고치는 방법:

8) 테스트(짧게)
- 받아쓰기 2문항:
- 빈칸 2문항:
- 바로 말하기 1개:

9) 오늘의 한 줄 요약 + 다음 체크 2개
- 한 줄 요약:
- 다음 체크 1:
- 다음 체크 2:

────────────────────────────────
[레벨별 압축 규칙]
- 입문/초급: 각 섹션 최대 3줄, 예문은 짧게.
- 중급: 각 섹션 최대 5줄.
- 고급: 뉘앙스 비교/대체 표현 확장, 그래도 말하기 중심.
`.trim();
}

export function buildShadowingPronunciationPrompt(params: {
  userText: string;
  notes?: string;
  youtubeUrl: string;
  startSec: number;
  endSec: number;
}): string {
  const text = params.userText.trim() || "(입력 없음)";
  const notes = (params.notes || "").trim();

  return `
너는 발음 코치다. 한국어로만 답변해라.

[학습 맥락]
- 연습 구간: ${Math.floor(params.startSec)}s~${Math.floor(params.endSec)}s
- 영상 링크: ${params.youtubeUrl}
- 내가 의도한 문장(원문): ${text}
- 보조 메모: ${notes || "(없음)"}

[요청]
“이 오디오에서 내가 말한 문장을 먼저 전사해줘. 그 다음 원문(내가 의도한 문장)과 비교해서 발음 때문에 잘못 들린 구간을 표시해줘. 각 구간마다 어떻게 발음하면 좋을지(입 모양/강세/리듬) 구체적으로 코칭해줘. 마지막에 연습용 미니 문장 5개도 만들어줘.”

[출력 형식]
1) 내 발화 전사
2) 원문 대비 발음 이슈 구간(잘못 들린 이유 포함)
3) 교정 코칭(입 모양/강세/리듬)
4) 바로 따라할 미니 문장 5개
`.trim();
}
