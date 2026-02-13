import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const SettingsMemoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageShell title="표현 모음" showBack onBack={() => navigate("/settings")} noBottomNav>
      <div className="ui-island overflow-hidden rounded-[16px] border border-border/80 p-4 shadow-[0_10px_26px_-18px_rgba(8,11,20,0.36)]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-border/85 bg-secondary text-[11px] font-semibold">
            MEM
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium">표현 모음</p>
          <p className="text-xs text-muted-foreground mt-1">저장한 문장과 메모를 한 화면에서 확인합니다.</p>
        </div>
        <Button className="w-full mt-3" onClick={() => navigate("/memories")}>
          표현 모음 열기
        </Button>
      </div>
    </PageShell>
  );
};

export default SettingsMemoPage;
