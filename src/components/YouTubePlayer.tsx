import React, { useRef, useEffect, useCallback, useState } from "react";
import { getEmbedUrl } from "@/lib/youtube";

interface YouTubePlayerProps {
  videoId: string;
  startSec?: number;
  endSec?: number;
  loop?: boolean;
  className?: string;
  onEmbedError?: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  startSec,
  endSec,
  loop = false,
  className = "",
  onEmbedError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState(false);

  const embedUrl = getEmbedUrl(videoId, startSec, endSec);

  const handleError = useCallback(() => {
    setError(true);
    onEmbedError?.();
  }, [onEmbedError]);

  useEffect(() => {
    if (!loop || !iframeRef.current) return;
    // For loop, we reload the iframe when the video would end
    const duration = (endSec || 180) - (startSec || 0);
    const interval = setInterval(() => {
      if (iframeRef.current) {
        iframeRef.current.src = embedUrl + "&autoplay=1";
      }
    }, duration * 1000);
    return () => clearInterval(interval);
  }, [loop, startSec, endSec, embedUrl]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-8 text-center">
        <span className="text-3xl mb-2">🚫</span>
        <p className="text-sm font-medium text-foreground">임베드가 비활성화된 영상입니다</p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-sm text-primary underline"
        >
          YouTube에서 직접 보기 →
        </a>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`} style={{ paddingBottom: "56.25%" }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute inset-0 w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={handleError}
        title="YouTube video player"
      />
    </div>
  );
};

export default YouTubePlayer;
