import React from "react";
import { ChevronLeft, ChevronRight, Repeat2 } from "lucide-react";
import { formatTime } from "@/domain/time";
import YouTubePlayer from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLearnState } from "@/pages/learn/LearnStateContext";

const VideoStage: React.FC = () => {
  const {
    clip,
    startSec,
    endSec,
    effectiveEndSec,
    youtubeScriptUrl,
    transcriptLines,
    loopEnabled,
    shouldShowTranscriptGuide,
    showTranscriptGuide,
    requestAutoplay,
    embedDisabled,
    dismissTranscriptGuide,
    reopenTranscriptGuide,
    setEmbedDisabled,
    handleLoopToggle,
    jumpToPrevSegment,
    jumpToNextSegment,
  } = useLearnState();

  if (!clip) return null;

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
        <div className="rounded-[var(--radius-sm)] bg-warning/12 p-3 text-xs">
          임베드 재생이 제한될 수 있습니다. 그래도 구간/텍스트 저장과 SRS 생성은 계속 가능합니다.
        </div>
      )}

      {transcriptLines.length === 0 && (
        <section className="learning-card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">자막 스크립트 붙여넣기</p>
            <Button type="button" size="sm" variant="outline" asChild>
              <a href={youtubeScriptUrl} target="_blank" rel="noopener noreferrer">
                YouTube에서 스크립트 열기
              </a>
            </Button>
          </div>

          {showTranscriptGuide ? (
            <div className="rounded-[var(--radius-sm)] bg-secondary/70 p-3">
              <ol className="space-y-1 text-xs text-muted-foreground">
                <li>1. YouTube에서 영상 아래 더보기를 열고 스크립트를 표시합니다.</li>
                <li>2. 필요한 구간을 복사(Ctrl/Cmd+C)한 뒤 이 앱에 붙여넣습니다.</li>
                <li>3. 타임코드가 있으면 줄 클릭과 Shift 선택으로 구간이 자동 설정됩니다.</li>
              </ol>
              <div className="mt-2 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={dismissTranscriptGuide}>
                  닫기
                </Button>
              </div>
            </div>
          ) : (
            shouldShowTranscriptGuide && (
              <Button type="button" size="sm" variant="ghost" onClick={reopenTranscriptGuide} className="w-fit px-2">
                안내 다시 보기
              </Button>
            )
          )}
        </section>
      )}

      <section className="learning-card space-y-3">
        <div className="learning-controlbar">
          <div className="learning-soft-pill text-xs">
            <span className="font-medium">AB</span>
            <span className="text-muted-foreground">
              {formatTime(startSec)} - {formatTime(effectiveEndSec)}
            </span>
          </div>

          <label className="learning-soft-pill text-xs">
            <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" />
            반복
            <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
          </label>

          <div className="inline-flex rounded-[var(--radius-lg)] bg-secondary p-1">
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={jumpToPrevSegment}>
              <ChevronLeft className="h-3.5 w-3.5" /> 이전
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={jumpToNextSegment}>
              다음 <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoStage;
