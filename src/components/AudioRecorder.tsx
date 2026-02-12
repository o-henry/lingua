import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, RotateCcw } from "lucide-react";

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [status, setStatus] = useState<"idle" | "recording" | "recorded" | "denied">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("recorded");
        onRecordingComplete?.(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      console.error("Mic access denied:", err);
      setStatus("denied");
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setStatus("idle");
  }, [audioUrl]);

  if (status === "denied") {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center">
        <p className="text-sm font-medium text-destructive">마이크 접근이 거부되었습니다</p>
        <p className="text-xs text-muted-foreground mt-1">브라우저 설정에서 마이크 권한을 허용해주세요</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setStatus("idle")}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {status === "idle" && (
        <button
          onClick={startRecording}
          className="relative w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        >
          <Mic className="w-8 h-8" />
        </button>
      )}

      {status === "recording" && (
        <div className="relative">
          <div className="absolute inset-0 rounded-full gradient-primary animate-pulse-ring" />
          <button
            onClick={stopRecording}
            className="relative w-20 h-20 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground shadow-lg z-10"
          >
            <Square className="w-6 h-6" />
          </button>
        </div>
      )}

      {status === "recorded" && audioUrl && (
        <div className="flex flex-col items-center gap-3 w-full">
          <audio controls src={audioUrl} className="w-full max-w-xs" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetRecording}>
              <RotateCcw className="w-4 h-4 mr-1" /> 다시 녹음
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {status === "idle" && "탭하여 녹음 시작"}
        {status === "recording" && "녹음 중... 탭하여 중지"}
        {status === "recorded" && "녹음 완료"}
      </p>
    </div>
  );
};

export default AudioRecorder;
