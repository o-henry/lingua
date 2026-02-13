import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface LearningStageMobileProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
}

const TABLET_QUERY = "(min-width: 768px) and (max-width: 1199px)";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
};

const LearningStageMobile: React.FC<LearningStageMobileProps> = ({ leftPanel, centerStage, rightPanel }) => {
  const isTablet = useMediaQuery(TABLET_QUERY);

  if (isTablet) {
    return (
      <>
        <div className="learning-tablet-grid px-4 py-4">
          <aside className="learning-tablet-left">{leftPanel}</aside>
          <section className="learning-tablet-center">{centerStage}</section>
        </div>

        <div className="fixed bottom-5 right-5 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="rounded-full px-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                <SlidersHorizontal className="h-4 w-4" />
                입력/저장 열기
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[420px] max-w-[90vw] overflow-y-auto px-4 py-6">
              <SheetHeader>
                <SheetTitle>입력/저장/AI</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{rightPanel}</div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 pb-8">
      {centerStage}
      {leftPanel}
      {rightPanel}
    </div>
  );
};

export default LearningStageMobile;
