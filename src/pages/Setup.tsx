import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/lib/storage";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", nativeLabel: "영어", englishLabel: "English" },
  { code: "ja", nativeLabel: "일본어", englishLabel: "Japanese" },
] as const;

const LEVELS = ["입문", "초급", "중급", "고급"] as const;
const GENDERS = ["남", "여", "기타", "비공개"] as const;

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState<(typeof LANGUAGES)[number]["code"]>("en");
  const [learnerLevel, setLearnerLevel] = useState<(typeof LEVELS)[number]>("초급");
  const [userAge, setUserAge] = useState("20");
  const [userGender, setUserGender] = useState<(typeof GENDERS)[number]>("비공개");

  const normalizedAge = Math.max(1, Math.min(120, Number(userAge) || 20));

  const modeForLevel = learnerLevel === "고급" ? "advanced" : learnerLevel === "중급" ? "intermediate" : "beginner";

  const handleComplete = () => {
    updateSettings({
      targetLanguage,
      learnerLevel,
      userAge: normalizedAge,
      userGender,
      mode: modeForLevel,
      setupComplete: true,
    });
    navigate("/home");
  };

  const selectionButtonBaseClass = "rounded-[4px] border border-border/70 bg-muted/70 px-4 py-3 font-medium transition-all";

  const steps = [
    <div key="lang" className="space-y-4">
      <h2 className="text-2xl font-bold">배우고 싶은 언어</h2>
      <div className="grid grid-cols-1 gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setTargetLanguage(l.code)}
            className={cn(
              `${selectionButtonBaseClass} text-left`,
              targetLanguage === l.code ? "border-primary bg-primary/10 text-foreground" : "hover:bg-muted"
            )}
          >
            <span className="font-ko-bold">{l.nativeLabel}</span>
            <span className="font-en text-[0.95em] text-muted-foreground"> ({l.englishLabel})</span>
          </button>
        ))}
      </div>
    </div>,
    <div key="level" className="space-y-4">
      <h2 className="text-2xl font-bold">현재 수준</h2>
      <div className="grid grid-cols-2 gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setLearnerLevel(level)}
            className={cn(
              `${selectionButtonBaseClass} text-center font-ko-bold`,
              learnerLevel === level ? "border-primary bg-primary/10 text-foreground" : "hover:bg-muted"
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>,
    <div key="age" className="space-y-4">
      <h2 className="text-2xl font-bold">나이</h2>
      <Input
        type="number"
        min={1}
        max={120}
        value={userAge}
        onChange={(e) => setUserAge(e.target.value)}
        placeholder="나이를 입력하세요"
      />
      <p className="text-xs text-muted-foreground">
        나이·성별·학습수준을 함께 반영해 AI가 가벼운 말투/존댓말 같은 화법과 예시 표현을 더 자연스럽게 맞추기 위해 사용합니다.
      </p>
    </div>,
    <div key="gender" className="space-y-4">
      <h2 className="text-2xl font-bold">성별</h2>
      <div className="grid grid-cols-2 gap-2">
        {GENDERS.map((gender) => (
          <button
            key={gender}
            type="button"
            onClick={() => setUserGender(gender)}
            className={cn(
              `${selectionButtonBaseClass} text-center font-ko-bold`,
              userGender === gender ? "border-primary bg-primary/10 text-foreground" : "hover:bg-muted"
            )}
          >
            {gender}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        성별 정보는 언어별 표현 차이를 반영하기 위해 사용합니다. 예를 들어 일본어의 경우
        <span className="font-en"> watashi </span>
        /<span className="font-en"> boku </span>
        같은 1인칭 선택을 AI가 구분해 제안할 수 있습니다.
      </p>
      <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
        로컬 데이터는 앱 안의 <span className="font-medium">설정 → 데이터 삭제</span>를 눌렀을 때만 지워집니다.
        <br />
        브라우저에서 사이트 데이터(쿠키/저장공간)를 직접 삭제해도 사라질 수 있습니다.
      </div>
    </div>,
  ];

  return (
    <div className="holo-view min-h-screen bg-background px-3 pt-3 pb-4">
      <div className="app-screen mx-auto flex min-h-[calc(100vh-1.75rem)] w-full max-w-md flex-col px-6 py-10">
        <div className="mx-auto flex w-full max-w-xs flex-1 flex-col">
          <div className="mb-8 flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
            ))}
          </div>

          <div className="flex-1">{steps[step]}</div>

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                이전
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setStep(step + 1)}>
                다음
              </Button>
            ) : (
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleComplete}>
                완료
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;
