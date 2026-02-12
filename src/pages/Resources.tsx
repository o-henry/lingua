import React, { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LEARNING_RESOURCE_DOC, LearningResourceSection, ResourceLanguage } from "@/data/learningResources";
import { getSettings } from "@/lib/storage";

const LEVELS: Array<LearningResourceSection["level"]> = ["입문", "초급", "중급", "고급"];

const targetLanguageToResourceLanguage = (value: string): ResourceLanguage => {
  const code = value.trim().toLowerCase();
  return code === "ja" || code === "jp" ? "japanese" : "english";
};

const ResourcesPage: React.FC = () => {
  const settings = useMemo(() => getSettings(), []);
  const [language, setLanguage] = useState<ResourceLanguage>(() => targetLanguageToResourceLanguage(settings.targetLanguage));
  const [level, setLevel] = useState<LearningResourceSection["level"]>(() => {
    return LEVELS.includes(settings.learnerLevel) ? settings.learnerLevel : "초급";
  });

  const currentSection = useMemo(
    () => LEARNING_RESOURCE_DOC.sections.find((section) => section.language === language && section.level === level),
    [language, level]
  );

  return (
    <>
      <PageShell title="레벨별 추천 리소스">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <p className="text-sm font-semibold">{LEARNING_RESOURCE_DOC.title}</p>
          <p className="text-xs text-muted-foreground">{LEARNING_RESOURCE_DOC.executiveSummary}</p>
        </div>

        <div className="mt-4 flex gap-2">
          <Button type="button" size="sm" variant={language === "japanese" ? "default" : "outline"} onClick={() => setLanguage("japanese")}>
            일본어
          </Button>
          <Button type="button" size="sm" variant={language === "english" ? "default" : "outline"} onClick={() => setLanguage("english")}>
            영어
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map((entry) => (
            <Button key={entry} type="button" size="sm" variant={level === entry ? "default" : "outline"} onClick={() => setLevel(entry)}>
              {entry}
            </Button>
          ))}
        </div>

        {currentSection ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{currentSection.cefr}</Badge>
                <span className="text-sm font-semibold">{language === "japanese" ? "일본어" : "영어"} · {currentSection.level}</span>
              </div>
              <p className="text-xs text-muted-foreground">{currentSection.intro}</p>
              <p className="text-xs text-muted-foreground">{currentSection.summary}</p>
            </div>

            {currentSection.videos.map((video, idx) => {
              const query = encodeURIComponent(`${video.title} ${video.channel}`);
              const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
              return (
                <div key={`${video.title}-${idx}`} className="rounded-xl border bg-card p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-5">{idx + 1}. {video.title}</p>
                    <a href={searchUrl} target="_blank" rel="noreferrer noopener" className="text-xs text-primary underline whitespace-nowrap">
                      유튜브 찾기
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">{video.channel} · {video.duration} · 약 {video.estimatedMinutes}분</p>
                  <p className="text-xs"><span className="font-medium">학습 포인트:</span> {video.learningPoint}</p>
                  <p className="text-xs"><span className="font-medium">추천 활동:</span> {video.activity}</p>
                  <p className="text-[11px] text-muted-foreground">자막: {video.subtitles} · 라이선스: {video.license} · 안전성: {video.safety}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">해당 레벨 데이터가 없습니다.</div>
        )}

        <div className="mt-6 rounded-xl border bg-card p-4 space-y-2">
          <p className="text-sm font-semibold">시각자료</p>
          <p className="text-xs text-muted-foreground">{LEARNING_RESOURCE_DOC.visualPie}</p>
          <p className="text-xs text-muted-foreground">{LEARNING_RESOURCE_DOC.visualFlow}</p>
          <p className="text-xs text-muted-foreground">{LEARNING_RESOURCE_DOC.sourceNote}</p>
          <div className="space-y-1">
            {LEARNING_RESOURCE_DOC.references.map((ref) => (
              <a key={ref} href={ref} target="_blank" rel="noreferrer noopener" className="block text-xs text-primary underline break-all">
                {ref}
              </a>
            ))}
          </div>
        </div>
      </PageShell>
      <BottomNav />
    </>
  );
};

export default ResourcesPage;
