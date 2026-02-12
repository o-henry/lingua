import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClipById } from "@/lib/storage";
import { Clip } from "@/lib/types";
import YouTubePlayer from "@/components/YouTubePlayer";
import AudioRecorder from "@/components/AudioRecorder";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight } from "lucide-react";

const CHECKLIST = [
  { id: "pronunciation", label: "발음 타깃 1개 확인" },
  { id: "stress", label: "강세와 리듬 맞추기" },
  { id: "linking", label: "연결발음 확인" },
];

const Shadowing: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const [clip, setClip] = useState<Clip | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (clipId) setClip(getClipById(clipId) || null);
  }, [clipId]);

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  if (!clip) {
    return (
      <PageShell title="섀도잉" showBack onBack={() => navigate(-1)} noBottomNav>
        <p className="text-center py-16 text-muted-foreground">클립을 찾을 수 없습니다</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="섀도잉" showBack onBack={() => navigate(-1)} noBottomNav>
      <YouTubePlayer videoId={clip.videoId} />

      <div className="mt-6">
        <h3 className="font-semibold mb-4 text-center">따라 말해보세요</h3>
        <AudioRecorder />
      </div>

      {/* Checklist */}
      <div className="bg-card rounded-xl border p-4 mt-6 space-y-3">
        <h4 className="font-semibold text-sm">체크리스트</h4>
        {CHECKLIST.map((item) => (
          <label key={item.id} className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={checked.has(item.id)}
              onCheckedChange={() => toggleCheck(item.id)}
            />
            <span className="text-sm">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 mt-6 mb-4">
        <Button variant="outline" className="flex-1" onClick={() => navigate(`/learn/${clipId}`)}>
          다시 학습
        </Button>
        <Button
          className="flex-1 gradient-primary text-primary-foreground"
          onClick={() => navigate(`/recall/${clipId}`)}
        >
          인출로 <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </PageShell>
  );
};

export default Shadowing;
