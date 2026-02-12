import React, { useState, useEffect } from "react";
import { getSessionLogs, getSrsCards, getStreak, getTotalStudyMinutes } from "@/lib/storage";
import { SessionLog } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Flame, Clock, BookOpen, Layers, Target } from "lucide-react";

const Stats: React.FC = () => {
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [stepCounts, setStepCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });

  useEffect(() => {
    setStreak(getStreak());
    setTotalMinutes(getTotalStudyMinutes());
    setTotalCards(getSrsCards().length);
    const allLogs = getSessionLogs();
    setLogs(allLogs);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    allLogs.forEach((l) => l.stepsCompleted.forEach((s) => counts[s]++));
    setStepCounts(counts);
  }, []);

  const stats = [
    { icon: <Flame className="w-6 h-6 text-streak" />, label: "연속 학습", value: `${streak}일` },
    { icon: <Clock className="w-6 h-6 text-primary" />, label: "총 학습 시간", value: `${totalMinutes}분` },
    { icon: <Layers className="w-6 h-6 text-accent" />, label: "저장 표현", value: `${totalCards}개` },
    { icon: <BookOpen className="w-6 h-6 text-success" />, label: "학습 일수", value: `${logs.length}일` },
  ];

  const stepLabels = { A: "🔥 예열", B: "📖 대본", C: "🎙️ 섀도잉", D: "🧠 인출" };
  const maxStep = Math.max(...Object.values(stepCounts), 1);

  return (
    <>
      <PageShell title="통계">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl border p-4 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Step Breakdown */}
        <h3 className="font-semibold mb-3">단계별 수행 횟수</h3>
        <div className="bg-card rounded-xl border p-4 space-y-3">
          {(Object.entries(stepLabels) as [keyof typeof stepCounts, string][]).map(([key, label]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="font-medium">{stepCounts[key]}회</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all"
                  style={{ width: `${(stepCounts[key] / maxStep) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <h3 className="font-semibold mt-6 mb-3">최근 학습 기록</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">아직 학습 기록이 없어요</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(-7).reverse().map((log) => (
              <div key={log.date} className="bg-card rounded-lg border p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{log.date}</div>
                  <div className="text-xs text-muted-foreground">
                    {log.stepsCompleted.join(" → ")} · {log.savedCount}개 저장
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">{log.minutes}분</div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
      <BottomNav />
    </>
  );
};

export default Stats;
