import React, { useState, useEffect } from "react";
import { getSettings, updateSettings, clearAllData } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Moon, Bell, Wifi, Trash2 } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setDarkMode(settings.darkMode);
  }, []);

  const toggleDark = (val: boolean) => {
    setDarkMode(val);
    updateSettings({ darkMode: val });
    document.documentElement.classList.toggle("dark", val);
  };

  const handleClearData = () => {
    if (window.confirm("모든 학습 데이터가 삭제됩니다. 계속하시겠습니까?")) {
      clearAllData();
      toast.success("데이터가 초기화되었습니다");
      window.location.href = "/onboarding";
    }
  };

  return (
    <>
      <PageShell title="설정">
        <div className="space-y-2">
          {/* Dark Mode */}
          <div className="bg-card rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">다크 모드</div>
                <div className="text-xs text-muted-foreground">어두운 화면 테마</div>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDark} />
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border p-4 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">알림 설정</div>
                <div className="text-xs text-muted-foreground">추후 지원 예정</div>
              </div>
            </div>
            <Switch disabled />
          </div>

          {/* PWA Info */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Wifi className="w-5 h-5 text-muted-foreground" />
              <div className="font-medium text-sm">오프라인 / PWA</div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 학습 기록과 SRS 카드 복습은 오프라인에서도 가능합니다</p>
              <p>• 유튜브 영상 재생은 인터넷 연결이 필요합니다</p>
              <p>• 홈 화면에 추가하면 앱처럼 사용할 수 있습니다</p>
            </div>
          </div>

          {/* Clear Data */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5 text-destructive" />
              <div>
                <div className="font-medium text-sm">데이터 초기화</div>
                <div className="text-xs text-muted-foreground">모든 학습 데이터를 삭제합니다</div>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearData}>
              데이터 삭제
            </Button>
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-muted-foreground">
          LingoPlay v1.0 · Made with ❤️
        </div>
      </PageShell>
      <BottomNav />
    </>
  );
};

export default SettingsPage;
