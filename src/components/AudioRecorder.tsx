import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, RotateCcw, Square } from "lucide-react";

interface AudioRecorderProps {
  value?: File | null;
  onRecordingChange?: (file: File | null) => void;
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

async function convertBlobToWav(blob: Blob): Promise<Blob> {
  const context = new AudioContext();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
    return audioBufferToWav(audioBuffer);
  } finally {
    await context.close();
  }
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ value, onRecordingChange }) => {
  const [status, setStatus] = useState<"idle" | "recording" | "recorded" | "denied">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!value) {
      setAudioUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
      setAudioFileName("");
      setStatus((prev) => (prev === "recording" ? prev : "idle"));
      return;
    }

    const nextAudioUrl = URL.createObjectURL(value);
    setAudioUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return nextAudioUrl;
    });
    setAudioFileName(value.name);
    setStatus("recorded");
  }, [value]);

  useEffect(
    () => () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [audioUrl]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const rawBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        let finalBlob = rawBlob;

        try {
          finalBlob = await convertBlobToWav(rawBlob);
        } catch {
          finalBlob = rawBlob;
        }

        const extension = finalBlob.type === "audio/wav" ? "wav" : "webm";
        const filename = `dlb-pronunciation-${Date.now()}.${extension}`;
        const file = new File([finalBlob], filename, { type: finalBlob.type });
        const nextAudioUrl = URL.createObjectURL(finalBlob);

        setAudioUrl(nextAudioUrl);
        setAudioFileName(filename);
        setStatus("recorded");
        onRecordingChange?.(file);

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setStatus("recording");
    } catch (error) {
      console.error(error);
      setStatus("denied");
    }
  }, [audioUrl, onRecordingChange]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const resetRecording = useCallback(() => {
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setAudioFileName("");
    setStatus("idle");
    onRecordingChange?.(null);
  }, [audioUrl, onRecordingChange]);

  if (status === "denied") {
    return (
      <div className="rounded-lg bg-destructive/10 p-3 text-center">
        <p className="text-sm font-medium text-destructive">마이크 권한이 필요해요</p>
        <p className="text-xs text-muted-foreground mt-1">브라우저에서 마이크 권한을 허용한 뒤 다시 시도해 주세요.</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setStatus("idle")}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">발음 녹음</p>
        {audioFileName && <span className="text-[11px] text-muted-foreground">{audioFileName}</span>}
      </div>

      {status === "idle" && (
        <Button type="button" onClick={startRecording} className="w-full">
          <Mic className="w-4 h-4 mr-1" /> 녹음 시작
        </Button>
      )}

      {status === "recording" && (
        <Button type="button" variant="destructive" onClick={stopRecording} className="w-full">
          <Square className="w-4 h-4 mr-1" /> 녹음 중지
        </Button>
      )}

      {status === "recorded" && audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <Button type="button" variant="outline" className="w-full" onClick={resetRecording}>
            <RotateCcw className="w-4 h-4 mr-1" /> 다시 녹음
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
