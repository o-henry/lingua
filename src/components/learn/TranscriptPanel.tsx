import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TranscriptLine, parseUserProvidedTranscript } from "@/domain/transcript";
import { formatTime } from "@/domain/time";
import { cn } from "@/lib/utils";

interface TranscriptPanelProps {
  lines: TranscriptLine[];
  persistEnabled: boolean;
  onLinesChange: (lines: TranscriptLine[]) => void;
  onSelectionChange: (text: string) => void;
  displayMode?: "none" | "subtitle" | "slash";
  onLineActivate?: (line: TranscriptLine) => void;
  onRangeActivate?: (lines: TranscriptLine[]) => void;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  lines,
  persistEnabled,
  onLinesChange,
  onSelectionChange,
  displayMode = "subtitle",
  onLineActivate,
  onRangeActivate,
}) => {
  const [rawInput, setRawInput] = useState("");
  const [pasteOpen, setPasteOpen] = useState(lines.length === 0);
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const selectionContainerRef = useRef<HTMLDivElement>(null);
  const hasLines = useMemo(() => lines.length > 0, [lines]);
  const parsePreview = useMemo(
    () =>
      parseUserProvidedTranscript(rawInput, {
        autoDetectTimestamps: true,
        mergeConsecutiveLines: true,
      }),
    [rawInput]
  );

  useEffect(() => {
    if (lines.length > 0) {
      setPasteOpen(false);
    }
  }, [lines.length]);

  const resetSelection = () => {
    setAnchorIndex(null);
    setSelectedIndices(new Set());
    onSelectionChange("");
  };

  const handleCleanPaste = () => {
    if (!rawInput.trim()) return;
    onLinesChange(parsePreview.lines);
    setRawInput(parsePreview.cleanedInput);
    setPasteOpen(false);
    resetSelection();
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    const parsed = parseUserProvidedTranscript(text, {
      autoDetectTimestamps: true,
      mergeConsecutiveLines: true,
    });
    onLinesChange(parsed.lines);
    setRawInput(parsed.cleanedInput || text);
    setPasteOpen(false);
    resetSelection();
  };

  const applyAutoParse = (sourceText: string) => {
    const parsed = parseUserProvidedTranscript(sourceText, {
      autoDetectTimestamps: true,
      mergeConsecutiveLines: true,
    });

    onLinesChange(parsed.lines);
    setRawInput(parsed.cleanedInput || sourceText);
    setPasteOpen(false);
    resetSelection();
  };

  const updateSelectionFromDom = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!selectionContainerRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    onSelectionChange(selection.toString().trim());
  };

  const handleLineClick = (index: number, event: React.MouseEvent) => {
    const line = lines[index];
    if (!line) return;

    if (event.shiftKey && anchorIndex !== null) {
      const from = Math.min(anchorIndex, index);
      const to = Math.max(anchorIndex, index);
      const rangeIndices = new Set<number>();
      const selected = lines.slice(from, to + 1);

      for (let i = from; i <= to; i += 1) {
        rangeIndices.add(i);
      }

      setSelectedIndices(rangeIndices);
      const joined = selected.map((item) => item.text).join(" ").trim();
      onSelectionChange(joined);
      onRangeActivate?.(selected);
      return;
    }

    setAnchorIndex(index);
    setSelectedIndices(new Set([index]));
    onSelectionChange(line.text.trim());
    onLineActivate?.(line);
  };

  const renderLineText = (text: string) => {
    if (displayMode === "none") return "···";
    if (displayMode === "slash") {
      return text
        .split(/\s+/)
        .filter(Boolean)
        .join(" / ");
    }
    return text;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-sm)] bg-secondary/65 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-medium">자막 텍스트 (클릭: 한 줄 선택 / Shift+클릭: 범위 선택)</p>
          <div className="flex items-center gap-2">
            {lines.length > 0 && !pasteOpen && (
              <Button type="button" size="sm" variant="outline" onClick={() => setPasteOpen(true)}>
                자막 다시 붙여넣기
              </Button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          선택한 텍스트는 아래 저장 섹션으로 보낼 수 있습니다. {persistEnabled ? "붙여넣은 자막은 이 기기에 계속 저장됩니다." : ""}
        </p>

        <div ref={selectionContainerRef} onMouseUp={updateSelectionFromDom} className="space-y-2 max-h-72 overflow-auto pr-1 scrollbar-none">
          {lines.length === 0 ? (
            <p className="text-xs text-muted-foreground">아직 자막 텍스트가 없습니다.</p>
          ) : (
            lines.map((line, index) => {
              const selected = selectedIndices.has(index);
              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={(event) => handleLineClick(index, event)}
                  className={cn(
                    "w-full text-left rounded-[12px] bg-card p-2 transition-colors",
                    selected ? "bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.45)]" : "hover:bg-secondary"
                  )}
                >
                  <div className="text-[10px] text-muted-foreground mb-1">
                    {line.startSec !== undefined ? formatTime(line.startSec) : "--:--"}
                    {line.endSec !== undefined ? ` ~ ${formatTime(line.endSec)}` : ""}
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words select-text">{renderLineText(line.text)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {pasteOpen && (
        <div className="rounded-[var(--radius-sm)] bg-secondary/65 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">사용자 제공 자막(붙여넣기)</p>
            {lines.length > 0 && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setPasteOpen(false)}>
                접기
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            이 앱은 유튜브에서 텍스트를 자동으로 가져오지 않아요. 복사/붙여넣기로만 추가할 수 있어요.
          </p>
          <Textarea
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (!pasted.trim()) return;
              e.preventDefault();
              applyAutoParse(pasted);
            }}
            placeholder={"예: 00:12 hello everyone\n00:15 today we'll...\n(또는 타임코드 없이 텍스트만 붙여넣어도 돼요)"}
          />

          {rawInput.trim() && (
            <div className="rounded-[12px] bg-muted p-2 text-[11px] text-muted-foreground">
              {parsePreview.detectedTimecodeCount > 0
                ? `타임코드 ${parsePreview.detectedTimecodeCount}개 감지됨`
                : "타임코드가 없어서 텍스트만 저장됩니다"}
              {parsePreview.detectedTimecodeCount > 0 && (
                <p className="mt-1">감지된 타임코드를 기준으로 줄 분리를 도와드려요.</p>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">붙여넣는 즉시 타임스탬프 자동 인식 + 연속 줄 합치기가 자동 적용됩니다.</p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCleanPaste} disabled={!rawInput.trim()}>
              다시 정리하기
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onLinesChange([]);
                setPasteOpen(true);
                resetSelection();
              }}
              disabled={!hasLines}
            >
              전체 지우기
            </Button>
          </div>

          <details className="rounded-[12px] bg-card p-2">
            <summary className="text-xs font-medium cursor-pointer">SRT/VTT 파일 업로드(고급)</summary>
            <div className="mt-2">
              <label className="inline-flex">
                <input
                  type="file"
                  accept=".srt,.vtt,.txt,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleFileUpload(file);
                    e.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex items-center rounded-[12px] bg-secondary px-3 py-1.5 text-xs cursor-pointer hover:bg-secondary/80">
                  파일 선택
                </span>
              </label>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default TranscriptPanel;
