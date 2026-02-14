import React, { useEffect, useMemo, useRef, useState } from "react";
import { getYoutubeWatchUrl } from "@/lib/youtube";

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, options: Record<string, unknown>) => YTPlayer;
      PlayerState: {
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  destroy: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  cueVideoById: (options: { videoId: string; startSeconds?: number; endSeconds?: number }) => void;
  loadVideoById: (options: { videoId: string; startSeconds?: number; endSeconds?: number }) => void;
}

interface YouTubePlayerProps {
  videoId: string;
  startSec?: number;
  endSec?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onEmbedError?: () => void;
}

let ytScriptPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (ytScriptPromise) {
    return ytScriptPromise;
  }

  ytScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

    if (existing) {
      const checkReady = () => {
        if (window.YT?.Player) {
          resolve();
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });

  return ytScriptPromise;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  startSec = 0,
  endSec,
  loop = false,
  autoplay = false,
  className = "",
  onEmbedError,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const normalizedStart = useMemo(() => Math.max(0, Math.floor(startSec)), [startSec]);
  const normalizedEnd = useMemo(() => {
    if (endSec === undefined) return undefined;
    return Math.floor(endSec);
  }, [endSec]);

  useEffect(() => {
    let cancelled = false;

    setReady(false);
    setError(false);

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: normalizedStart,
          ...(normalizedEnd !== undefined ? { end: normalizedEnd } : {}),
        },
        events: {
          onReady: () => {
            if (cancelled || !playerRef.current) return;
            setReady(true);
            playerRef.current.seekTo(normalizedStart, true);
            if (autoplay) {
              playerRef.current.playVideo();
            }
          },
          onError: (event: { data?: number }) => {
            const code = event?.data;
            if (code === 101 || code === 150 || code === 5 || code === 2) {
              setError(true);
              onEmbedError?.();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (!ready || !playerRef.current || error) return;

    try {
      playerRef.current.loadVideoById({
        videoId,
        startSeconds: normalizedStart,
        ...(normalizedEnd !== undefined ? { endSeconds: normalizedEnd } : {}),
      });
      if (!autoplay) {
        playerRef.current.pauseVideo();
      }
    } catch {
      // If API call fails transiently, keep current player state.
    }
  }, [videoId, normalizedStart, normalizedEnd, ready, error]);

  useEffect(() => {
    if (!ready || !playerRef.current || !loop || normalizedEnd === undefined || error) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;
      const now = playerRef.current.getCurrentTime();
      if (Number.isFinite(now) && now >= normalizedEnd) {
        playerRef.current.seekTo(normalizedStart, true);
        playerRef.current.playVideo();
      }
    }, 250);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loop, normalizedStart, normalizedEnd, ready, error]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-8 text-center">
        <span className="text-3xl mb-2">🚫</span>
        <p className="text-sm font-medium text-foreground">임베드가 비활성화된 영상입니다</p>
        <p className="text-xs text-muted-foreground mt-1">YouTube에서 직접 재생하고 같은 구간을 복습할 수 있습니다.</p>
        <a
          href={getYoutubeWatchUrl(videoId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-sm text-primary underline"
        >
          YouTube에서 보기 →
        </a>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`} style={{ paddingBottom: "56.25%" }}>
      <div ref={hostRef} className="absolute inset-0 h-full w-full rounded-[inherit]" />
    </div>
  );
};

export default YouTubePlayer;
