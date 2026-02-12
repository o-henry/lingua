import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/lib/storage";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "🇺🇸 English" },
  { code: "jp", label: "🇯🇵 日本語" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
];

const GOALS = [
  { id: "comprehension", label: "원어민 대화 이해", icon: "👂" },
  { id: "conversation", label: "실전 대화 능력", icon: "💬" },
  { id: "accent", label: "발음 교정", icon: "🗣️" },
];

const TIMES = [10, 20, 30];

const MODES = [
  { id: "beginner" as const, label: "초급", desc: "대본 중심 학습", icon: "📝" },
  { id: "intermediate" as const, label: "중급", desc: "섀도잉 중심", icon: "🎙️" },
  { id: "advanced" as const, label: "고급", desc: "인출 중심", icon: "🧠" },
];

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState("en");
  const [goal, setGoal] = useState("conversation");
  const [minutes, setMinutes] = useState(20);
  const [mode, setMode] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const handleComplete = () => {
    updateSettings({
      targetLanguage: lang,
      goal,
      dailyMinutes: minutes,
      mode,
      setupComplete: true,
    });
    navigate("/home");
  };

  const steps = [
    // Step 0: Language
    <div key="lang" className="space-y-4">
      <h2 className="text-2xl font-bold">어떤 언어를 배울까요?</h2>
      <div className="grid grid-cols-1 gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={cn(
              "px-4 py-3 rounded-xl text-left font-medium transition-all border-2",
              lang === l.code ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>,
    // Step 1: Goal
    <div key="goal" className="space-y-4">
      <h2 className="text-2xl font-bold">학습 목표는?</h2>
      <div className="grid grid-cols-1 gap-2">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g.id)}
            className={cn(
              "px-4 py-3 rounded-xl text-left font-medium transition-all border-2 flex items-center gap-3",
              goal === g.id ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}
          >
            <span className="text-2xl">{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>
    </div>,
    // Step 2: Time
    <div key="time" className="space-y-4">
      <h2 className="text-2xl font-bold">하루 학습 시간</h2>
      <div className="grid grid-cols-3 gap-3">
        {TIMES.map((t) => (
          <button
            key={t}
            onClick={() => setMinutes(t)}
            className={cn(
              "py-4 rounded-xl font-bold text-lg transition-all border-2",
              minutes === t ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-muted text-muted-foreground"
            )}
          >
            {t}분
          </button>
        ))}
      </div>
    </div>,
    // Step 3: Mode
    <div key="mode" className="space-y-4">
      <h2 className="text-2xl font-bold">학습 모드</h2>
      <div className="grid grid-cols-1 gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "px-4 py-3 rounded-xl text-left transition-all border-2 flex items-center gap-3",
              mode === m.id ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}
          >
            <span className="text-2xl">{m.icon}</span>
            <div>
              <div className="font-semibold">{m.label}</div>
              <div className="text-xs text-muted-foreground">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12 max-w-sm mx-auto">
      {/* Progress */}
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
