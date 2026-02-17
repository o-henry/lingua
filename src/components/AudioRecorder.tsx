import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, RefreshCw, CircleStop } from "lucide-react";

interface AudioRecorderProps {
  value?: File | null;
  onRecordingChange?: (file: File | null) => void;
}

function mergeFloat32Chunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return merged;
}

function encodeMonoWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const channels = 1;
  const blockAlign = channels * bytesPerSample;
  const dataSize = samples.length * blockAlign;
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
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ value, onRecordingChange }) => {
  const [status, setStatus] = useState<"idle" | "recording" | "recorded" | "denied">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sinkNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef(44100);

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
      processorNodeRef.current?.disconnect();
      sourceNodeRef.current?.disconnect();
      sinkNodeRef.current?.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [audioUrl]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const sink = context.createGain();
      sink.gain.value = 0;

      pcmChunksRef.current = [];
      sampleRateRef.current = context.sampleRate;

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(sink);
      sink.connect(context.destination);

      audioContextRef.current = context;
      sourceNodeRef.current = source;
      processorNodeRef.current = processor;
      sinkNodeRef.current = sink;
      streamRef.current = stream;
      setStatus("recording");
    } catch (error) {
      console.error(error);
      setStatus("denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    const context = audioContextRef.current;
    const processor = processorNodeRef.current;
    const source = sourceNodeRef.current;
    const sink = sinkNodeRef.current;

    processor?.disconnect();
    source?.disconnect();
    sink?.disconnect();

    processorNodeRef.current = null;
    sourceNodeRef.current = null;
    sinkNodeRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (context && context.state !== "closed") {
      void context.close();
    }
    audioContextRef.current = null;

    const samples = mergeFloat32Chunks(pcmChunksRef.current);
    pcmChunksRef.current = [];
    if (samples.length === 0) {
      setStatus("idle");
      return;
    }

    const wavBlob = encodeMonoWav(samples, sampleRateRef.current);
    const filename = `dlb-pronunciation-${Date.now()}.wav`;
    const file = new File([wavBlob], filename, { type: "audio/wav" });
    const nextAudioUrl = URL.createObjectURL(wavBlob);

    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextAudioUrl;
    });
    setAudioFileName(filename);
    setStatus("recorded");
    onRecordingChange?.(file);
  }, [onRecordingChange]);

  const resetRecording = useCallback(() => {
    processorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    sinkNodeRef.current?.disconnect();
    processorNodeRef.current = null;
    sourceNodeRef.current = null;
    sinkNodeRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;

    pcmChunksRef.current = [];
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
      <div className="w-full rounded-lg bg-destructive/10 p-3 text-center">
        <p className="text-sm font-medium text-destructive">마이크 권한이 필요해요</p>
        <p className="text-xs text-muted-foreground mt-1">브라우저에서 마이크 권한을 허용한 뒤 다시 시도해 주세요.</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setStatus("idle")}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[var(--radius-sm)] bg-secondary/65 p-3 space-y-3">
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
          <CircleStop className="w-4 h-4 mr-1" /> 녹음 중지
        </Button>
      )}

      {status === "recorded" && audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <Button type="button" variant="outline" className="w-full" onClick={resetRecording}>
            <RefreshCw className="w-4 h-4 mr-1" /> 다시 녹음
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
