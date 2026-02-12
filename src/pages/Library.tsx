import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClips, saveClip, deleteClip, getStorageStatus } from "@/lib/storage";
import { extractVideoId, fetchYouTubeOEmbed, getThumbnailUrl } from "@/lib/youtube";
import { Clip } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Plus, ExternalLink, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type CaptionsStatus = true | false | "unknown";

const captionBadge = (captionsAvailable: Clip["captionsAvailable"]) => {
  if (captionsAvailable === true) {
    return { label: "자막 있음", className: "bg-success/15 text-success border-success/30" };
  }

  if (captionsAvailable === false) {
    return { label: "자막 없음", className: "bg-destructive/10 text-destructive border-destructive/30" };
  }

  return { label: "자막 미확인", className: "bg-warning/15 text-foreground border-warning/30" };
};

const isTimeModeRecommended = (clip: Clip) => clip.captionsAvailable === false || clip.captionsAvailable === "unknown";

const statusFromValue = (value: string): CaptionsStatus => {
  if (value === "true") return true;
  if (value === "false") return false;
  return "unknown";
};

const statusToValue = (value: CaptionsStatus | undefined) => {
  if (value === true) return "true";
  if (value === false) return "false";
  return "unknown";
};

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [url, setUrl] = useState("");
  const [captionsInput, setCaptionsInput] = useState<CaptionsStatus>("unknown");
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
      captionsAvailable: captionsInput,
      addedAt: new Date().toISOString(),
      embeddable: true,
    };

    try {
      await saveClip(newClip);
      setClips((prev) => [...prev, newClip]);
      setUrl("");
      setCaptionsInput("unknown");
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

  const handleUpdateCaptionStatus = async (clip: Clip, value: CaptionsStatus) => {
    const updated: Clip = { ...clip, captionsAvailable: value };
    await saveClip(updated);
    setClips((prev) => prev.map((item) => (item.id === clip.id ? updated : item)));
  };

  const blockedContent = (
    <div className="bg-card rounded-xl border p-5 text-center mt-4">
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
              <div className="bg-card rounded-xl border p-4 mb-4 animate-slide-up space-y-2">
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

                <div>
                  <label className="text-xs text-muted-foreground">자막 상태</label>
                  <select
                    value={statusToValue(captionsInput)}
                    onChange={(e) => setCaptionsInput(statusFromValue(e.target.value))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="true">자막 있음</option>
                    <option value="false">자막 없음</option>
                    <option value="unknown">자막 미확인</option>
                  </select>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-sm text-muted-foreground">로딩 중...</div>
            ) : clips.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🎬</div>
                <p className="font-medium mb-1">아직 클립이 없어요</p>
                <p className="text-sm text-muted-foreground mb-4">유튜브 URL을 추가해 학습을 시작하세요</p>
                <Button variant="outline" onClick={() => setShowInput(true)}>
                  <Plus className="w-4 h-4 mr-1" /> 클립 추가
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {clips.map((clip) => {
                  const caption = captionBadge(clip.captionsAvailable);
                  const timeMode = isTimeModeRecommended(clip);
                  const learnHref = `/learn/${clip.id}${clip.captionsAvailable === true ? "?mode=subtitle" : timeMode ? "?mode=time" : ""}`;

                  return (
                    <div key={clip.id} className="bg-card rounded-xl border overflow-hidden">
                      <div className="flex">
                        <img
                          src={getThumbnailUrl(clip.videoId)}
                          alt={clip.title || clip.videoId}
                          className="w-28 h-20 object-cover flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(learnHref)}
                        />

                        <div className="flex-1 p-3 min-w-0">
                          <h3
                            className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(learnHref)}
                          >
                            {clip.title || `YouTube 클립 (${clip.videoId})`}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge className={`text-[10px] border ${caption.className}`}>{caption.label}</Badge>
                            <span className="text-[10px] text-muted-foreground">{clip.channel || "메타데이터 없음"}</span>
                          </div>

                          <select
                            value={statusToValue(clip.captionsAvailable)}
                            onChange={(e) => handleUpdateCaptionStatus(clip, statusFromValue(e.target.value))}
                            className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="true">자막 있음</option>
                            <option value="false">자막 없음</option>
                            <option value="unknown">자막 미확인</option>
                          </select>
                        </div>

                        <div className="flex flex-col justify-center pr-2 gap-1">
                          <a
                            href={`https://www.youtube.com/watch?v=${clip.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleDelete(clip.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {timeMode && (
                        <div className="border-t px-3 py-2 bg-warning/5">
                          <p className="text-xs font-medium">학습 난이도 매우 높음</p>
                          <p className="text-xs text-muted-foreground">시간 기반으로 구간을 잡고 들은 문장을 적어 학습하세요.</p>
                        </div>
                      )}
                    </div>
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
