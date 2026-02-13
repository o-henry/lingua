import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getClips, getDueCards, getSettings } from "@/lib/storage";
import { Clip } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const settings = getSettings();

  useEffect(() => {
    const load = async () => {
      const [nextClips, due] = await Promise.all([
        getClips(),
        getDueCards(),
      ]);

      setClips(nextClips);
      setDueCount(due.length);
    };

    load();
  }, []);

  const todayClip = clips[0];

  return (
    <>
      <PageShell>
        <div className="pt-2">
          <button
            onClick={() => navigate("/srs")}
            className="ui-island-strong mb-6 w-full bg-accent text-start text-accent-foreground p-5 min-h-[84px]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-dm">
                <div className="text-base font-medium">Review 카드 {dueCount}개</div>
                <div className="text-xs opacity-85">{dueCount > 0 ? "지금 복습 시작" : "오늘은 복습 카드가 없습니다"}</div>
              </div>
              <span className="ui-chip px-3 py-1 text-[11px] font-dm font-medium text-accent-foreground/90 bg-white/20">Review</span>
            </div>
          </button>

          <h2 className="mb-3 text-lg font-medium font-ko-bold">오늘의 학습</h2>
          {todayClip ? (
            <section className="ui-island-strong overflow-hidden font-ko-bold">
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary to-primary/75 p-5">
                <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-white/35 blur-xl" />
                <div className="absolute right-5 top-4 h-16 w-16 rounded-2xl bg-accent/70" />
                <div className="absolute right-12 bottom-6 h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm" />
                <div className="relative z-10 flex h-full items-end">
                  <div className="text-primary-foreground">
                    <p className="text-xs font-medium tracking-[0.14em] opacity-90">듣고 반복하기</p>
                    <h3 className="mt-2 line-clamp-2 max-w-[220px] text-xl font-medium leading-tight">
                      {todayClip.title || `YouTube Clip (${todayClip.videoId})`}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <p className="text-xs text-muted-foreground font-en">{todayClip.channel || settings.targetLanguage.toUpperCase()}</p>
                <div className="rounded-[var(--radius-sm)] bg-secondary/75 p-3">
                  <p className="text-xs text-muted-foreground">
                    구간 반복, 표현 익히기, AI 질문, SRS 복습 순서로 학습합니다.
                  </p>
                </div>
                <Button className="w-full h-11 font-ko-bold" onClick={() => navigate(`/learn/${todayClip.id}`)}>
                  학습 시작하기
                </Button>
              </div>
            </section>
          ) : (
            <div className="ui-island text-center p-8">
              <p className="font-medium mb-1">첫 클립을 추가해보세요</p>
              <p className="text-sm text-muted-foreground mb-4">유튜브 클립을 추가하면 바로 학습을 시작할 수 있어요.</p>
              <Button variant="outline" onClick={() => navigate("/library")}>
                라이브러리로 이동
              </Button>
            </div>
          )}
        </div>
      </PageShell>
      <BottomNav />
    </>
  );
};

export default HomePage;
