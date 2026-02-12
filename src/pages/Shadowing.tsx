import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getClipById, getStorageStatus } from "@/lib/storage";
import { Clip, SegmentRef } from "@/lib/types";
import PageShell from "@/components/PageShell";
import YouTubePlayer from "@/components/YouTubePlayer";
import AudioRecorder from "@/components/AudioRecorder";
import ExternalAiAskBar from "@/components/ai/ExternalAiAskBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Play } from "lucide-react";
import { formatTime } from "@/domain/time";

const shadowingStateKey = (clipId: string, startSec: number, endSec: number) => `dlb:shadowing:state:${clipId}:${startSec}:${endSec}`;
const shadowingAudioKey = (clipId: string, startSec: number, endSec: number) => `dlb:shadowing:audio:${clipId}:${startSec}:${endSec}`;
const SHADOWING_TITLE = "듣고 따라 말하기";

const CHECKLIST = [
  { id: "pronunciation", label: "발음 타깃 1개 집중" },
  { id: "stress", label: "강세/리듬 맞추기" },
  { id: "linking", label: "연결발음 확인" },
] as const;

interface StoredShadowingState {
  practiceText: string;
  checked: string[];
  loopEnabled: boolean;
}

interface StoredAudioPayload {
  name: string;
  type: string;
  dataUrl: string;
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const dataUrlToFile = async (payload: StoredAudioPayload): Promise<File> => {
  const response = await fetch(payload.dataUrl);
  const blob = await response.blob();
  return new File([blob], payload.name, { type: payload.type });
};

const Shadowing: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [recordedAudioFile, setRecordedAudioFile] = useState<File | null>(null);
  const [audioHydrated, setAudioHydrated] = useState(false);
  const [playbackNonce, setPlaybackNonce] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const startSec = Math.max(0, Math.floor(Number(queryParams.get("start")) || 0));
  const endSec = Math.max(startSec + 2, Math.floor(Number(queryParams.get("end")) || startSec + 10));
  const defaultText = (queryParams.get("text") || "").trim();
  const [practiceText, setPracticeText] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!clipId) return;
      setLoading(true);
      const [status, found] = await Promise.all([getStorageStatus(), getClipById(clipId)]);
      setMigrationRequired(status.migrationRequired);
      setClip(found || null);
      setLoading(false);
    };

    load();
  }, [clipId]);

  useEffect(() => {
    if (!clipId) return;
    let disposed = false;
    setAudioHydrated(false);

    const stateRaw = localStorage.getItem(shadowingStateKey(clipId, startSec, endSec));
    const hasSeedText = defaultText.length > 0;
    if (stateRaw) {
      try {
        const parsed = JSON.parse(stateRaw) as StoredShadowingState;
        setPracticeText(hasSeedText ? defaultText : parsed.practiceText || "");
        setChecked(new Set(parsed.checked || []));
        setLoopEnabled(parsed.loopEnabled ?? true);
      } catch {
        setPracticeText(defaultText);
        setChecked(new Set());
        setLoopEnabled(true);
      }
    } else {
      setPracticeText(defaultText);
      setChecked(new Set());
      setLoopEnabled(true);
    }

    const audioRaw = localStorage.getItem(shadowingAudioKey(clipId, startSec, endSec));
    if (!audioRaw) {
      setRecordedAudioFile(null);
      setAudioHydrated(true);
      return;
    }

    const restoreAudio = async () => {
      try {
        const payload = JSON.parse(audioRaw) as StoredAudioPayload;
        const restoredFile = await dataUrlToFile(payload);
        if (!disposed) {
          setRecordedAudioFile(restoredFile);
        }
      } catch {
        if (!disposed) {
          setRecordedAudioFile(null);
        }
      } finally {
        if (!disposed) {
          setAudioHydrated(true);
        }
      }
    };

    void restoreAudio();

    return () => {
      disposed = true;
    };
  }, [clipId, startSec, endSec, defaultText]);

  useEffect(() => {
    if (!clipId) return;
    const payload: StoredShadowingState = {
      practiceText,
      checked: Array.from(checked),
      loopEnabled,
    };
    localStorage.setItem(shadowingStateKey(clipId, startSec, endSec), JSON.stringify(payload));
  }, [practiceText, checked, loopEnabled, clipId, startSec, endSec]);

  useEffect(() => {
    if (!clipId) return;
    if (!audioHydrated) return;

    const persistAudio = async () => {
      if (!recordedAudioFile) {
        localStorage.removeItem(shadowingAudioKey(clipId, startSec, endSec));
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(recordedAudioFile);
        const payload: StoredAudioPayload = {
          name: recordedAudioFile.name,
          type: recordedAudioFile.type,
          dataUrl,
        };
        localStorage.setItem(shadowingAudioKey(clipId, startSec, endSec), JSON.stringify(payload));
      } catch {
        // Ignore persistence failures and keep runtime state.
      }
    };

    void persistAudio();
  }, [recordedAudioFile, clipId, startSec, endSec, audioHydrated]);

  const refData: SegmentRef | null = useMemo(() => {
    if (!clip) return null;
    return {
      clipId: clip.id,
      videoId: clip.videoId,
      startSec,
      endSec,
      createdAt: Date.now(),
    };
  }, [clip, startSec, endSec]);

  const toggleChecklist = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setChecked(next);
  };

  if (loading) {
    return (
      <PageShell title={SHADOWING_TITLE} showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="text-center py-16 text-sm text-muted-foreground">로딩 중...</div>
      </PageShell>
    );
  }

  if (migrationRequired) {
    return (
      <PageShell title={SHADOWING_TITLE} showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="bg-card rounded-xl border p-6 text-center mt-4">
          <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="font-medium">데이터 초기화가 필요합니다</p>
          <p className="text-sm text-muted-foreground mt-1">구버전 데이터가 감지되어 듣고 따라 말하기 기능을 잠시 사용할 수 없습니다.</p>
          <Button className="mt-4" onClick={() => navigate("/settings")}>설정에서 초기화하기</Button>
        </div>
      </PageShell>
    );
  }

  if (!clip || !refData) {
    return (
      <PageShell title={SHADOWING_TITLE} showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="text-center py-16">
          <p className="text-muted-foreground">클립을 찾을 수 없습니다</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/library")}>라이브러리로 이동</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={`${SHADOWING_TITLE} (C단계)`} showBack onBack={() => navigate(-1)} noBottomNav>
      <div className="rounded-lg border bg-card p-3 mb-3">
        <p className="text-xs text-muted-foreground">현재 연습 구간</p>
        <p className="text-sm font-medium">{formatTime(startSec)} - {formatTime(endSec)}</p>
      </div>

      <YouTubePlayer
        key={`${clip.id}-${playbackNonce}`}
        videoId={clip.videoId}
        startSec={startSec}
        endSec={endSec}
        loop={loopEnabled}
        autoplay={playbackNonce > 0}
      />

      <div className="bg-card rounded-xl border p-4 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">원음 vs 내 녹음 비교</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setPlaybackNonce((prev) => prev + 1)}>
            <Play className="w-4 h-4 mr-1" /> 원음 다시재생
          </Button>
        </div>

        <label className="flex items-center justify-between rounded-lg border p-2 text-sm">
          구간 반복
          <Checkbox checked={loopEnabled} onCheckedChange={(checkedState) => setLoopEnabled(Boolean(checkedState))} />
        </label>

        <AudioRecorder value={recordedAudioFile} onRecordingChange={setRecordedAudioFile} />
      </div>

      <div className="bg-card rounded-xl border p-4 mt-4 space-y-3">
        <h3 className="text-sm font-semibold">연습 문장</h3>
        <Input
          value={practiceText}
          onChange={(e) => setPracticeText(e.target.value)}
          placeholder="연습한 문장을 입력하세요"
        />
      </div>

      <div className="bg-card rounded-xl border p-4 mt-4 space-y-2">
        <h3 className="text-sm font-semibold">체크리스트</h3>
        {CHECKLIST.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={checked.has(item.id)} onCheckedChange={() => toggleChecklist(item.id)} />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <ExternalAiAskBar
        refData={refData}
        youtubeUrl={clip.youtubeUrl || `https://www.youtube.com/watch?v=${clip.videoId}`}
        userText={practiceText}
        recordedAudioFile={recordedAudioFile}
        notes={`듣고 따라 말하기 체크리스트 완료: ${checked.size}/${CHECKLIST.length}`}
        promptMode="shadowing-pronunciation"
      />

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button type="button" variant="outline" onClick={() => navigate(`/learn/${clip.id}?start=${startSec}&end=${endSec}&mode=subtitle`)}>
          이전(학습)
        </Button>
        <Button type="button" onClick={() => navigate("/srs")}>
          다음(복습으로)
        </Button>
      </div>
    </PageShell>
  );
};

export default Shadowing;
