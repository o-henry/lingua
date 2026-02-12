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

interface ExternalAiAskBarProps {
  refData: SegmentRef;
  youtubeUrl: string;
  userText?: string;
  notes?: string;
  recordedAudioFile?: File | null;
  promptMode?: AiPromptMode;
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

  const handleAsk = async () => {
    if (!prompt) {
      toast.error("먼저 들은 문장 또는 메모를 입력해주세요");
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      toast.error("프롬프트 복사에 실패했습니다");
      return;
    }

    if (recordedAudioFile) {
      const stamp = Date.now();
      const promptBlob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
      let audioForDownload = recordedAudioFile;
      try {
        audioForDownload = await convertAudioFileToWav(recordedAudioFile);
      } catch {
        // Keep the original file if conversion fails.
      }

      downloadBlob(promptBlob, `dlb-ai-prompt-${stamp}.txt`);
      downloadBlob(audioForDownload, audioForDownload.name || `dlb-pronunciation-${stamp}.wav`);
    } else if (promptMode === "shadowing-pronunciation") {
      toast.warning("녹음을 먼저 한 뒤 질문하면 발음 교정 정확도가 훨씬 좋아집니다.");
    }

    const finalTarget = forceGemini ? "gemini" : target;
    window.open(targetHomeUrl(finalTarget), "_blank", "noopener,noreferrer");

    toast.success(
      recordedAudioFile
        ? `${targetLabel(finalTarget)} 열기 완료 · 프롬프트 복사됨 · 프롬프트/녹음파일이 다운로드되었습니다`
        : `${targetLabel(finalTarget)} 열기 완료 · 프롬프트 복사됨`
    );
  };

  return (
    <div className="rounded-xl border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{promptMode === "shadowing-pronunciation" ? "발음 교정 질문하기" : "AI 질문하기"}</p>
        {forceGemini ? (
          <span className="text-xs font-medium rounded-md border px-2 py-1 bg-muted">Gemini 전용</span>
        ) : (
          <div className="inline-flex rounded-md border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={target === "chatgpt" ? "default" : "ghost"}
              onClick={() => setTarget("chatgpt")}
              className="h-7 px-2"
            >
              ChatGPT
            </Button>
            <Button
              type="button"
              size="sm"
              variant={target === "gemini" ? "default" : "ghost"}
              onClick={() => setTarget("gemini")}
              className="h-7 px-2"
            >
              Gemini
            </Button>
          </div>
        )}
      </div>

      {!textForAsk && (
        <p className="text-xs text-muted-foreground">먼저 들은 문장 또는 메모를 입력하면, 질문 프롬프트를 자동으로 만들어줘요.</p>
      )}
      <p className="text-[11px] text-muted-foreground">
        질문하기를 누르면 AI 사이트가 새 탭으로 열리고, 프롬프트가 클립보드에 복사됩니다.
        <br />
        {promptMode === "shadowing-pronunciation"
          ? "붙여넣기 후, 방금 다운로드된 WAV 녹음 파일도 함께 첨부하세요."
          : "AI 사이트 입력창에 붙여넣기(Ctrl/Cmd+V)해서 바로 질문하세요."}
      </p>
      {recordedAudioFile && (
        <p className="text-xs text-muted-foreground">
          녹음 파일 준비됨: <span className="font-medium">{recordedAudioFile.name}</span>
          <br />
          질문하기를 누르면 프롬프트 파일과 WAV 녹음 파일이 함께 내려받아집니다.
        </p>
      )}

      <Button type="button" className="w-full" onClick={handleAsk} disabled={!prompt}>
        질문하기
      </Button>

      <Button type="button" variant="outline" className="w-full" onClick={() => window.open(timeUrl, "_blank", "noopener,noreferrer")}>
        유튜브에서 이 구간 열기
      </Button>
    </div>
  );
};

export default ExternalAiAskBar;
