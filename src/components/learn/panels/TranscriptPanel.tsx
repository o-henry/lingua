import React from "react";
import TranscriptEditor from "@/components/learn/TranscriptPanel";
import { useLearnState } from "@/pages/learn/LearnStateContext";

const TranscriptPanel: React.FC = () => {
  const {
    clip,
    persistTranscript,
    transcriptLines,
    selectedTranscriptText,
    showTranscriptPanel,
    setTranscriptLinesWithCache,
    setSelectedTranscriptText,
    activateTranscriptLine,
    activateTranscriptRange,
  } = useLearnState();

  if (!clip) return null;

  return (
    <div className="space-y-3">
      {showTranscriptPanel && (
        <section className="learning-card space-y-2">
          <TranscriptEditor
            lines={transcriptLines}
            persistEnabled={persistTranscript}
            onLinesChange={setTranscriptLinesWithCache}
            onSelectionChange={setSelectedTranscriptText}
            onLineActivate={activateTranscriptLine}
            onRangeActivate={activateTranscriptRange}
            displayMode="subtitle"
          />

          <div className="rounded-[var(--radius-sm)] bg-secondary/65 p-3 space-y-2">
            <p className="text-xs font-medium">선택 텍스트</p>
            <p className="text-xs text-muted-foreground break-words">
              {selectedTranscriptText || "자막을 클릭하면 텍스트가 선택됩니다."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default TranscriptPanel;
