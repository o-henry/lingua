import React from "react";
import { AlertTriangle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import TranscriptEditor from "@/components/learn/TranscriptPanel";
import { useLearnState } from "@/pages/learn/LearnStateContext";
import { formatTime } from "@/domain/time";

const TranscriptPanel: React.FC = () => {
  const {
    clip,
    youtubeScriptUrl,
    persistTranscript,
    transcriptLines,
    selectedTranscriptText,
    subtitleDisplayMode,
    translationVisible,
    segmentMode,
    loopEnabled,
    startSec,
    effectiveEndSec,
    startInputRaw,
    endInputRaw,
    shouldShowTranscriptGuide,
    showTranscriptGuide,
    showTranscriptPanel,
    setTranscriptLinesWithCache,
    setSelectedTranscriptText,
    setSubtitleDisplayMode,
    setTranslationVisible,
    setStartInputRaw,
    setEndInputRaw,
    setSegmentMode,
    handleStartBlur,
    handleStartFocus,
    handleEndBlur,
    handleEndFocus,
    nudgeStart,
    nudgeEnd,
    handleLoopToggle,
    chooseCaptionsStatus,
    dismissTranscriptGuide,
    reopenTranscriptGuide,
    activateTranscriptLine,
    activateTranscriptRange,
    addSelectedTranscriptToHeardSentence,
  } = useLearnState();

  if (!clip) return null;

  return (
    <div className="space-y-3">
      {clip.captionsAvailable === "unknown" && (
        <section className="learning-card space-y-2">
          <p className="text-sm font-medium">이 영상의 자막 상태를 선택하세요</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void chooseCaptionsStatus(true)}>
              자막 있음
            </Button>
            <Button size="sm" variant="outline" onClick={() => void chooseCaptionsStatus(false)}>
              자막 없음
            </Button>
          </div>
        </section>
      )}

      <section className="learning-card border-primary/35 bg-primary/5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">유튜브 스크립트 복사해서 붙여넣기</p>
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={youtubeScriptUrl} target="_blank" rel="noopener noreferrer">
              YouTube에서 스크립트 열기
            </a>
          </Button>
        </div>

        {showTranscriptGuide ? (
          <div className="rounded-lg border bg-card p-3">
            <ol className="space-y-1 text-xs text-muted-foreground">
              <li>1. YouTube에서 영상 아래 '더보기'를 열어요.</li>
              <li>2. '스크립트 표시(Show transcript)'를 눌러요.</li>
              <li>3. 필요한 구간을 복사(Ctrl/Cmd+C) 후 여기 붙여넣기(Ctrl/Cmd+V)</li>
            </ol>
            <p className="mt-2 text-[11px] text-muted-foreground">타임코드가 있으면 줄 클릭/SHIFT 선택으로 구간이 자동 설정돼요.</p>
            <div className="mt-2 flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={dismissTranscriptGuide}>
                닫기
              </Button>
            </div>
          </div>
        ) : (
          shouldShowTranscriptGuide && (
            <Button type="button" size="sm" variant="ghost" onClick={reopenTranscriptGuide}>
              안내 다시 보기
            </Button>
          )
        )}
      </section>

      {showTranscriptPanel && (
        <section className="learning-card space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "none" ? "default" : "outline"}
              onClick={() => setSubtitleDisplayMode("none")}
            >
              무자막
            </Button>
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "subtitle" ? "default" : "outline"}
              onClick={() => setSubtitleDisplayMode("subtitle")}
            >
              자막
            </Button>
            <Button
              type="button"
              size="sm"
              variant={subtitleDisplayMode === "slash" ? "default" : "outline"}
              onClick={() => setSubtitleDisplayMode("slash")}
            >
              의미단위(/)
            </Button>
            <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
              번역
              <Switch checked={translationVisible} onCheckedChange={setTranslationVisible} />
            </label>
          </div>

          {translationVisible && (
            <p className="text-[11px] text-muted-foreground">사용자 제공 자막은 번역 데이터가 없을 수 있어요. 필요한 경우 AI 질문하기를 사용하세요.</p>
          )}

          <TranscriptEditor
            lines={transcriptLines}
            persistEnabled={persistTranscript}
            onLinesChange={setTranscriptLinesWithCache}
            onSelectionChange={setSelectedTranscriptText}
            displayMode={subtitleDisplayMode}
            onLineActivate={activateTranscriptLine}
            onRangeActivate={activateTranscriptRange}
          />

          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">선택 텍스트</p>
              <Button type="button" size="sm" variant="outline" disabled={!selectedTranscriptText} onClick={addSelectedTranscriptToHeardSentence}>
                복습 텍스트로 추가
              </Button>
            </div>
            <p className="text-xs text-muted-foreground break-words">{selectedTranscriptText || "아직 선택된 텍스트가 없습니다."}</p>
          </div>
        </section>
      )}

      <section className="learning-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">구간 선택</h3>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={segmentMode === "subtitle" ? "default" : "outline"} onClick={() => setSegmentMode("subtitle")}>
              자막 모드
            </Button>
            <Button type="button" size="sm" variant={segmentMode === "time" ? "default" : "outline"} onClick={() => setSegmentMode("time")}>
              시간 모드
            </Button>
          </div>
        </div>

        {segmentMode === "subtitle" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-2">
              <div className="flex items-center gap-2 text-sm">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <span>구간 반복</span>
              </div>
              <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
            </div>

            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-xs font-medium">시간 미세 조정 (보조)</summary>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={startInputRaw}
                  placeholder="mm:ss"
                  onFocus={handleStartFocus}
                  onChange={(event) => setStartInputRaw(event.target.value)}
                  onBlur={handleStartBlur}
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={endInputRaw}
                  placeholder="mm:ss"
                  onFocus={handleEndFocus}
                  onChange={(event) => setEndInputRaw(event.target.value)}
                  onBlur={handleEndBlur}
                />
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">시작 (mm:ss)</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={startInputRaw}
                  placeholder="mm:ss"
                  onFocus={handleStartFocus}
                  onChange={(event) => setStartInputRaw(event.target.value)}
                  onBlur={handleStartBlur}
                />
                <div className="mt-1 flex gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeStart(-5)}>
                    -5s
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeStart(5)}>
                    +5s
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">끝 (mm:ss)</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={endInputRaw}
                  placeholder="mm:ss"
                  onFocus={handleEndFocus}
                  onChange={(event) => setEndInputRaw(event.target.value)}
                  onBlur={handleEndBlur}
                />
                <div className="mt-1 flex gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeEnd(-5)}>
                    -5s
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeEnd(5)}>
                    +5s
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-2">
              <div className="flex items-center gap-2 text-sm">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <span>구간 반복</span>
              </div>
              <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
            </div>
          </div>
        )}
      </section>

      <section className="learning-card">
        <p className="text-xs text-muted-foreground">현재 학습 포인트</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border px-3 py-1">현재 구간: {formatTime(startSec)} - {formatTime(effectiveEndSec)}</span>
          <span className="rounded-full border px-3 py-1">선택 모드: {segmentMode === "subtitle" ? "자막" : "시간"}</span>
          <span className="rounded-full border px-3 py-1">자막 줄 수: {transcriptLines.length}</span>
        </div>
        {clip.captionsAvailable === false && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-2 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
            <p>자막 없음 영상이라 시간 모드 중심 학습이 권장됩니다.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default TranscriptPanel;
