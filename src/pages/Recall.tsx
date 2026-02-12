import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClipById, getSrsCards, saveSessionLog, getSessionLogs } from "@/lib/storage";
import { Clip } from "@/lib/types";
import AudioRecorder from "@/components/AudioRecorder";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, CheckCircle2 } from "lucide-react";

const REPAIR_TEMPLATES = [
  "다시 말해줘",
  "천천히 말해줘",
  "예시로 말해줘",
  "방금 단어만 다시",
];

const Recall: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const [clip, setClip] = useState<Clip | null>(null);
  const [blanks, setBlanks] = useState<string[]>(["", "", ""]);
  const [questionsText, setQuestionsText] = useState<string[]>(["", "", ""]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (clipId) setClip(getClipById(clipId) || null);
  }, [clipId]);

  const handleComplete = () => {
    const today = new Date().toISOString().split("T")[0];
    const logs = getSessionLogs();
    const todayLog = logs.find((l) => l.date === today);
    const srsCount = getSrsCards().filter((c) => c.clipId === clipId).length;

    saveSessionLog({
      date: today,
      minutes: (todayLog?.minutes || 0) + 7,
      stepsCompleted: [...(todayLog?.stepsCompleted || []), "D"],
      savedCount: (todayLog?.savedCount || 0) + srsCount,
    });

    setCompleted(true);
    toast.success("인출 과제 완료! 🎉");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("복사되었습니다");
  };

  if (!clip) {
    return (
      <PageShell title="인출" showBack onBack={() => navigate(-1)} noBottomNav>
        <p className="text-center py-16 text-muted-foreground">클립을 찾을 수 없습니다</p>
      </PageShell>
    );
  }

  if (completed) {
    const srsCount = getSrsCards().filter((c) => c.clipId === clipId).length;
    return (
      <PageShell title="완료!" showBack onBack={() => navigate("/home")} noBottomNav>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">학습 완료!</h2>
          <p className="text-muted-foreground mb-6">저장된 표현: {srsCount}개</p>
          <div className="bg-card rounded-xl border p-4 mb-6">
            <p className="text-sm text-muted-foreground">다음 복습 예정</p>
            <p className="font-semibold">내일</p>
          </div>
          <Button className="w-full gradient-primary text-primary-foreground h-11" onClick={() => navigate("/home")}>
            홈으로 돌아가기
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="인출 과제" showBack onBack={() => navigate(-1)} noBottomNav>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="blanks">빈칸</TabsTrigger>
          <TabsTrigger value="questions">질문</TabsTrigger>
        </TabsList>

        {/* 60s Summary */}
        <TabsContent value="summary" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            60초 안에 클립 내용을 요약해서 말해보세요
          </p>
          <AudioRecorder />
        </TabsContent>

        {/* Fill in Blanks */}
        <TabsContent value="blanks" className="space-y-4">
          <p className="text-sm text-muted-foreground">빈칸에 맞는 단어를 입력하세요</p>
          {clip.sentences.slice(0, 3).map((s, i) => {
            const words = s.text.split(" ");
            const blankIdx = Math.floor(words.length / 2);
            const display = words.map((w, j) => (j === blankIdx ? "______" : w)).join(" ");
            return (
              <div key={s.id} className="bg-card rounded-xl border p-4">
                <p className="text-sm mb-2 font-mono">{display}</p>
                <Input
                  placeholder="빈칸 답 입력"
                  value={blanks[i]}
                  onChange={(e) => {
                    const next = [...blanks];
                    next[i] = e.target.value;
                    setBlanks(next);
                  }}
                />
              </div>
            );
          })}
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="space-y-4">
          <p className="text-sm text-muted-foreground">클립 내용에 대해 질문 3개를 만들고 답해보세요</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl border p-4 space-y-2">
              <Input
                placeholder={`질문 ${i + 1}`}
                value={questionsText[i]}
                onChange={(e) => {
                  const next = [...questionsText];
                  next[i] = e.target.value;
                  setQuestionsText(next);
                }}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Repair Templates */}
      <div className="bg-card rounded-xl border p-4 mt-6">
        <h4 className="font-semibold text-sm mb-3">되묻기 템플릿</h4>
        <div className="grid grid-cols-2 gap-2">
          {REPAIR_TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => copyToClipboard(t)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              <Copy className="w-3 h-3" />
              {t}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full gradient-primary text-primary-foreground h-11 mt-6 mb-4" onClick={handleComplete}>
        <CheckCircle2 className="w-4 h-4 mr-1" /> 인출 완료
      </Button>
    </PageShell>
  );
};

export default Recall;
