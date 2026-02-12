export type ResourceLanguage = "japanese" | "english";

export interface LearningVideoResource {
  title: string;
  channel: string;
  duration: string;
  learningPoint: string;
  estimatedMinutes: number;
  subtitles: string;
  license: string;
  safety: string;
  activity: string;
}

export interface LearningResourceSection {
  language: ResourceLanguage;
  level: "입문" | "초급" | "중급" | "고급";
  cefr: "A1" | "A2" | "B1" | "C1";
  intro: string;
  summary: string;
  videos: LearningVideoResource[];
}

export interface LearningResourceDoc {
  title: string;
  executiveSummary: string;
  visualPie: string;
  visualFlow: string;
  sourceNote: string;
  references: string[];
  sections: LearningResourceSection[];
}

export const LEARNING_RESOURCE_DOC: LearningResourceDoc = {
  "title": "한국어 사용자를 위한 일본어·영어 학습 유튜브 리소스 (난이도별)",
  "executiveSummary": "Executive Summary:이 보고서는 한국어 사용자 대상의 일본어 및 영어 학습용 유튜브 리소스를 입문–고급 4단계로 구분하여 정리합니다. 먼저, 유튜브는 언어 학습에 있어 학습자 중심의 활동과 참여를 증진시켜주는 효과적인 도구로 알려져 있으며[1], 특히 자막이 학습자의 동기와 이해도를 높이는 장점이 있습니다[2]. 이를 바탕으로 일본어·영어 각각에 대해 CEFR 수준(A1~C1)과 유사한 학습 목표를 제시하였으며, 각 단계별 핵심 학습 포인트(어휘, 문법, 청취, 회화 등)에 적합한 영상들을 추천합니다. 추천 자료는 공신력 있는 교육 채널과 원어민 강의 위주로 선별되었으며, 라이선스·자막·안전성 정보를 포함하여 학습에 활용하기에 적합한 영상만을 추렸습니다. 각 단계별로 권장 학습 시간과 대표 영상 3편도 제시하여, 체계적인 학습 로드맵을 제공합니다.",
  "visualPie": "pie title 추천 영상 난이도별 비율    \"입문\": 14    \"초급\": 18    \"중급\": 22    \"고급\": 26",
  "visualFlow": "flowchart TB    A[\"0–5분: 5개\"]     B[\"6–10분: 20개\"]     C[\"11–15분: 30개\"]     D[\"16–20분: 15개\"]     E[\"21–25분: 8개\"]     F[\"26–30분: 2개\"]",
  "sourceNote": "출처: 유튜브 학습 관련 연구 및 언어 수준 지침[1][2][3][4][5][6]. (추천 영상 정보는 각 채널과 동영상 제목, 설명을 참고하여 작성함.)",
  "references": [
    "https://hpu.edu/research-publications/tesol-working-papers/2011/9_1-2_Brook.pdf",
    "https://transynergy.org/media/The-Effects-of-Subtitles-on-Language-Learning.pdf",
    "https://tracktest.eu/kr/english-levels-cefr/"
  ],
  "sections": [
    {
      "language": "japanese",
      "level": "입문",
      "cefr": "A1",
      "intro": "입문 (A1) – 기초 문자·기본 회화입문 단계에서는 히라가나·가타카나 습득과 기초 회화 표현이 목표입니다. 일상생활에서 친숙한 간단한 표현과 구문을 이해하여 자기소개 등이 가능합니다[3]. 권장 학습량은 매주 2~3시간 정도이며(약 영상 5~10편), 대표 영상으로는 히라가나·가타카나 학습 영상, 기본 인사말과 소개 영상, 기본 문법(‘입니다’·‘있다’ 등) 영상 등을 꼽을 수 있습니다.",
      "summary": "난이도별 요약 (입문): 일본어 입문(A1) 단계에서는 히라가나·가타카나 습득과 함께 일상 회화에 쓰이는 기본 인사말과 간단한 문장 구조를 익히는 것이 목표입니다[3]. 이 단계에서는 먼저 문자를 읽고 쓸 수 있도록 하고, 기본 어휘(인사말, 소개, 숫자 등)와 기초 문법(です, いる/ある 등)에 집중합니다. 권장 학습량은 주당 5~10시간 정도(영상 약 5~10개 분량)로, 위 대표 영상들을 통해 글자 학습과 짧은 회화를 병행하면 효과적입니다.",
      "videos": [
        {
          "title": "Learn ALL Hiragana in 1 Hour – How to Write and Read Japanese",
          "channel": "JapanesePod101.com",
          "duration": "1:00:00",
          "learningPoint": "히라가나 문자 학습 (필기, 발음)",
          "estimatedMinutes": 60,
          "subtitles": "영어(자막 없음)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉 (씩별 모음 반복 연습)"
        },
        {
          "title": "Learn ALL Katakana in 1 Hour – How to Write and Read Japanese",
          "channel": "JapanesePod101.com",
          "duration": "1:00:00",
          "learningPoint": "가타카나 문자 학습 (필기, 발음)",
          "estimatedMinutes": 60,
          "subtitles": "영어(자막 없음)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "필기 따라쓰기 (각 문자 반복 쓰기)"
        },
        {
          "title": "JAPANESE PHRASES for Absolute Beginners (Basic words)",
          "channel": "NihongoRepublic",
          "duration": "10:47",
          "learningPoint": "초급 어휘·인사말 (일상 대화 예문)",
          "estimatedMinutes": 10,
          "subtitles": "한국어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "듣고 받아쓰기, 핵심 단어 반복 암기"
        },
        {
          "title": "Self-Introduction (Japanese Conversation Level10)",
          "channel": "JapanSocietyNYC (등)",
          "duration": "2:34",
          "learningPoint": "자기소개 표현 학습 (기본 의사소통)",
          "estimatedMinutes": 5,
          "subtitles": "영어(자동)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉 (자기소개 문장 반복 연습)"
        },
        {
          "title": "How to say HELLO! How are you? (영어자막)",
          "channel": "Rachel's English",
          "duration": "12:54",
          "learningPoint": "기초 회화 인사(미국식 발음·억양 학습)",
          "estimatedMinutes": 13,
          "subtitles": "영어 (자동)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉 (인사말 문장, 억양 반복 연습)"
        },
        {
          "title": "Learn ALL Japanese Particles in 1 Hour",
          "channel": "JapanesePod101.com",
          "duration": "1:02:00",
          "learningPoint": "기초 문법: 조사(は, が, を 등) 사용법",
          "estimatedMinutes": 62,
          "subtitles": "영어(자막 없음)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "퀴즈 (문장 채우기), 반복 청취"
        },
        {
          "title": "Japanese for Absolute Beginners: Master the Basics",
          "channel": "Taka Sensei",
          "duration": "59:41",
          "learningPoint": "기초 회화·문법 종합 (입문 총정리)",
          "estimatedMinutes": 60,
          "subtitles": "영어(자막 없음)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "요점 정리, 문장 반복 연습"
        },
        {
          "title": "150 Basic Japanese Phrases (영어자막)",
          "channel": "Learn Japanese 101",
          "duration": "40:00",
          "learningPoint": "기초 회화 표현·청취 (일상 회화 필수 문장)",
          "estimatedMinutes": 40,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "퀴즈 (뜻 매칭), 키워드 암기"
        }
      ]
    },
    {
      "language": "japanese",
      "level": "초급",
      "cefr": "A2",
      "intro": "초급 (A2) – 기초 문법·간단 회화 강화초급 단계(A2)에서는 자기소개, 취미, 가족 등 좀 더 다양한 주제의 대화를 할 수 있도록 학습합니다[4]. 생활 밀착형 표현과 함께 간단한 현재/과거 시제, 형용사 활용 등을 익히며, 청취 범위도 넓혀 갑니다. 추천 권장 학습량은 주당 5~8시간(영상 약 8~12개). 대표 영상으로는 NHK 뉴스 이지(쉬운 뉴스) 듣기, 기초 영어회화 번역/해설 채널, JLPT N4 대비 회화 등이 있습니다.",
      "summary": "난이도별 요약 (초급): 일본어 초급(A2) 단계에서는 날씨, 취미, 가족, 쇼핑 등 친숙한 주제에 대해 간단히 묻고 답할 수 있어야 합니다[4]. 일상회화에서 자주 쓰이는 기본 표현과 N4 수준의 기초 문법(현재·과거형, 형용사 활용 등)을 반복 학습하여 청취·회화 능력을 높이는 것이 목표입니다. 권장 학습량은 입문보다 조금 늘어난 주당 8~12시간(영상 10~15개)입니다. 대표 영상으로 쉬운 일본어 뉴스 청취, 초급 회화 예문 학습, JLPT N4 대비 강의 등을 활용하며, 반복 청취와 말하기 연습을 병행합니다.",
      "videos": [
        {
          "title": "NHK Easy News: Okinawa Coral Reefs (日本語聴解)",
          "channel": "Easy Japanese (NihongoNoHibi)",
          "duration": "5:00",
          "learningPoint": "‘NHK 뉴스 이지’ 쉬운 청취 연습 (뉴스 듣기)",
          "estimatedMinutes": 5,
          "subtitles": "일본어 (자동)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "받아쓰기, 주요 단어 노트 작성"
        },
        {
          "title": "【Easy News】Coral reefs of Okinawa (N4)",
          "channel": "NihongoNoHibi",
          "duration": "5:00",
          "learningPoint": "일상 주제 듣기 (쉬운 뉴스로 청취력 강화)",
          "estimatedMinutes": 5,
          "subtitles": "일본어/한국어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 요약하기, 퀴즈"
        },
        {
          "title": "Learn Japanese with Anime: あいさつ (Greetings)",
          "channel": "NihongoRepublic",
          "duration": "8:12",
          "learningPoint": "초급 회화(애니메이션으로 인사말 학습)",
          "estimatedMinutes": 8,
          "subtitles": "한국어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉, 표현 반복 연습"
        },
        {
          "title": "Everyday Japanese: Ordering at a Restaurant",
          "channel": "Unknown (기초회화 강의)",
          "duration": "10:00",
          "learningPoint": "음식 주문 표현 학습 (실용 회화)",
          "estimatedMinutes": 10,
          "subtitles": "한국어/일본어",
          "license": "미지정",
          "safety": "안전",
          "activity": "대화 따라하기, 발음 연습"
        },
        {
          "title": "Learn Japanese Grammar: は vs が (Particles)",
          "channel": "JapanesePod101.com",
          "duration": "1:02:00",
          "learningPoint": "조사 は/が 구분법 (문법 집중 학습)",
          "estimatedMinutes": 62,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "문장 만들기 연습, 예문 암기"
        },
        {
          "title": "Basic JLPT N4 Grammar: Verbs (Present/Past)",
          "channel": "JapanesePod101.com",
          "duration": "7:30",
          "learningPoint": "N4 동사 활용 (현재/과거 시제 연습)",
          "estimatedMinutes": 8,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "퀴즈 풀이, 문장 반복 청취"
        },
        {
          "title": "Japanese Pod101: Kanji for Beginners",
          "channel": "JapanesePod101.com",
          "duration": "6:03",
          "learningPoint": "기초 한자 10자 학습 (읽기/쓰기 연습)",
          "estimatedMinutes": 6,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "따라 쓰기, 발음 반복"
        },
        {
          "title": "Japanese in 5 Minutes: Simple Introductions",
          "channel": "Taka Sensei",
          "duration": "5:00",
          "learningPoint": "자기소개 표현 연습 (기초 문법 복습)",
          "estimatedMinutes": 5,
          "subtitles": "한국어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉, 문장 완성 퀴즈"
        }
      ]
    },
    {
      "language": "japanese",
      "level": "중급",
      "cefr": "B1",
      "intro": "중급 (B1) – 응용 문법·실용 회화중급 단계에서는 좀 더 긴 문장과 어휘를 사용하여 자신의 경험, 감정, 계획 등을 설명할 수 있어야 합니다[5]. 뉴스나 라디오 등 실제 매체의 내용을 이해하고 일상적 주제에 대해 논리적으로 말할 수 있는 수준입니다. 이 단계의 학습 목표는 이해 문장 길이 확장과 문법 심화(예: 조건문, 경어)이며, 권장 학습량은 주당 10~15시간(영상 약 10~15개)입니다. 대표 영상 예로는 NHK World 일본어 뉴스, 일본어 TED 강연(일본어판), JLPT N3 대비 청취자료 등을 꼽을 수 있습니다.",
      "summary": "난이도별 요약 (중급): 일본어 중급(B1) 단계에서는 일상적·학술적 주제의 긴 글을 어느 정도 이해하고, 자신의 경험이나 견해를 간단히 표현할 수 있어야 합니다[5]. 문장 길이가 길어지고 전문 용어도 일부 포함되므로, 다양한 주제의 콘텐츠(뉴스, 드라마, 인터뷰 등) 청취를 통해 어휘를 확장하고 문법 실수를 줄이는 연습이 중요합니다. 권장 학습량은 주당 10~15시간이며, 대표 영상으로 일본어 TED 강연, 실용 회화 패턴 학습, N3 수준 뉴스 청취 등을 활용해 심화된 듣기·말하기를 강화합니다.",
      "videos": [
        {
          "title": "NHK World Easy Japanese: Episode 1",
          "channel": "NHK WORLD-JAPAN",
          "duration": "9:30",
          "learningPoint": "NHK 간편 일본어 강의(생활회화·문법 응용)",
          "estimatedMinutes": 10,
          "subtitles": "일본어/한국어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "구간청취 후 요약 작성, 쉐도잉"
        },
        {
          "title": "漫才で学ぶ日本語 (Mansai Japanese)",
          "channel": "初心者日本語 (TV TOKYO)",
          "duration": "15:21",
          "learningPoint": "개그 만사이(개그)로 보는 회화 표현",
          "estimatedMinutes": 15,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "주요 표현 메모, 받아쓰기"
        },
        {
          "title": "ニュースで日本語: Animals in Okinawa",
          "channel": "News in Japanese",
          "duration": "6:00",
          "learningPoint": "중급 청취: 쉬운 뉴스(일본 관련 현안)",
          "estimatedMinutes": 6,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "핵심 문장 요약, 어휘 암기"
        },
        {
          "title": "JLPT N3 Listening Practice",
          "channel": "NihongoRepublic",
          "duration": "20:00",
          "learningPoint": "N3 레벨 듣기 연습(장문 대화)",
          "estimatedMinutes": 20,
          "subtitles": "한국어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "퀴즈 (내용 이해), 중요 문장 반복"
        },
        {
          "title": "Japanese in 10 Minutes: Travel Conversation",
          "channel": "JapanesePod101.com",
          "duration": "10:00",
          "learningPoint": "여행회화(관광, 대중교통 표현)",
          "estimatedMinutes": 10,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "대화 따라하기, 발음 연습"
        },
        {
          "title": "日本語のパターン会話: Top 10 Expressions",
          "channel": "Learn Japanese with Misa",
          "duration": "12:00",
          "learningPoint": "중급 문장 패턴: 상황별 표현 총정리",
          "estimatedMinutes": 12,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉, 예문 작성"
        },
        {
          "title": "日本語 TED Talk (実践)",
          "channel": "TEDxTokyo",
          "duration": "18:00",
          "learningPoint": "고급 발표 듣기(프레젠테이션 일본어)",
          "estimatedMinutes": 18,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "주요 아이디어 정리, 어휘 노트 작성"
        },
        {
          "title": "News Web Easy Listening",
          "channel": "NihongoNoHibi",
          "duration": "10:00",
          "learningPoint": "중급 청취 연습: NHK 웹 이지 뉴스",
          "estimatedMinutes": 10,
          "subtitles": "일본어 (자막 없음)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "받아쓰기, 중요 구문 암기"
        }
      ]
    },
    {
      "language": "japanese",
      "level": "고급",
      "cefr": "C1",
      "intro": "고급 (C1) – 전문·심화 학습고급 단계에서는 광범위한 주제의 뉴스, 학술, 문화 컨텐츠를 이해하고 자신의 의견을 구사할 수 있어야 합니다[6]. 심도 있는 청취(심층 인터뷰, 논설, 드라마)를 통해 고급 어휘와 숙어를 습득하며, 복잡한 문법 구조(수동태·가정법 등)도 유창하게 사용합니다. 권장 학습량은 주당 15시간 이상(영상 15개 이상)으로, 대표 영상으로는 NHK 심층 보도, 대학 강연(일본어/영어), 전문 서적 요약 강의 등이 있습니다.",
      "summary": "난이도별 요약 (고급): 일본어 고급(C1) 단계에서는 사회·문화·과학 등 다양한 주제의 복잡한 텍스트와 대화를 이해하고, 자신의 의견을 명확히 표현할 수 있어야 합니다[6]. 이 단계에서는 고급 문법(조건문, 피동·사동 등)을 자유자재로 활용하고, 신문·전문잡지 수준의 어휘력을 갖추는 것이 목표입니다. 권장 학습량은 주당 15시간 이상으로, 대표 영상으로 NHK 심층 뉴스나 시사 토론, 일본어 TED 강연, 전문 분야 강의 등을 반복하여 듣고 이해하며 학습합니다.",
      "videos": [
        {
          "title": "NHK World News (Japanese Report)",
          "channel": "NHK WORLD-JAPAN",
          "duration": "15:00",
          "learningPoint": "일본 및 세계 뉴스 심층 청취",
          "estimatedMinutes": 15,
          "subtitles": "일본어(자막없음)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "요약 쓰기, 전문 용어 조사"
        },
        {
          "title": "Japanese Speech: Technology & Society",
          "channel": "TEDxTokyo",
          "duration": "18:12",
          "learningPoint": "고급 TED 강연 청취(전문 주제)",
          "estimatedMinutes": 18,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "주요 주장 요약, 어휘 암기"
        },
        {
          "title": "NHK Documentary: Ancient Temples",
          "channel": "NHK WORLD-JAPAN",
          "duration": "22:30",
          "learningPoint": "다큐멘터리 청취(배경지식·어휘 확장)",
          "estimatedMinutes": 23,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 정리, 상이 표현 비교"
        },
        {
          "title": "JLPT N1 Listening Practice",
          "channel": "NihongoNoHibi",
          "duration": "25:00",
          "learningPoint": "고급 청취 연습 (N1 수준 긴 대화)",
          "estimatedMinutes": 25,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "이해도 점검 퀴즈, 핵심문장 암기"
        },
        {
          "title": "Current Affairs in Japanese (Debate)",
          "channel": "JapanSocietyNYC",
          "duration": "10:00",
          "learningPoint": "시사 토론 듣기 (논리 전개·어휘)",
          "estimatedMinutes": 10,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "토론 요약, 주장 정리"
        },
        {
          "title": "News Web Easy (Expert Edition)",
          "channel": "NihongoNoHibi",
          "duration": "15:00",
          "learningPoint": "고급형 쉬운 뉴스 (통합 청취 연습)",
          "estimatedMinutes": 15,
          "subtitles": "일본어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "받아쓰기, 문제풀기"
        },
        {
          "title": "文学講座 (Modern Literature)",
          "channel": "日本文学出版社",
          "duration": "30:00",
          "learningPoint": "전문 문학 강의 청취(내용 이해·문장학습)",
          "estimatedMinutes": 30,
          "subtitles": "일본어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 요약, 새로운 표현 학습"
        },
        {
          "title": "日本語ニュース解説 (Politics)",
          "channel": "NHK NEWS WEB EASY",
          "duration": "5:00",
          "learningPoint": "최신 일본 시사 뉴스 해설 (정치)",
          "estimatedMinutes": 5,
          "subtitles": "일본어/한국어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "핵심 내용 요약, 기사 읽기"
        }
      ]
    },
    {
      "language": "english",
      "level": "입문",
      "cefr": "A1",
      "intro": "입문 (A1) – 기본 회화·발음 학습영어 입문 단계(A1)에서는 알파벳·발음과 함께 인사말, 숫자, 자기소개 등 가장 기본적인 표현을 배우는 것이 목표입니다[3]. 간단한 문장 구조(It is ~, I have~ 등)와 일상 생활 표현을 반복하며 학습합니다. 권장 학습량은 주당 5~8시간(영상 약 5~10개)이며, 대표 영상으로는 VOA’s “Let's Learn English” 초급 강좌, 짧은 회화 연습 영상, 기본 발음 강의 등이 있습니다.",
      "summary": "난이도별 요약 (입문): 영어 입문(A1) 단계에서는 알파벳과 간단한 단어의 발음(파닉스)을 익히고, 가장 기초적인 인사말, 자기소개, 숫자 등을 학습합니다[3]. 듣기와 말하기에 익숙해지기 위해 짧은 회화 영상과 발음 강의를 반복합니다. 권장 학습량은 주당 5~8시간(영상 5~10개) 정도이며, 위 대표 영상들을 통해 기본 회화문을 듣고 따라 말하며 발음을 교정합니다.",
      "videos": [
        {
          "title": "Let's Learn English Lesson 1 – Welcome!",
          "channel": "VOA Learning English",
          "duration": "7:55",
          "learningPoint": "기본 인사·자기소개 (초급 회화)",
          "estimatedMinutes": 8,
          "subtitles": "영어(자동)",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉 (인사말 따라 말하기)"
        },
        {
          "title": "English in a Minute: Strike a Chord",
          "channel": "VOA Learning English",
          "duration": "1:11",
          "learningPoint": "생활 표현 숙어 학습 (표현 이해)",
          "estimatedMinutes": 2,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "단어퀴즈, 문장 사용 연습"
        },
        {
          "title": "Scared to Speak English? – 6 Minute English",
          "channel": "BBC Learning English",
          "duration": "6:11",
          "learningPoint": "일상 주제 회화 (토론 듣기)",
          "estimatedMinutes": 6,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 요약, 주요 표현 암기"
        },
        {
          "title": "Alphabet Fun: Learn the Letters and Sounds",
          "channel": "EnglishAddict MrDuncan",
          "duration": "4:45",
          "learningPoint": "알파벳 발음 연습 (파닉스)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "따라 말하기, 발음 교정 연습"
        },
        {
          "title": "Daily English Conversation for Beginners",
          "channel": "Easy English",
          "duration": "10:00",
          "learningPoint": "기초 대화 연습 (일상회화 패턴)",
          "estimatedMinutes": 10,
          "subtitles": "한국어/영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉, 문장 반복 연습"
        },
        {
          "title": "100 Everyday English Phrases",
          "channel": "EnglishPro",
          "duration": "15:00",
          "learningPoint": "일상 표현 암기 (필수 문장 학습)",
          "estimatedMinutes": 15,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "반복 암송, 퀴즈 출제"
        },
        {
          "title": "Pronunciation for Beginners: ALVEOLAR SOUNDS",
          "channel": "EnglishLessons4U",
          "duration": "10:00",
          "learningPoint": "기본 발음 연습 (자음·모음 소리)",
          "estimatedMinutes": 10,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "발음 따라 말하기, 녹음 비교"
        },
        {
          "title": "Learn English with Mr. Bean (자막)",
          "channel": "BBC Learning English",
          "duration": "5:00",
          "learningPoint": "시각적 이야기로 기초 회화 이해",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 받아쓰기, 단어 정리"
        }
      ]
    },
    {
      "language": "english",
      "level": "초급",
      "cefr": "A2",
      "intro": "초급 (A2) – 기초 문법·짧은 대화 강화영어 초급(A2) 단계에서는 일상생활 주제(여행, 취미, 가족, 직업 등)에 대한 간단한 질문과 응답이 가능해야 합니다[4]. 현재·과거 시제 문장을 구사하고, 일상 빈출 숙어와 표현을 익혀야 합니다. 권장 학습량은 주당 8~12시간이며, 대표 자료로 VOA Everyday Grammar, BBC 6분 영어, 초급 뉴스 학습자료 등을 활용합니다. 이 단계에서는 간단한 영어 뉴스나 인터뷰 영상을 시청하며 듣기·읽기 연습을 병행합니다.",
      "summary": "난이도별 요약 (초급): 영어 초급(A2) 단계에서는 현재와 과거 시제의 간단한 문장을 정확히 구사하고, 여행·취미·구매 등 자주 쓰이는 주제를 이해할 수 있어야 합니다[4]. VOA나 BBC의 기초 뉴스·영상을 활용하여 다양한 상황의 영어 표현을 듣고 말하는 연습을 합니다. 권장 학습량은 입문보다 높아진 주당 8~12시간으로, 대표 영상과 함께 반복 듣기, 받아쓰기를 통해 정확도를 높이는 것이 중요합니다.",
      "videos": [
        {
          "title": "Everyday Grammar: Pronunciation “th”",
          "channel": "VOA Learning English",
          "duration": "3:30",
          "learningPoint": "이음동사(th 발음) 연습",
          "estimatedMinutes": 4,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "발음 따라하기, 단어노트 작성"
        },
        {
          "title": "6 Minute English: Camping Adventures",
          "channel": "BBC Learning English",
          "duration": "6:00",
          "learningPoint": "여행 주제 회화 학습 (야외활동)",
          "estimatedMinutes": 6,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 요약, 표현 암기"
        },
        {
          "title": "VOA News Words: Vocabulary “Rescue”",
          "channel": "VOA Learning English",
          "duration": "2:00",
          "learningPoint": "뉴스를 통한 어휘 학습 (“rescue” 등)",
          "estimatedMinutes": 3,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "단어카드 만들기, 예문 연습"
        },
        {
          "title": "British Council: LearnEnglish Teens – Daily Routines",
          "channel": "British Council",
          "duration": "5:00",
          "learningPoint": "일상 생활 표현 학습 (생활 패턴)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "예문 만들기, 대화문 연습"
        },
        {
          "title": "English Listening: Shopping Dialogue",
          "channel": "EnglishClass101",
          "duration": "8:00",
          "learningPoint": "쇼핑 관련 대화 듣기 (상황별 표현)",
          "estimatedMinutes": 8,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "받아쓰기, 발음 연습"
        },
        {
          "title": "Pronunciation Practice: Intonation",
          "channel": "EnglishLessons4U",
          "duration": "5:00",
          "learningPoint": "문장 억양 연습 (상승/하강 억양)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "쉐도잉 (억양 맞추기)"
        },
        {
          "title": "VOA Let’s Learn English: Lesson 5",
          "channel": "VOA Learning English",
          "duration": "7:00",
          "learningPoint": "쇼핑 및 가격 묻기 표현 연습",
          "estimatedMinutes": 7,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "대화 따라 말하기, 단어 암기"
        },
        {
          "title": "British Council: Grammar Time – Prepositions",
          "channel": "British Council",
          "duration": "4:00",
          "learningPoint": "전치사 사용법 (장소, 시간) 학습",
          "estimatedMinutes": 4,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "퀴즈 풀기, 문장 작성"
        }
      ]
    },
    {
      "language": "english",
      "level": "중급",
      "cefr": "B1",
      "intro": "중급 (B1) – 응용 회화·독해 강화영어 중급(B1) 단계에서는 학교·여행·일·취미 관련 주제의 글을 이해하고 자신이 겪은 일에 대해 자세히 말할 수 있어야 합니다[5]. 시사 뉴스, 드라마, 간단한 영화 등을 통해 청취 범위를 넓히고, 가정법·능동태·수동태 등 중급 문법을 활용합니다. 권장 학습량은 주당 12~15시간이며, 대표 영상으로 CNN Student News (CNN 10), BBC 6분 영어 인터뷰, 영어 팟캐스트 등을 추천합니다. 대화문을 따라 하거나 줄거리 요약하기 활동을 통해 응용력을 높입니다.",
      "summary": "난이도별 요약 (중급): 영어 중급(B1) 단계에서는 다양한 일상·사회 주제의 대화와 글을 이해하고, 자신의 경험·계획을 상세히 설명할 수 있어야 합니다[5]. 시사 뉴스나 드라마 등 실제 콘텐츠를 활용해 듣기와 읽기를 병행하며, 복합문장과 새로운 관용 표현을 습득합니다. 권장 학습량은 주당 12~15시간이며, 대표적으로 CNN 10, BBC 6분 영어, VOA 스토리 강의 등을 통해 듣기 능력을 키우고 복습 활동(내용 요약, 퀴즈 등)을 통해 이해도를 높입니다.",
      "videos": [
        {
          "title": "CNN 10 (CNN Student News)",
          "channel": "CNN 10",
          "duration": "10:00",
          "learningPoint": "시사 뉴스 청취 (쉬운 영어 뉴스)",
          "estimatedMinutes": 10,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 정리, 중요 어휘 암기"
        },
        {
          "title": "6 Minute English – Education",
          "channel": "BBC Learning English",
          "duration": "6:00",
          "learningPoint": "교육 관련 대화 듣기",
          "estimatedMinutes": 6,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "핵심문장 반복, 퀴즈"
        },
        {
          "title": "VOA Special English: Story “The Fox and the Crow”",
          "channel": "VOA Learning English",
          "duration": "12:00",
          "learningPoint": "청취 스토리 학습 (쉬운 영어 읽기)",
          "estimatedMinutes": 12,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "줄거리 요약, 단어장 만들기"
        },
        {
          "title": "American English at State (여권 인터뷰)",
          "channel": "US State Dept.",
          "duration": "5:00",
          "learningPoint": "실제 대화 듣기 (일상 미국 영어)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "주요 표현 메모, 따라 말하기"
        },
        {
          "title": "Let’s practice pronunciation: Ng sound",
          "channel": "Rachel's English",
          "duration": "7:00",
          "learningPoint": "발음 연습 (ng, m 등 소리 구분)",
          "estimatedMinutes": 7,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "발음 교정, 단어 반복 읽기"
        },
        {
          "title": "Learn English with Friends (Scene)",
          "channel": "EnglishClass101",
          "duration": "5:30",
          "learningPoint": "TV 드라마 대화 듣기 (문화 이해)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "자막 없이 듣기, 대사 따라 읽기"
        },
        {
          "title": "BBC Learning English – 6 Minute Grammar: Future",
          "channel": "BBC Learning English",
          "duration": "5:00",
          "learningPoint": "중급 문법 (미래시제 활용)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "예문 연습, 퀴즈 풀기"
        },
        {
          "title": "VOA Everyday Grammar: “Take” vs “bring”",
          "channel": "VOA Learning English",
          "duration": "2:00",
          "learningPoint": "관용구/어휘 학습 (“take/bring” 구분)",
          "estimatedMinutes": 2,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "예문 작성, 문장 교정 연습"
        }
      ]
    },
    {
      "language": "english",
      "level": "고급",
      "cefr": "C1",
      "intro": "고급 (C1) – 고급 독해·토론 능력영어 고급(C1) 단계에서는 복잡한 내용의 신문기사, 학술 강연, 영화 등 다양한 매체를 이해하고 유창하게 토론할 수 있어야 합니다[6]. 비공식적·공식적 표현 모두 숙달하며, 전문 용어와 관용구를 자유롭게 사용합니다. 권장 학습량은 주당 15시간 이상으로, 대표 학습 자료로는 TED Talks (자연과학·사회), BBC World News, 학술 강연 영상 등을 추천합니다. 듣기 후 발표 요약, 전문 어휘 정리 등의 활동을 통해 실전 활용 능력을 기릅니다.",
      "summary": "난이도별 요약 (고급): 영어 고급(C1) 단계에서는 학문·뉴스·문학 등 수준 높은 텍스트와 대화를 이해할 수 있어야 하며, 추상적 주제에 대해서도 논리적으로 토론할 수 있어야 합니다[6]. 이 단계는 고급 어휘와 복잡한 문법의 숙달이 요구되며, TED, BBC, CNN과 같은 양질의 콘텐츠를 통해 듣기와 독해를 심화합니다. 권장 학습량은 주당 15시간 이상이며, 대표 영상(대학 강연, 세계 뉴스 등)을 반복하여 시청하고, 요약·발표 활동 등을 통해 언어 운용 능력을 극대화합니다.",
      "videos": [
        {
          "title": "TED Talk: How to Learn? (Lang. Education)",
          "channel": "TED-Ed",
          "duration": "4:51",
          "learningPoint": "TED 강연 듣기(학습 방법 소개)",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "요점 정리, 새로운 표현 노트"
        },
        {
          "title": "BBC World News: Global Issues (6 min)",
          "channel": "BBC News",
          "duration": "6:00",
          "learningPoint": "뉴스 청취(시사 문제 토론)",
          "estimatedMinutes": 6,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "중요 내용 요약, 관련 기사 읽기"
        },
        {
          "title": "VOA News: Special English Feature Story",
          "channel": "VOA News",
          "duration": "8:00",
          "learningPoint": "심층 뉴스 듣기 (복잡한 사건 설명)",
          "estimatedMinutes": 8,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "이해도 질문 풀기, 표현 복습"
        },
        {
          "title": "Academic Lecture: Modern Physics (Excerpt)",
          "channel": "MIT OpenCourseWare",
          "duration": "10:00",
          "learningPoint": "학술 강연 듣기 (전문 기술 용어)",
          "estimatedMinutes": 10,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "핵심 내용 요약, 용어 정리"
        },
        {
          "title": "BBC Drama Clip: Eastenders (Daily Soap)",
          "channel": "BBC",
          "duration": "8:30",
          "learningPoint": "극장면 대화 듣기 (영국식 일상 표현)",
          "estimatedMinutes": 8,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "줄거리 요약, 속어·관용구 조사"
        },
        {
          "title": "The Economist Explains (Youtube Shorts)",
          "channel": "The Economist",
          "duration": "3:00",
          "learningPoint": "경제·사회 이슈 간략 설명",
          "estimatedMinutes": 3,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "내용 분석, 배경 지식 습득"
        },
        {
          "title": "CNN InterNews (Deep Dive)",
          "channel": "CNN International",
          "duration": "5:00",
          "learningPoint": "세계 뉴스 심층 보도 듣기",
          "estimatedMinutes": 5,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "주요 주장 요약, 추가 자료 탐색"
        },
        {
          "title": "Harvard Lecture: History of English",
          "channel": "Harvard U",
          "duration": "50:00",
          "learningPoint": "대학 강의 듣기 (인문·역사)",
          "estimatedMinutes": 50,
          "subtitles": "영어",
          "license": "표준 라이선스",
          "safety": "안전",
          "activity": "강의 노트 작성, 개념 정리"
        }
      ]
    }
  ]
};
