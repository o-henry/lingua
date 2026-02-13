import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";

const SettingsMemoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageShell title="표현 모음" showBack onBack={() => navigate("/settings")} noBottomNav>
      <div className="rounded-[var(--radius-lg)] border bg-card p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">표현 모음</p>
          <p className="text-xs text-muted-foreground">저장한 문장과 메모를 한 화면에서 확인합니다.</p>
        </div>
        <Button className="w-full" onClick={() => navigate("/memories")}>
          표현 모음 열기
        </Button>
      </div>
    </PageShell>
  );
};

export default SettingsMemoPage;
