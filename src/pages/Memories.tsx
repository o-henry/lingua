import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClips, getMemoryItems, getStorageStatus } from "@/lib/storage";
import { Clip, MemoryItem } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronRight, CircleAlert } from "lucide-react";
import { formatTime } from "@/domain/time";

const MemoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [clipMap, setClipMap] = useState<Map<string, Clip>>(new Map());
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [status, memoryItems, clips] = await Promise.all([getStorageStatus(), getMemoryItems(), getClips()]);
      setMigrationRequired(status.migrationRequired);
      setItems(memoryItems.sort((a, b) => b.updatedAt - a.updatedAt));
      setClipMap(new Map(clips.map((clip) => [clip.id, clip])));
      setLoading(false);
    };

    load();
  }, []);

  const blockedContent = (
    <div className="bg-card rounded-[var(--radius-lg)] border p-5 text-center mt-4">
      <CircleAlert className="w-8 h-8 text-warning mx-auto mb-2" />
      <p className="font-medium">로컬 데이터 초기화가 필요합니다</p>
      <p className="text-sm text-muted-foreground mt-1">구버전 데이터가 감지되어 저장 표현을 표시할 수 없습니다.</p>
      <Button className="mt-4" onClick={() => navigate("/settings")}>설정에서 초기화하기</Button>
    </div>
  );

  return (
    <>
      <PageShell title="표현 모음">
        {migrationRequired ? (
          blockedContent
        ) : loading ? (
          <div className="text-center py-16 text-sm text-muted-foreground">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="ui-island p-8 text-center">
            <p className="font-medium">저장된 표현이 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">학습 화면에서 저장한 표현이 여기에 모입니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/library")}>
              라이브러리로 이동
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const clip = clipMap.get(item.ref.clipId);
              const cardIndex = idx + 1;
              const learnHref = `/learn/${item.ref.clipId}?start=${item.ref.startSec}&end=${item.ref.endSec}&mode=subtitle`;

              return (
                <article key={item.id} className="ui-island overflow-hidden rounded-[16px] border border-border/80 bg-card p-3 shadow-[0_10px_26px_-18px_rgba(8,11,20,0.36)]">
                  <div className="p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-border/85 bg-secondary text-[11px] font-semibold">
                        MEM
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/85 bg-secondary text-foreground hover:bg-muted"
                          onClick={() => void navigate(learnHref)}
                          aria-label="학습 바로가기"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {clip && (
                          <a
                            href={`https://www.youtube.com/watch?v=${clip.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/85 bg-secondary text-foreground hover:bg-muted"
                            aria-label="유튜브 바로가기"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">{item.userText || item.notes || "(텍스트 없음)"}</p>
                        <p className="mt-2 text-xs font-en text-muted-foreground">
                          {formatTime(item.ref.startSec)} - {formatTime(item.ref.endSec)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{clip?.title || `클립 ${item.ref.videoId}`}</p>
                      </div>
                      <p className="text-[44px] leading-none tracking-tight text-foreground font-ko-bold">{String(cardIndex).padStart(2, "0")}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageShell>
      <BottomNav />
    </>
  );
};

export default MemoriesPage;
