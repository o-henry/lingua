import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClips, saveClip } from "@/lib/storage";
import { extractVideoId, getThumbnailUrl } from "@/lib/youtube";
import { Clip } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { deleteClip } from "@/lib/storage";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [url, setUrl] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setClips(getClips());
  }, []);

  const handleAdd = () => {
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      toast.error("유효한 유튜브 URL을 입력해주세요");
      return;
    }

    if (clips.some((c) => c.videoId === videoId)) {
      toast.error("이미 추가된 클립입니다");
      return;
    }

    const newClip: Clip = {
      id: `clip_${Date.now()}`,
      youtubeUrl: url.trim(),
      videoId,
      title: `YouTube 클립 (${videoId})`,
      channel: "로딩 중...",
      durationSec: 120,
      level: "beginner",
      tags: [],
      sentences: [],
      addedAt: new Date().toISOString(),
      embeddable: true,
    };

    saveClip(newClip);
    setClips([...clips, newClip]);
    setUrl("");
    setShowInput(false);
    toast.success("클립이 추가되었습니다");
  };

  const handleDelete = (id: string) => {
    deleteClip(id);
    setClips(clips.filter((c) => c.id !== id));
    toast.success("클립이 삭제되었습니다");
  };

  return (
    <>
      <PageShell
        title="라이브러리"
        rightAction={
          <Button size="sm" variant="ghost" onClick={() => setShowInput(!showInput)}>
            <Plus className="w-5 h-5" />
          </Button>
        }
      >
        {showInput && (
          <div className="bg-card rounded-xl border p-4 mb-4 animate-slide-up">
            <label className="text-sm font-medium mb-2 block">유튜브 URL 추가</label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button className="gradient-primary text-primary-foreground" onClick={handleAdd}>
                추가
              </Button>
            </div>
          </div>
        )}

        {clips.length === 0 ? (
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
            {clips.map((clip) => (
              <div key={clip.id} className="bg-card rounded-xl border overflow-hidden flex">
                <img
                  src={getThumbnailUrl(clip.videoId)}
                  alt={clip.title}
                  className="w-28 h-20 object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/learn/${clip.id}`)}
                />
                <div className="flex-1 p-3 min-w-0">
                  <h3
                    className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/learn/${clip.id}`)}
                  >
                    {clip.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {clip.level === "beginner" ? "초급" : clip.level === "intermediate" ? "중급" : "고급"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{clip.channel}</span>
                  </div>
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
                  <button
                    onClick={() => handleDelete(clip.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
      <BottomNav />
    </>
  );
};

export default Library;
