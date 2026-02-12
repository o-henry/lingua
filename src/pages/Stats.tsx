import React from "react";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";

const Stats: React.FC = () => {
  return (
    <>
      <PageShell title="통계">
        <div className="bg-card rounded-xl border p-6 text-center">
          <p className="font-medium">통계 화면은 현재 사용하지 않습니다.</p>
          <p className="text-sm text-muted-foreground mt-1">핵심 흐름: 청취 → 구간 선택 → 들은 문장 → AI 질문 → SRS</p>
        </div>
      </PageShell>
      <BottomNav />
    </>
  );
};

export default Stats;
