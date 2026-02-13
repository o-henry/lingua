import React from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ExternalAiAskBar from "@/components/ai/ExternalAiAskBar";
import { useLearnState } from "@/pages/learn/LearnStateContext";
import { formatTime } from "@/domain/time";
import { cn } from "@/lib/utils";

const PracticePanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    clip,
    currentRef,
    heardSentence,
    notes,
    confidence,
    saveError,
    savedItems,
    setHeardSentence,
    setNotes,
    setConfidence,
    handleSaveMemory,
    selectSavedMemory,
    getShadowingTextSeed,
  } = useLearnState();

  if (!clip || !currentRef) return null;

  const goToShadowing = () => {
    const textSeed = getShadowingTextSeed();
    const params = new URLSearchParams({
      start: String(currentRef.startSec),
      end: String(currentRef.endSec),
      ...(textSeed ? { text: textSeed } : {}),
    });
    navigate(`/shadowing/${clip.id}?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <section className="learning-card space-y-3">
        <h3 className="text-sm font-semibold">들은 문장 적기</h3>
        <p className="text-xs text-muted-foreground">들린 부분을 적고 AI 피드백을 거친 뒤 복습 리스트에 저장하세요.</p>

        <Textarea rows={3} value={heardSentence} onChange={(event) => setHeardSentence(event.target.value)} placeholder="들린 문장을 입력하세요" />

        <Textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="의미/해석/메모 (선택)" />

        <div>
          <label className="text-xs text-muted-foreground">이해도 (1~5)</label>
          <div className="mt-1 flex gap-2">
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

        <Button className="w-full" onClick={() => void handleSaveMemory()} disabled={!heardSentence.trim() && !notes.trim()}>
          <BookmarkPlus className="mr-1 h-4 w-4" />
          복습 리스트(SRS)에 저장
        </Button>
      </section>

      <ExternalAiAskBar
        refData={currentRef}
        youtubeUrl={clip.youtubeUrl || `https://www.youtube.com/watch?v=${clip.videoId}`}
        userText={heardSentence}
        notes={notes}
        actionMode="split"
        showPromptPreview
      />

      <section className="learning-card space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">저장된 메모</h3>
          <Badge variant="secondary">{savedItems.length}개</Badge>
        </div>

        {savedItems.length === 0 ? (
          <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground">아직 저장된 메모가 없습니다.</div>
        ) : (
          savedItems.slice(0, 8).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectSavedMemory(item)}
              className={cn("w-full rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40")}
            >
              <p className="line-clamp-2 text-sm font-medium">{item.userText || item.notes || "(텍스트 없음)"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTime(item.ref.startSec)} - {formatTime(item.ref.endSec)}
              </p>
            </button>
          ))
        )}
      </section>

      <Accordion type="single" collapsible className="learning-card">
        <AccordionItem value="c-step" className="border-none">
          <AccordionTrigger className="py-1 text-sm font-semibold">C단계 체크리스트 + 발음 교정</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            <ul className="list-disc pl-4 text-xs text-muted-foreground">
              <li>발음 타깃 1개 집중</li>
              <li>강세/리듬 맞추기</li>
              <li>연결발음 확인</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={goToShadowing}>
              C단계로 이동해 발음 교정 질문하기
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PracticePanel;
