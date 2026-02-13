import React from "react";
import { ChevronLeft, ChevronRight, Gauge, Repeat, Subtitles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "@/domain/time";
import Stepper from "@/components/Stepper";
import YouTubePlayer from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLearnState } from "@/pages/learn/LearnStateContext";
import { LearningStep } from "@/lib/types";

const learningSteps: LearningStep[] = ["B", "C"];
const completedSteps: LearningStep[] = [];

const VideoStage: React.FC = () => {
  const navigate = useNavigate();
  const {
    clip,
    startSec,
    endSec,
    effectiveEndSec,
    loopEnabled,
    subtitleDisplayMode,
    requestAutoplay,
    embedDisabled,
    setEmbedDisabled,
    setSubtitleDisplayMode,
    handleLoopToggle,
    jumpToPrevSegment,
    jumpToNextSegment,
    getShadowingTextSeed,
  } = useLearnState();

  if (!clip) return null;

  const goToShadowing = () => {
    const textSeed = getShadowingTextSeed();
    const params = new URLSearchParams({
      start: String(startSec),
      end: String(effectiveEndSec),
      ...(textSeed ? { text: textSeed } : {}),
    });
    navigate(`/shadowing/${clip.id}?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <section className="learning-video-card">
        <YouTubePlayer
          videoId={clip.videoId}
          startSec={startSec}
          endSec={endSec ?? undefined}
          loop={loopEnabled && endSec !== null}
          autoplay={requestAutoplay}
          onEmbedError={() => setEmbedDisabled(true)}
        />
      </section>

      {embedDisabled && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
          임베드 재생이 제한될 수 있습니다. 그래도 구간/텍스트 저장과 SRS 생성은 계속 가능합니다.
        </div>
      )}

      <section className="learning-card space-y-3">
        <Stepper steps={learningSteps} currentStep="B" completedSteps={completedSteps} />

        <div className="learning-controlbar">
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
            <span className="font-medium">AB</span>
            <span className="text-muted-foreground">
              {formatTime(startSec)} - {formatTime(effectiveEndSec)}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />
            속도는 YouTube 컨트롤 사용
          </div>

          <div className="flex items-center gap-1 rounded-md border p-1">
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "none" ? "default" : "ghost"}
              onClick={() => setSubtitleDisplayMode("none")}
              className="h-7 px-2"
            >
              무자막
            </Button>
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "subtitle" ? "default" : "ghost"}
              onClick={() => setSubtitleDisplayMode("subtitle")}
              className="h-7 px-2"
            >
              <Subtitles className="h-3.5 w-3.5" />
              자막
            </Button>
          </div>

          <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
            반복
            <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
          </label>

          <div className="flex items-center gap-1 rounded-md border p-1">
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={jumpToPrevSegment}>
              <ChevronLeft className="h-3.5 w-3.5" /> 이전
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={jumpToNextSegment}>
              다음 <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="learning-card flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">다음 단계(C): 듣고 따라 말하기</p>
          <p className="text-xs text-muted-foreground">녹음/원음 비교/체크리스트/발음 교정 질문은 C단계에서 진행합니다.</p>
        </div>
        <Button onClick={goToShadowing}>C단계로 이동</Button>
      </section>
    </div>
  );
};

export default VideoStage;
