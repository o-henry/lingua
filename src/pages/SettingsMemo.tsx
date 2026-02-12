import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

const SettingsMemoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageShell title="메모" showBack onBack={() => navigate("/settings")} noBottomNav>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <List className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">메모 리스트</p>
            <p className="text-xs text-muted-foreground">저장한 문장/메모를 전체 목록에서 확인합니다.</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => navigate("/memories")}>
          메모 리스트 열기
        </Button>
      </div>
    </PageShell>
  );
};

export default SettingsMemoPage;
