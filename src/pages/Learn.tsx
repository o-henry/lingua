import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getClipById,
  getMemoryByClipId,
  getSrsCardByMemoryId,
  getStorageStatus,
  saveClip,
  saveMemoryItem,
  saveSrsCard,
} from "@/lib/storage";
import { Clip, LearningStep, MemoryItem, SegmentRef } from "@/lib/types";
import { getTodayDateKey } from "@/domain/srsScheduler";
import { normalizeSegmentRef } from "@/domain/refUtils";
import { TranscriptLine } from "@/domain/transcript";
import { formatTime, parseTime } from "@/domain/time";
import { getMetaValue, setMetaValue } from "@/storage/metaRepo";
import YouTubePlayer from "@/components/YouTubePlayer";
import PageShell from "@/components/PageShell";
import Stepper from "@/components/Stepper";
import TranscriptPanel from "@/components/learn/TranscriptPanel";
import ExternalAiAskBar from "@/components/ai/ExternalAiAskBar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, BookmarkPlus, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSCRIPT_GUIDE_DISMISSED_KEY = "dlb:transcript:guide:dismissed";
const transcriptStorageKey = (clipId: string) => `dlb:transcript:${clipId}`;
const transcriptLocalCacheKey = (clipId: string) => `dlb:transcript:cache:${clipId}`;

const MIN_LOOP_SECONDS = 2;
const DEFAULT_SEGMENT_SECONDS = 10;

type SegmentMode = "subtitle" | "time";

function safeRange(startSec: number, endSec: number | null): { startSec: number; endSec: number | null } {
  const start = Math.max(0, Math.floor(startSec));
  let end = endSec === null ? null : Math.floor(endSec);

  if (end !== null && end <= start) {
    end = start + MIN_LOOP_SECONDS;
  }

  return { startSec: start, endSec: end };
}

function resolveEnd(startSec: number, endSec: number | null): number {
  const base = endSec ?? startSec + DEFAULT_SEGMENT_SECONDS;
  const minEnd = startSec + MIN_LOOP_SECONDS;
  return Math.max(minEnd, Math.floor(base));
}

