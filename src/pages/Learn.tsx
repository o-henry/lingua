import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClipById, saveClip, saveSrsCard } from "@/lib/storage";
import { createSrsCard } from "@/lib/srs";
import { Clip, Sentence, LearningStep, STEP_INFO } from "@/lib/types";
import YouTubePlayer from "@/components/YouTubePlayer";
import Stepper from "@/components/Stepper";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookmarkPlus, Play, Repeat, Eye, EyeOff, ChevronRight } from "lucide-react";

const Learn: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const [clip, setClip] = useState<Clip | null>(null);
  const [step, setStep] = useState<LearningStep>("A");
  const [completedSteps, setCompletedSteps] = useState<LearningStep[]>([]);
  const [loop, setLoop] = useState(false);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(120);
  const [showTranslation, setShowTranslation] = useState(false);
  const [subtitleMode, setSubtitleMode] = useState<"none" | "full" | "slash">("full");

  useEffect(() => {
    if (!clipId) return;
    const found = getClipById(clipId);
    if (found) {
      setClip(found);
      setEndSec(found.durationSec);
      // Add sample sentences if empty
      if (found.sentences.length === 0) {
        const sampleSentences: Sentence[] = [
          { id: `s1_${clipId}`, clipId: found.id, startSec: 0, endSec: 5, text: "Sample sentence 1 - Add your own sentences", translation: "샘플 문장 1" },
          { id: `s2_${clipId}`, clipId: found.id, startSec: 5, endSec: 12, text: "Sample sentence 2 - Practice makes perfect", translation: "샘플 문장 2" },
          { id: `s3_${clipId}`, clipId: found.id, startSec: 12, endSec: 20, text: "Sample sentence 3 - Keep learning every day", translation: "샘플 문장 3" },
        ];
        found.sentences = sampleSentences;
        saveClip(found);
        setClip({ ...found });
      }
    }
  }, [clipId]);

  const handleSaveSentence = useCallback(
    (sentence: Sentence) => {
      const card = createSrsCard(sentence.id, sentence.clipId, sentence.text, sentence.translation);
      saveSrsCard(card);
      toast.success("문장이 SRS 카드로 저장되었습니다");
    },
    []
  );

  const handleNextStep = () => {
    const stepOrder: LearningStep[] = ["A", "B", "C", "D"];
    const currentIdx = stepOrder.indexOf(step);
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    if (currentIdx < stepOrder.length - 1) {
      const next = stepOrder[currentIdx + 1];
      setStep(next);
      if (next === "C") navigate(`/shadowing/${clipId}`);
      else if (next === "D") navigate(`/recall/${clipId}`);
    } else {
      toast.success("학습 완료! 🎉");
      navigate("/home");
    }
  };

  if (!clip) {
    return (
      <PageShell title="학습" showBack onBack={() => navigate(-1)} noBottomNav>
        <div className="text-center py-16">
          <p className="text-muted-foreground">클립을 찾을 수 없습니다</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/library")}>
            라이브러리로 이동
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="" showBack onBack={() => navigate(-1)} noBottomNav>
      {/* Stepper */}
      <div className="mb-4">
        <Stepper
          steps={["A", "B", "C", "D"]}
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={setStep}
        />
      </div>

      {/* Player */}
      <YouTubePlayer videoId={clip.videoId} startSec={startSec} endSec={endSec} loop={loop} />

      {/* Loop Controls */}
      <div className="bg-card rounded-xl border p-4 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">구간 반복</span>
          </div>
          <Switch checked={loop} onCheckedChange={setLoop} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>시작: {startSec}s</span>
            <span>끝: {endSec}s</span>
          </div>
          <Slider
            min={0}
            max={clip.durationSec}
            step={1}
            value={[startSec, endSec]}
            onValueChange={([s, e]) => {
              setStartSec(s);
              setEndSec(e);
            }}
          />
        </div>
      </div>

      {/* Transcript Panel */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">대본</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <select
              value={subtitleMode}
              onChange={(e) => setSubtitleMode(e.target.value as any)}
              className="text-xs bg-muted rounded-lg px-2 py-1 border-0"
            >
              <option value="full">전체 자막</option>
              <option value="slash">의미 단위</option>
              <option value="none">무자막</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {clip.sentences.map((sentence) => (
            <div key={sentence.id} className="bg-card rounded-lg border p-3 flex gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {sentence.startSec}s
                  </Badge>
                </div>
                {subtitleMode !== "none" && (
                  <p className="text-sm">
                    {subtitleMode === "slash"
                      ? sentence.text.replace(/ /g, " / ")
                      : sentence.text}
                  </p>
                )}
                {showTranslation && sentence.translation && (
                  <p className="text-xs text-muted-foreground mt-1">{sentence.translation}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setStartSec(sentence.startSec);
                    setEndSec(sentence.endSec);
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleSaveSentence(sentence)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Step */}
      <div className="mt-6 mb-4">
        <Button className="w-full gradient-primary text-primary-foreground h-11" onClick={handleNextStep}>
          {step === "D" ? "학습 완료" : `다음: ${STEP_INFO[step === "A" ? "B" : step === "B" ? "C" : "D"].label}`}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </PageShell>
  );
};

export default Learn;
