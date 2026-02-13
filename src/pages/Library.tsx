import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClips, saveClip, deleteClip, getStorageStatus } from "@/lib/storage";
import { extractVideoId, fetchYouTubeOEmbed } from "@/lib/youtube";
import { Clip } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Plus, ExternalLink, Trash2, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [url, setUrl] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);

  const loadLibrary = async () => {
    setLoading(true);
    const [status, list] = await Promise.all([getStorageStatus(), getClips()]);
    setMigrationRequired(status.migrationRequired);
    setClips(list);
    setLoading(false);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleAdd = async () => {
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      toast.error("유효한 유튜브 URL을 입력해주세요");
      return;
    }

    if (clips.some((c) => c.videoId === videoId)) {
      toast.error("이미 추가된 클립입니다");
      return;
    }

    const meta = await fetchYouTubeOEmbed(url.trim());

    const newClip: Clip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      youtubeUrl: url.trim(),
      videoId,
      title: meta?.title || `YouTube 클립 (${videoId})`,
      channel: meta?.channel,
      level: "beginner",
      captionsAvailable: true,
      addedAt: new Date().toISOString(),
      embeddable: true,
    };

    try {
      await saveClip(newClip);
      setClips((prev) => [...prev, newClip]);
      setUrl("");
      setShowInput(false);
      toast.success("클립이 추가되었습니다");
    } catch (error) {
      console.error(error);
      toast.error("클립 저장에 실패했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteClip(id);
    setClips((prev) => prev.filter((c) => c.id !== id));
    toast.success("클립이 삭제되었습니다");
  };

  const blockedContent = (
    <div className="ui-island p-5 text-center mt-4">
      <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
      <p className="font-medium">로컬 데이터 초기화가 필요합니다</p>
      <p className="text-sm text-muted-foreground mt-1">구버전 데이터가 감지되어 라이브러리를 잠시 사용할 수 없습니다.</p>
      <Button className="mt-4" onClick={() => navigate("/settings")}>설정에서 초기화하기</Button>
    </div>
  );

  return (
    <>
      <PageShell
        title="라이브러리"
        rightAction={
          !migrationRequired ? (
            <Button size="sm" variant="ghost" onClick={() => setShowInput(!showInput)}>
              <Plus className="w-5 h-5" />
            </Button>
          ) : undefined
        }
      >
        {migrationRequired ? (
          blockedContent
        ) : (
          <>
            {showInput && (
              <div className="ui-island p-4 mb-4 animate-slide-up space-y-2">
                <label className="text-sm font-medium block">유튜브 URL 추가</label>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                  <Button onClick={handleAdd}>추가</Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-sm text-muted-foreground">로딩 중...</div>
            ) : clips.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-medium mb-1">아직 클립이 없어요</p>
                <p className="text-sm text-muted-foreground mb-4">유튜브 URL을 추가해 학습을 시작하세요</p>
                <Button variant="outline" onClick={() => setShowInput(true)}>
                  <Plus className="w-4 h-4 mr-1" /> 클립 추가
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {clips.map((clip) => {
                  const learnHref = `/learn/${clip.id}?mode=subtitle`;

                  return (
                    <article key={clip.id} className="ui-island overflow-hidden">
                      <div className="relative h-28 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/65">
                        <div className="absolute -left-6 -top-8 h-20 w-20 rounded-full bg-white/25 blur-lg" />
                        <div className="absolute right-5 top-4 h-12 w-12 rounded-xl bg-white/20" />
                        <div className="absolute bottom-3 left-3 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                          CAPTIONS READY
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{clip.title || `YouTube 클립 (${clip.videoId})`}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{clip.channel || "채널 정보 없음"}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground hover:text-foreground"
                              onClick={() => void navigate(learnHref)}
                              aria-label="학습 바로가기"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                            <a
                              href={`https://www.youtube.com/watch?v=${clip.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground hover:text-foreground"
                              aria-label="유튜브 바로가기"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground hover:text-destructive"
                              onClick={() => void handleDelete(clip.id)}
                              aria-label="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </PageShell>
      <BottomNav />
    </>
  );
};

export default Library;
