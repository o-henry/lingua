import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AiAskTarget,
  AiPromptMode,
  buildAiPrompt,
  buildShadowingPronunciationPrompt,
  buildYouTubeTimeUrl,
  targetHomeUrl,
  targetLabel,
} from "@/domain/aiAsk";
import { SegmentRef } from "@/lib/types";
import { getSettings } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExternalAiAskBarProps {
  refData: SegmentRef;
  youtubeUrl: string;
  userText?: string;
  notes?: string;
  recordedAudioFile?: File | null;
  promptMode?: AiPromptMode;
  actionMode?: "combined" | "split";
  showPromptPreview?: boolean;
  className?: string;
}

function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const channels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const frameCount = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channelData = Array.from({ length: channels }, (_, i) => audioBuffer.getChannelData(i));
  let offset = 44;
  for (let i = 0; i < frameCount; i += 1) {
    for (let c = 0; c < channels; c += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

async function convertAudioFileToWav(file: File): Promise<File> {
  if (file.type === "audio/wav" || file.name.toLowerCase().endsWith(".wav")) {
    return file;
  }

  const context = new AudioContext();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
    const wavBlob = audioBufferToWav(audioBuffer);
    return new File([wavBlob], `dlb-pronunciation-${Date.now()}.wav`, { type: "audio/wav" });
  } finally {
    await context.close();
  }
}

const ExternalAiAskBar: React.FC<ExternalAiAskBarProps> = ({
  refData,
  youtubeUrl,
  userText,
  notes,
  recordedAudioFile,
  promptMode = "general",
  actionMode = "combined",
  showPromptPreview = false,
  className,
}) => {
  const forceGemini = promptMode === "shadowing-pronunciation";
  const [target, setTarget] = useState<AiAskTarget>(forceGemini ? "gemini" : "chatgpt");
  const settings = getSettings();

  const textForAsk = useMemo(() => {
    return (userText || notes || "").trim();
  }, [userText, notes]);

  const prompt = useMemo(() => {
    if (!textForAsk) return "";
    if (promptMode === "shadowing-pronunciation") {
      return buildShadowingPronunciationPrompt({
        userText: textForAsk,
        notes,
        youtubeUrl,
        startSec: refData.startSec,
        endSec: refData.endSec,
      });
    }

    return buildAiPrompt({
      youtubeUrl,
      videoId: refData.videoId,
      startSec: refData.startSec,
      endSec: refData.endSec,
      userText: textForAsk,
      notes,
      hasRecording: Boolean(recordedAudioFile),
      targetLanguage: settings.targetLanguage,
      learnerLevel: settings.learnerLevel,
      userAge: settings.userAge,
      userGender: settings.userGender,
    });
  }, [
    youtubeUrl,
    refData,
    textForAsk,
    notes,
    recordedAudioFile,
    settings.targetLanguage,
    settings.learnerLevel,
    settings.userAge,
    settings.userGender,
    promptMode,
  ]);

  const timeUrl = useMemo(() => buildYouTubeTimeUrl(refData.videoId, refData.startSec), [refData]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const copyPrompt = async () => {
    if (!prompt) {
      toast.error("먼저 들은 문장 또는 메모를 입력해주세요");
      return false;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      return true;
    } catch {
      toast.error("프롬프트 복사에 실패했습니다");
      return false;
    }
  };

  const prepareAttachmentDownloads = async () => {
    if (!recordedAudioFile) {
      if (promptMode === "shadowing-pronunciation") {
        toast.warning("녹음을 먼저 한 뒤 질문하면 발음 교정 정확도가 훨씬 좋아집니다.");
      }
      return false;
    }

    const stamp = Date.now();
    const promptBlob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    let audioForDownload = recordedAudioFile;
    try {
      audioForDownload = await convertAudioFileToWav(recordedAudioFile);
    } catch {
      audioForDownload = recordedAudioFile;
    }

    downloadBlob(promptBlob, `dlb-ai-prompt-${stamp}.txt`);
    downloadBlob(audioForDownload, audioForDownload.name || `dlb-pronunciation-${stamp}.wav`);
    return true;
  };

  const openAiTarget = () => {
    const finalTarget = forceGemini ? "gemini" : target;
    window.open(targetHomeUrl(finalTarget), "_blank", "noopener,noreferrer");
    return finalTarget;
  };

  const handleCombinedAsk = async () => {
    const copied = await copyPrompt();
    if (!copied) return;

    const downloaded = await prepareAttachmentDownloads();
    const finalTarget = openAiTarget();

    toast.success(
      downloaded
        ? `${targetLabel(finalTarget)} 열기 완료 · 프롬프트 복사됨 · 프롬프트/녹음파일이 다운로드되었습니다`
        : `${targetLabel(finalTarget)} 열기 완료 · 프롬프트 복사됨`
    );
  };

  const handleCopyOnly = async () => {
    const copied = await copyPrompt();
    if (!copied) return;

    const downloaded = await prepareAttachmentDownloads();
    toast.success(downloaded ? "프롬프트 복사됨 · 프롬프트/녹음파일 다운로드 완료" : "프롬프트가 복사되었습니다");
  };

  const handleOpenOnly = () => {
    if (!prompt) {
      toast.error("먼저 들은 문장 또는 메모를 입력해주세요");
      return;
    }

    const finalTarget = openAiTarget();
    toast.success(`${targetLabel(finalTarget)} 새 탭을 열었습니다`);
  };

  return (
    <div className={cn("ui-island p-3 space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{promptMode === "shadowing-pronunciation" ? "발음 교정 질문하기" : "AI 질문하기"}</p>
        {forceGemini ? (
          <span className="rounded-[var(--radius-sm)] bg-secondary px-2 py-1 text-xs font-en font-medium">Gemini</span>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={target === "chatgpt" ? "default" : "outline"}
              onClick={() => setTarget("chatgpt")}
              className="h-8 px-3"
            >
              ChatGPT
            </Button>
            <Button
              type="button"
              size="sm"
              variant={target === "gemini" ? "default" : "outline"}
              onClick={() => setTarget("gemini")}
              className="h-8 px-3"
            >
              Gemini
            </Button>
          </div>
        )}
      </div>

      {!textForAsk && <p className="text-xs text-muted-foreground">먼저 들은 문장 또는 메모를 입력하면, 질문 프롬프트를 자동으로 만들어줘요.</p>}

      {showPromptPreview && prompt && (
        <div className="rounded-[var(--radius-sm)] bg-secondary/70 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>질문 프롬프트 미리보기</span>
            <span>{prompt.length} chars</span>
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[11px] leading-4">{prompt}</pre>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {actionMode === "split"
          ? "복사 버튼으로 프롬프트를 복사하고, 새탭 버튼으로 선택한 AI 사이트를 열어 붙여넣으세요."
          : "질문하기를 누르면 AI 사이트가 새 탭으로 열리고, 프롬프트가 클립보드에 복사됩니다."}
      </p>

      {recordedAudioFile && (
        <p className="text-xs text-muted-foreground">
          녹음 파일 준비됨: <span className="font-medium">{recordedAudioFile.name}</span>
        </p>
      )}

      {actionMode === "split" ? (
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" onClick={() => void handleCopyOnly()} disabled={!prompt}>
            프롬프트 복사
          </Button>
          <Button type="button" variant="outline" onClick={handleOpenOnly} disabled={!prompt}>
            AI 사이트 새탭 열기
          </Button>
        </div>
      ) : (
        <Button type="button" className="w-full" onClick={() => void handleCombinedAsk()} disabled={!prompt}>
          질문하기
        </Button>
      )}

      <Button type="button" variant="outline" className="w-full" onClick={() => window.open(timeUrl, "_blank", "noopener,noreferrer")}>
        유튜브에서 이 구간 열기
      </Button>
    </div>
  );
};

export default ExternalAiAskBar;
