import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getClips, getDueCards, getSettings, getStreak, getTotalStudyMinutes } from "@/lib/storage";
import { STEP_INFO, LearningStep } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Flame, Clock, Layers } from "lucide-react";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState(getClips());
  const [dueCount, setDueCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const settings = getSettings();

  useEffect(() => {
    setClips(getClips());
    setDueCount(getDueCards().length);
    setStreak(getStreak());
    setTotalMinutes(getTotalStudyMinutes());
  }, []);

  const todayClip = clips[0];

  return (
    <>
      <PageShell title="LingoPlay">
        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl p-3 text-center border">
            <Flame className="w-5 h-5 mx-auto mb-1 text-streak" />
            <div className="text-lg font-bold">{streak}</div>
            <div className="text-[10px] text-muted-foreground">일 연속</div>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{totalMinutes}</div>
            <div className="text-[10px] text-muted-foreground">총 학습(분)</div>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border">
            <Layers className="w-5 h-5 mx-auto mb-1 text-accent" />
            <div className="text-lg font-bold">{dueCount}</div>
            <div className="text-[10px] text-muted-foreground">복습 카드</div>
          </div>
        </div>

        {/* SRS CTA */}
        {dueCount > 0 && (
          <button
            onClick={() => navigate("/srs")}
            className="w-full mb-6 p-4 rounded-xl gradient-accent text-accent-foreground flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm">복습할 카드 {dueCount}개</div>
              <div className="text-xs opacity-80">지금 복습하기 →</div>
            </div>
            <Layers className="w-8 h-8 opacity-60" />
          </button>
        )}

        {/* Today's Routine */}
        <h2 className="text-lg font-bold mb-3">오늘의 학습</h2>
        {todayClip ? (
          <div className="bg-card rounded-xl border overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${todayClip.videoId}/mqdefault.jpg`}
              alt={todayClip.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold mb-1 line-clamp-2">{todayClip.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{todayClip.channel}</p>

              {/* Steps */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {(["A", "B", "C", "D"] as LearningStep[]).map((step) => (
                  <div key={step} className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg">{STEP_INFO[step].icon}</div>
                    <div className="text-[10px] font-medium text-muted-foreground">{STEP_INFO[step].label}</div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full gradient-primary text-primary-foreground h-11"
                onClick={() => navigate(`/learn/${todayClip.id}`)}
              >
                학습 시작하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl border p-8 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-medium mb-1">클립을 추가해보세요</p>
            <p className="text-sm text-muted-foreground mb-4">유튜브 클립을 추가하고 학습을 시작하세요</p>
            <Button variant="outline" onClick={() => navigate("/library")}>
              라이브러리로 이동
            </Button>
          </div>
        )}
      </PageShell>
      <BottomNav />
    </>
  );
};

export default HomePage;
