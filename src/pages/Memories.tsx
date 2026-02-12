import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClips, getMemoryItems, getStorageStatus } from "@/lib/storage";
import { Clip, MemoryItem } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
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
    <div className="bg-card rounded-xl border p-5 text-center mt-4">
      <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
      <p className="font-medium">로컬 데이터 초기화가 필요합니다</p>
      <p className="text-sm text-muted-foreground mt-1">구버전 데이터가 감지되어 저장 메모를 표시할 수 없습니다.</p>
      <Button className="mt-4" onClick={() => navigate("/settings")}>설정에서 초기화하기</Button>
    </div>
  );

  return (
    <>
      <PageShell title="메모 리스트">
        {migrationRequired ? (
          blockedContent
        ) : loading ? (
          <div className="text-center py-16 text-sm text-muted-foreground">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="font-medium">저장된 메모가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">학습 화면에서 문장을 저장하면 여기에 모아 보여줍니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/library")}>
              라이브러리로 이동
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const clip = clipMap.get(item.ref.clipId);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-xl border bg-card p-3 text-left hover:border-primary/40 transition-colors"
                  onClick={() =>
                    navigate(`/learn/${item.ref.clipId}?start=${item.ref.startSec}&end=${item.ref.endSec}&mode=subtitle`)
                  }
                >
                  <p className="text-sm font-medium line-clamp-2">{item.userText || item.notes || "(텍스트 없음)"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(item.ref.startSec)} - {formatTime(item.ref.endSec)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{clip?.title || `클립 ${item.ref.videoId}`}</p>
                </button>
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
