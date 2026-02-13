import React from "react";
import { ChevronLeft, ChevronRight, Gauge, Repeat } from "lucide-react";
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
    youtubeScriptUrl,
    loopEnabled,
    shouldShowTranscriptGuide,
    showTranscriptGuide,
    subtitleDisplayMode,
    translationVisible,
    requestAutoplay,
    embedDisabled,
    chooseCaptionsStatus,
    dismissTranscriptGuide,
    reopenTranscriptGuide,
    setEmbedDisabled,
    setSubtitleDisplayMode,
    setTranslationVisible,
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
        <div className="rounded-[var(--radius-sm)] bg-warning/12 p-3 text-xs">
          임베드 재생이 제한될 수 있습니다. 그래도 구간/텍스트 저장과 SRS 생성은 계속 가능합니다.
        </div>
      )}

      <section className="learning-card space-y-3">
        {clip.captionsAvailable === "unknown" && (
          <div className="rounded-[var(--radius-sm)] bg-secondary/70 p-3">
            <p className="text-sm font-medium">이 영상의 자막 상태를 선택하세요</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void chooseCaptionsStatus(true)}>
                자막 있음
              </Button>
              <Button size="sm" variant="outline" onClick={() => void chooseCaptionsStatus(false)}>
                자막 없음
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">자막 설정 / 스크립트 붙여넣기</p>
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-secondary p-1">
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "none" ? "default" : "ghost"}
              onClick={() => setSubtitleDisplayMode("none")}
              className="h-8 rounded-full px-3"
            >
              무자막
            </Button>
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "subtitle" ? "default" : "ghost"}
              onClick={() => setSubtitleDisplayMode("subtitle")}
              className="h-8 rounded-full px-3"
            >
              자막
            </Button>
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "slash" ? "default" : "ghost"}
              onClick={() => setSubtitleDisplayMode("slash")}
              className="h-8 rounded-full px-3"
            >
              의미단위(/)
            </Button>
          </div>

          <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
            번역
            <Switch checked={translationVisible} onCheckedChange={setTranslationVisible} />
          </label>
        </div>
      </section>

      <section className="learning-card space-y-3">
        <Stepper steps={learningSteps} currentStep="B" completedSteps={completedSteps} />

        <div className="learning-controlbar">
          <div className="learning-soft-pill text-xs">
            <span className="font-medium">AB</span>
            <span className="text-muted-foreground">
              {formatTime(startSec)} - {formatTime(effectiveEndSec)}
            </span>
          </div>

          <div className="learning-soft-pill text-xs text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />
            속도는 YouTube 컨트롤 사용
          </div>

          <label className="learning-soft-pill text-xs">
            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
            반복
            <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
          </label>

          <div className="inline-flex rounded-full bg-secondary p-1">
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
