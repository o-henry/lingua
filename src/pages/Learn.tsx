import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import LearningStageMobile from "@/components/learn/layout/LearningStageMobile";
import TranscriptPanel from "@/components/learn/panels/TranscriptPanel";
import VideoStage from "@/components/learn/panels/VideoStage";
import PracticePanel from "@/components/learn/panels/PracticePanel";
import { LearnStateProvider, useLearnState } from "@/pages/learn/LearnStateContext";
import "@/styles/learning-layout.css";

const LearnPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { loading, migrationRequired, clip, currentRef } = useLearnState();

  if (loading) {
    return (
      <AppShell title="학습" titleClassName="text-[18px] leading-[24px]" showBack onBack={() => navigate(-1)} showDesktopRail={false}>
        <div className="px-4 py-16 text-center text-sm text-muted-foreground">로딩 중...</div>
      </AppShell>
    );
  }

  if (migrationRequired) {
    return (
      <AppShell title="학습" titleClassName="text-[18px] leading-[24px]" showBack onBack={() => navigate(-1)} showDesktopRail={false}>
        <div className="mx-auto mt-4 max-w-xl rounded-[var(--radius-lg)] border bg-card p-6 text-center">
          <CircleAlert className="mx-auto mb-2 h-8 w-8 text-warning" />
          <p className="font-medium">데이터 초기화가 필요합니다</p>
          <p className="mt-1 text-sm text-muted-foreground">구버전 데이터가 감지되어 학습 기능을 잠시 사용할 수 없습니다.</p>
          <Button className="mt-4" onClick={() => navigate("/settings")}>설정에서 초기화하기</Button>
        </div>
      </AppShell>
    );
  }

  if (!clip || !currentRef) {
    return (
      <AppShell title="학습" titleClassName="text-[18px] leading-[24px]" showBack onBack={() => navigate(-1)} showDesktopRail={false}>
        <div className="px-4 py-16 text-center">
          <p className="text-muted-foreground">클립을 찾을 수 없습니다</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/library")}>라이브러리로 이동</Button>
        </div>
      </AppShell>
    );
  }

  const leftPanel = <TranscriptPanel />;
  const centerStage = <VideoStage />;
  const rightPanel = <PracticePanel />;

  return (
    <AppShell title="학습" titleClassName="text-[18px] leading-[24px]" showBack onBack={() => navigate(-1)} showDesktopRail={false}>
      <LearningStageMobile leftPanel={leftPanel} centerStage={centerStage} rightPanel={rightPanel} />
    </AppShell>
  );
};

const Learn: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();

  return (
    <LearnStateProvider clipId={clipId}>
      <LearnPageContent />
    </LearnStateProvider>
  );
};

export default Learn;
