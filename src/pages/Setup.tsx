import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/lib/storage";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "영어 (English)" },
  { code: "ja", label: "일본어 (Japanese)" },
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
              "px-4 py-3 rounded-xl text-left font-medium transition-all border-2",
              targetLanguage === l.code ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}
          >
            {l.label}
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
              "px-4 py-3 rounded-xl text-center font-medium transition-all border-2",
              learnerLevel === level ? "border-primary bg-primary/10" : "border-transparent bg-muted"
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
      <p className="text-xs text-muted-foreground">답변 길이와 설명 수준을 조절할 때만 사용됩니다.</p>
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
              "px-4 py-3 rounded-xl text-center font-medium transition-all border-2",
              userGender === gender ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}
          >
            {gender}
          </button>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
        로컬 데이터는 앱 안의 <span className="font-medium">설정 → 데이터 삭제</span>를 눌렀을 때만 지워집니다.
        <br />
        브라우저에서 사이트 데이터(쿠키/저장공간)를 직접 삭제해도 사라질 수 있습니다.
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10 max-w-xs mx-auto">
      <div className="flex gap-1 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <div className="flex-1">{steps[step]}</div>

      <div className="flex gap-3 mt-8">
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
  );
};

export default Setup;
