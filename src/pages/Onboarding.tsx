import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/lib/storage";

const slides = [
  {
    icon: "🔁",
    title: "짧은 클립으로 반복 학습",
    description: "1~3분 유튜브 클립을 구간 반복하며\n자연스러운 표현을 익혀요",
  },
  {
    icon: "🎙️",
    title: "섀도잉 & 녹음 비교",
    description: "원어민 발음을 따라 말하고\n내 녹음과 비교해 교정해요",
  },
  {
    icon: "🧠",
    title: "인출 연습 & SRS 복습",
    description: "기억을 꺼내는 훈련과\n간격 반복으로 장기 기억을 만들어요",
  },
];

const Onboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleStart = () => {
    updateSettings({ onboardingComplete: true });
    navigate("/setup");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-7xl mb-8">{slides[current].icon}</div>
            <h2 className="text-2xl font-bold mb-3">{slides[current].title}</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-10 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {current < slides.length - 1 ? (
            <Button className="w-full gradient-primary text-primary-foreground h-12" onClick={() => setCurrent(current + 1)}>
              다음
            </Button>
          ) : (
            <Button className="w-full gradient-primary text-primary-foreground h-12" onClick={handleStart}>
              시작하기
            </Button>
          )}
          {current < slides.length - 1 && (
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleStart}>
              건너뛰기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