const Learn: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);

  const [loopEnabled, setLoopEnabled] = useState(false);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState<number | null>(null);
  const [startInputRaw, setStartInputRaw] = useState("00:00");
  const [endInputRaw, setEndInputRaw] = useState("");

  const [segmentMode, setSegmentMode] = useState<SegmentMode>("time");
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [selectedTranscriptText, setSelectedTranscriptText] = useState("");

  const [heardSentence, setHeardSentence] = useState("");
  const [notes, setNotes] = useState("");
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [embedDisabled, setEmbedDisabled] = useState(false);
  const [savedItems, setSavedItems] = useState<MemoryItem[]>([]);
  const [autoPlaySelection, setAutoPlaySelection] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [subtitleDisplayMode, setSubtitleDisplayMode] = useState<"none" | "subtitle" | "slash">("subtitle");
  const persistTranscript = true;

  const setTranscriptLinesWithCache = (nextLines: TranscriptLine[], targetClipId?: string) => {
    setTranscriptLines(nextLines);
    const resolvedClipId = targetClipId || clipId || clip?.id;
    if (!resolvedClipId) return;
    localStorage.setItem(transcriptLocalCacheKey(resolvedClipId), JSON.stringify(nextLines));
  };

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const deepLinkSegment = useMemo(() => {
    const start = Number(queryParams.get("start"));
    const end = Number(queryParams.get("end"));

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return null;
    }

    return {
      startSec: Math.max(0, Math.floor(start)),
      endSec: Math.max(2, Math.floor(end)),
    };
  }, [queryParams]);

  const requestedMode = useMemo(() => {
    const mode = (queryParams.get("mode") || "").toLowerCase();
    if (mode === "subtitle") return "subtitle" as SegmentMode;
    if (mode === "time") return "time" as SegmentMode;
    return undefined;
  }, [queryParams]);

  const defaultModeForClip = (targetClip: Clip, lines: TranscriptLine[]): SegmentMode => {
    const hasTimed = lines.some((line) => line.startSec !== undefined && line.endSec !== undefined && line.endSec > line.startSec);

    if (targetClip.captionsAvailable === false) return "time";
    if (hasTimed) return "subtitle";
    if (targetClip.captionsAvailable === true) return "subtitle";
    return "time";
  };

  const syncInputs = (nextStart: number, nextEnd: number | null) => {
    setStartInputRaw(formatTime(nextStart));
    setEndInputRaw(nextEnd === null ? "" : formatTime(nextEnd));
  };

  const applyRange = (nextStart: number, nextEnd: number | null, options?: { requestAutoplay?: boolean }) => {
    const normalized = safeRange(nextStart, nextEnd);
    setStartSec(normalized.startSec);
    setEndSec(normalized.endSec);
    syncInputs(normalized.startSec, normalized.endSec);

    if (options?.requestAutoplay) {
      setAutoPlaySelection(true);
    }
  };

  useEffect(() => {
    if (!autoPlaySelection) return;
    const timer = window.setTimeout(() => setAutoPlaySelection(false), 800);
    return () => window.clearTimeout(timer);
  }, [autoPlaySelection]);

  const loadPage = async () => {
    if (!clipId) return;

    setLoading(true);
    const [status, foundClip, memories] = await Promise.all([
      getStorageStatus(),
      getClipById(clipId),
      getMemoryByClipId(clipId),
    ]);

    setMigrationRequired(status.migrationRequired);
    setClip(foundClip || null);
    setSavedItems(memories.sort((a, b) => b.createdAt - a.createdAt));

    const dismissedGuide = await getMetaValue<boolean>(TRANSCRIPT_GUIDE_DISMISSED_KEY, false);
    setGuideDismissed(dismissedGuide);
    setGuideExpanded(!dismissedGuide);

    let linesFromStorage: TranscriptLine[] = [];
    if (foundClip) {
      try {
        const parsedMeta = await getMetaValue<TranscriptLine[]>(transcriptStorageKey(foundClip.id), []);
        const metaLines = Array.isArray(parsedMeta) ? parsedMeta : [];

        let localLines: TranscriptLine[] = [];
        try {
          const rawLocal = localStorage.getItem(transcriptLocalCacheKey(foundClip.id));
          if (rawLocal) {
            const parsedLocal = JSON.parse(rawLocal);
            localLines = Array.isArray(parsedLocal) ? parsedLocal : [];
          }
        } catch {
          localLines = [];
        }

        linesFromStorage = localLines.length > metaLines.length ? localLines : metaLines;
      } catch {
        linesFromStorage = [];
      }
    }

    setTranscriptLinesWithCache(linesFromStorage, foundClip?.id);

    if (foundClip) {
      if (deepLinkSegment) {
        const normalized = safeRange(deepLinkSegment.startSec, deepLinkSegment.endSec);
        setStartSec(normalized.startSec);
        setEndSec(normalized.endSec);
        syncInputs(normalized.startSec, normalized.endSec);
        setLoopEnabled(true);
        setAutoPlaySelection(true);
      } else {
        setStartSec(0);
        setEndSec(null);
        syncInputs(0, null);
        setLoopEnabled(false);
      }

      if (requestedMode) {
        setSegmentMode(requestedMode);
      } else {
        setSegmentMode(defaultModeForClip(foundClip, linesFromStorage));
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPage();
  }, [clipId, deepLinkSegment, requestedMode]);

  useEffect(() => {
    if (!clip?.id) return;
    if (loading) return;

    const save = async () => {
      await setMetaValue(transcriptStorageKey(clip.id), transcriptLines);
      localStorage.setItem(transcriptLocalCacheKey(clip.id), JSON.stringify(transcriptLines));
    };

    void save();
  }, [transcriptLines, clip?.id, loading]);

  useEffect(() => {
    if (transcriptLines.length > 0 && guideExpanded) {
      setGuideExpanded(false);
    }
  }, [transcriptLines.length, guideExpanded]);

  const effectiveEndSec = useMemo(() => resolveEnd(startSec, endSec), [startSec, endSec]);

  const currentRef: SegmentRef | null = useMemo(() => {
    if (!clip) return null;

    return normalizeSegmentRef({
      clipId: clip.id,
      videoId: clip.videoId,
      startSec,
      endSec: effectiveEndSec,
      createdAt: Date.now(),
    });
  }, [clip, startSec, effectiveEndSec]);

  const saveMemoryAndCard = async (memory: MemoryItem) => {
    await saveMemoryItem(memory);

    const existingCard = await getSrsCardByMemoryId(memory.id);
    const dueDate = existingCard?.dueDate || getTodayDateKey();

    await saveSrsCard(
      existingCard || {
        id: existingCard?.id || `srs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        memoryId: memory.id,
        ease: 2.3,
        intervalDays: 0,
        dueDate,
      }
    );

    setSavedItems((prev) => [memory, ...prev]);
    setSaveError(null);
    toast.success(`저장됨 · 다음 복습 ${dueDate}`);
  };

  const handleSaveMemory = async () => {
    if (!clip || !currentRef) return;

    const rawUserText = heardSentence.trim();
    const safeUserText = rawUserText.length > 300 ? rawUserText.slice(0, 300) : rawUserText;

    if (rawUserText.length > 300) {
      toast.warning("들은 문장이 길어 300자까지만 저장됩니다");
    }

    const cleanNotes = notes.trim();
    if (!safeUserText && !cleanNotes) {
      toast.error("들린 문장 또는 메모를 입력해주세요");
      return;
    }

    const now = Date.now();
    const memory: MemoryItem = {
      id: `mem_${now}_${Math.random().toString(36).slice(2, 7)}`,
      ref: currentRef,
      notes: cleanNotes || safeUserText,
      ...(safeUserText ? { userText: safeUserText } : {}),
      ...(confidence ? { confidence } : {}),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveMemoryAndCard(memory);
      setHeardSentence("");
      setNotes("");
      setSelectedTranscriptText("");
      setConfidence(undefined);
    } catch (error) {
      console.error(error);
      const message = "저장에 실패했습니다. 다시 시도해주세요.";
      setSaveError(message);
      toast.error(message);
    }
  };

  const handleStartBlur = () => {
    const parsed = parseTime(startInputRaw);
    if (parsed === null) {
      setStartInputRaw(formatTime(startSec));
      return;
    }

    applyRange(parsed, endSec);
  };

  const handleStartFocus = () => {
    if (startInputRaw === "00:00") {
      setStartInputRaw("");
    }
  };

  const handleEndBlur = () => {
    const clean = endInputRaw.trim();
    if (!clean) {
      setEndSec(null);
      setEndInputRaw("");
      return;
    }

    const parsed = parseTime(clean);
    if (parsed === null) {
      setEndInputRaw(endSec === null ? "" : formatTime(endSec));
      return;
    }

    applyRange(startSec, parsed);
  };

  const handleEndFocus = () => {
    if (endInputRaw === "00:00") {
      setEndInputRaw("");
    }
  };

  const nudgeStart = (delta: number) => {
    applyRange(startSec + delta, endSec);
  };

  const nudgeEnd = (delta: number) => {
    const base = endSec ?? resolveEnd(startSec, endSec);
    applyRange(startSec, base + delta);
  };

  const handleLoopToggle = (checked: boolean) => {
    if (!checked) {
      setLoopEnabled(false);
      return;
    }

    const ensuredEnd = endSec ?? resolveEnd(startSec, endSec);
    applyRange(startSec, ensuredEnd);
    setLoopEnabled(true);
  };

  const chooseCaptionsStatus = async (value: true | false) => {
    if (!clip) return;

    const updated: Clip = { ...clip, captionsAvailable: value };
    await saveClip(updated);
    setClip(updated);

    if (value) {
      setSegmentMode("subtitle");
    } else {
      setSegmentMode("time");
    }
  };

  if (loading) {
    return (
      <PageShell title="학습" showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="text-center py-16 text-sm text-muted-foreground">로딩 중...</div>
      </PageShell>
    );
  }

  if (migrationRequired) {
    return (
      <PageShell title="학습" showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="bg-card rounded-xl border p-6 text-center mt-4">
          <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="font-medium">데이터 초기화가 필요합니다</p>
          <p className="text-sm text-muted-foreground mt-1">구버전 데이터가 감지되어 학습 기능을 잠시 사용할 수 없습니다.</p>
          <Button className="mt-4" onClick={() => navigate("/settings")}>설정에서 초기화하기</Button>
        </div>
      </PageShell>
    );
  }

  if (!clip || !currentRef) {
    return (
      <PageShell title="학습" showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="text-center py-16">
          <p className="text-muted-foreground">클립을 찾을 수 없습니다</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/library")}>라이브러리로 이동</Button>
        </div>
      </PageShell>
    );
  }

  const shouldShowTranscriptGuide = clip.captionsAvailable === true || segmentMode === "subtitle";
  const showTranscriptGuide = shouldShowTranscriptGuide && guideExpanded;
  const showTranscriptPanel = shouldShowTranscriptGuide || transcriptLines.length > 0;
  const youtubeScriptUrl = clip.youtubeUrl || `https://www.youtube.com/watch?v=${clip.videoId}`;
  const learningSteps: LearningStep[] = ["B", "C"];
  const completedSteps: LearningStep[] = [];

  const dismissTranscriptGuide = () => {
    setGuideDismissed(true);
    setGuideExpanded(false);
    void setMetaValue(TRANSCRIPT_GUIDE_DISMISSED_KEY, true);
  };

  const reopenTranscriptGuide = () => {
    setGuideExpanded(true);
  };

  return (
    <PageShell title="학습" showBack onBack={() => navigate(-1)} noBottomNav>
      <YouTubePlayer
        videoId={clip.videoId}
        startSec={startSec}
        endSec={endSec ?? undefined}
        loop={loopEnabled && endSec !== null}
        autoplay={autoPlaySelection}
        onEmbedError={() => setEmbedDisabled(true)}
      />

      {embedDisabled && (
        <div className="mt-3 rounded-lg bg-warning/10 border border-warning/20 p-3 text-xs text-foreground">
          임베드 재생이 제한될 수 있습니다. 그래도 구간/텍스트 저장과 SRS 생성은 계속 가능합니다.
        </div>
      )}

      {clip.captionsAvailable === "unknown" && (
        <div className="mt-3 rounded-lg border p-3 bg-card">
          <p className="text-sm font-medium">이 영상의 자막 상태를 선택하세요</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => chooseCaptionsStatus(true)}>자막 있음</Button>
            <Button size="sm" variant="outline" onClick={() => chooseCaptionsStatus(false)}>자막 없음</Button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        <Stepper steps={learningSteps} currentStep="B" completedSteps={completedSteps} />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            const matchedSavedText = savedItems.find(
              (item) => item.ref.startSec === startSec && item.ref.endSec === effectiveEndSec
            );
            const textSeed =
              heardSentence.trim() ||
              selectedTranscriptText.trim() ||
              notes.trim() ||
              matchedSavedText?.userText?.trim() ||
              matchedSavedText?.notes?.trim() ||
              "";
            const params = new URLSearchParams({
              start: String(startSec),
              end: String(effectiveEndSec),
              ...(textSeed ? { text: textSeed } : {}),
            });
            navigate(`/shadowing/${clip.id}?${params.toString()}`);
          }}
        >
          다음 단계: 듣고 따라 말하기(C)
        </Button>
      </div>

      <div className="mt-4 rounded-xl border-2 border-primary/35 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">유튜브 스크립트 복사해서 붙여넣기</p>
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={youtubeScriptUrl} target="_blank" rel="noopener noreferrer">
              YouTube에서 스크립트 열기
            </a>
          </Button>
        </div>

        {showTranscriptGuide ? (
          <div className="rounded-lg bg-card p-3 border space-y-2">
            <ol className="space-y-1 text-xs text-muted-foreground">
              <li>1. YouTube에서 영상 아래 '더보기'를 열어요.</li>
              <li>2. '스크립트 표시(Show transcript)'를 눌러요.</li>
              <li>3. 필요한 구간을 드래그해서 복사(Ctrl/Cmd+C) 후, 여기 붙여넣기(Ctrl/Cmd+V)</li>
            </ol>
            <p className="text-[11px] text-muted-foreground">타임코드가 있으면 줄 클릭/SHIFT 선택으로 구간이 자동 설정돼요.</p>
            <p className="text-[11px] text-muted-foreground">타임코드가 없으면 텍스트만 저장되고, 구간은 시간(mm:ss)으로 설정해요.</p>
            <div className="flex justify-end">
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
      </div>

      {showTranscriptPanel && (
        <div className="bg-card rounded-xl border p-4 mt-3 space-y-2">
          <p className="text-sm font-medium">자막 텍스트</p>
          <p className="text-xs text-muted-foreground">줄을 선택하면 해당 구간이 즉시 재생되고 반복됩니다.</p>
          <div className="flex flex-wrap items-center gap-2 pb-1">
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
          <TranscriptPanel
            lines={transcriptLines}
            persistEnabled={persistTranscript}
            onLinesChange={(nextLines) => setTranscriptLinesWithCache(nextLines)}
            onSelectionChange={setSelectedTranscriptText}
            displayMode={subtitleDisplayMode}
            onLineActivate={(line) => {
              setSelectedTranscriptText(line.text);

              if (line.startSec === undefined) return;

              const nextStart = line.startSec;
              const nextEnd = line.endSec !== undefined ? line.endSec : line.startSec + DEFAULT_SEGMENT_SECONDS;
              setLoopEnabled(true);
              applyRange(nextStart, nextEnd, { requestAutoplay: true });
            }}
            onRangeActivate={(lines) => {
              const joined = lines.map((line) => line.text).join(" ").trim();
              setSelectedTranscriptText(joined);

              const firstStart = lines.find((line) => line.startSec !== undefined)?.startSec;
              const lastEnd = [...lines].reverse().find((line) => line.endSec !== undefined)?.endSec;

              if (firstStart !== undefined) {
                setLoopEnabled(true);
                applyRange(firstStart, lastEnd ?? firstStart + DEFAULT_SEGMENT_SECONDS, { requestAutoplay: true });
              }
            }}
          />

          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">선택 텍스트</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!selectedTranscriptText}
                onClick={() => {
                  const selected = selectedTranscriptText.trim();
                  if (!selected) return;

                  const normalizedPrev = heardSentence.trim();
                  const existingLines = normalizedPrev
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);

                  if (existingLines.includes(selected)) {
                    toast.info("같은 문장은 한 번만 추가됩니다");
                    return;
                  }

                  setHeardSentence(normalizedPrev ? `${normalizedPrev}\n${selected}` : selected);
                }}
              >
                복습 텍스트로 추가
              </Button>
            </div>
            <p className="text-xs text-muted-foreground break-words">{selectedTranscriptText || "아직 선택된 텍스트가 없습니다."}</p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border p-4 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">구간 선택</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={segmentMode === "subtitle" ? "default" : "outline"}
              onClick={() => {
                setSegmentMode("subtitle");
                if (!guideDismissed) {
                  setGuideExpanded(true);
                }
              }}
            >
              자막 모드
            </Button>
            <Button
              type="button"
              size="sm"
              variant={segmentMode === "time" ? "default" : "outline"}
              onClick={() => setSegmentMode("time")}
            >
              시간 모드
            </Button>
          </div>
        </div>

        {segmentMode === "subtitle" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-2">
              <div className="flex items-center gap-2 text-sm">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <span>구간 반복</span>
              </div>
              <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
            </div>

            <details className="rounded-lg border p-3">
              <summary className="text-xs font-medium cursor-pointer">시간 미세 조정 (보조)</summary>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={startInputRaw}
                    placeholder="mm:ss"
                    onFocus={handleStartFocus}
                    onChange={(e) => setStartInputRaw(e.target.value)}
                    onBlur={handleStartBlur}
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={endInputRaw}
                    placeholder="mm:ss"
                    onFocus={handleEndFocus}
                    onChange={(e) => setEndInputRaw(e.target.value)}
                    onBlur={handleEndBlur}
                  />
                </div>
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
                  onChange={(e) => setStartInputRaw(e.target.value)}
                  onBlur={handleStartBlur}
                />
                <div className="flex gap-1 mt-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeStart(-5)}>-5s</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeStart(5)}>+5s</Button>
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
                  onChange={(e) => setEndInputRaw(e.target.value)}
                  onBlur={handleEndBlur}
                />
                <div className="flex gap-1 mt-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeEnd(-5)}>-5s</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => nudgeEnd(5)}>+5s</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-2">
              <div className="flex items-center gap-2 text-sm">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <span>구간 반복</span>
              </div>
              <Switch checked={loopEnabled} onCheckedChange={handleLoopToggle} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border p-4 mt-4 space-y-3">
        <h3 className="font-semibold text-sm">들은 문장 적기</h3>
        <p className="text-xs text-muted-foreground">들린 부분을 적고 AI 피드백을 거친 뒤 복습 리스트에 저장하세요.</p>

        <Textarea
          rows={3}
          value={heardSentence}
          onChange={(e) => setHeardSentence(e.target.value)}
          placeholder="들린 문장을 입력하세요"
        />

        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="의미/해석/메모 (선택)"
        />

        <div>
          <label className="text-xs text-muted-foreground">이해도 (1~5)</label>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                type="button"
                variant={confidence === value ? "default" : "outline"}
                size="sm"
                onClick={() => setConfidence(value as 1 | 2 | 3 | 4 | 5)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        {saveError && <div className="text-xs text-destructive">{saveError}</div>}
        <Button className="w-full" onClick={handleSaveMemory} disabled={!heardSentence.trim() && !notes.trim()}>
          <BookmarkPlus className="w-4 h-4 mr-1" /> 복습 리스트(SRS)에 저장
        </Button>
      </div>

      <ExternalAiAskBar
        refData={currentRef}
        youtubeUrl={clip.youtubeUrl || `https://www.youtube.com/watch?v=${clip.videoId}`}
        userText={heardSentence}
        notes={notes}
      />

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">저장된 메모</h3>
          <Badge variant="secondary">{savedItems.length}개</Badge>
        </div>

        {savedItems.length === 0 ? (
          <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground">아직 저장된 메모가 없습니다.</div>
        ) : (
          savedItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setLoopEnabled(true);
                applyRange(item.ref.startSec, item.ref.endSec, { requestAutoplay: true });
              }}
              className={cn("w-full text-left rounded-lg border bg-card p-3 hover:border-primary/40 transition-colors")}
            >
              <p className="text-sm font-medium line-clamp-2">{item.userText || item.notes || "(텍스트 없음)"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(item.ref.startSec)} - {formatTime(item.ref.endSec)}
              </p>
            </button>
          ))
        )}
      </div>
    </PageShell>
  );
};

export default Learn;
