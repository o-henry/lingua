import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getClips, getDueCards, getSettings } from "@/lib/storage";
import { Clip } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Layers } from "lucide-react";

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
      <PageShell title="Orbit">
        <button
          onClick={() => navigate("/srs")}
          className="w-full text-start mb-6 p-4 rounded-xl gradient-accent text-accent-foreground flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-sm">복습할 카드 {dueCount}개</div>
            <div className="text-xs opacity-80">{dueCount > 0 ? "지금 복습하기 →" : "아직 복습할 카드가 없습니다"}</div>
          </div>
          {/* <Layers className="w-8 h-8 opacity-60" /> */}
        </button>

        <h2 className="text-lg font-bold mb-3">오늘의 학습</h2>
        {todayClip ? (
          <div className="bg-card rounded-3xl overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${todayClip.videoId}/mqdefault.jpg`}
              alt={todayClip.title || todayClip.videoId}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold mb-1 line-clamp-2">{todayClip.title || `YouTube 클립 (${todayClip.videoId})`}</h3>
              <p className="text-xs text-muted-foreground mb-3">{todayClip.channel || settings.targetLanguage.toUpperCase()}</p>

              <div className="rounded-lg bg-muted p-3 mb-4">
                <p className="text-xs text-muted-foreground">
                  구간 반복 → 자막/내 텍스트 입력 → SRS 복습 흐름으로 학습합니다.
                </p>
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
