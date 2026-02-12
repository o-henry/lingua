export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function getEmbedUrl(videoId: string, start?: number, end?: number): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    modestbranding: "1",
    rel: "0",
  });
  if (start !== undefined) params.set("start", String(Math.floor(start)));
  if (end !== undefined) params.set("end", String(Math.floor(end)));
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function fetchYouTubeOEmbed(youtubeUrl: string): Promise<{ title?: string; channel?: string } | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const payload = (await response.json()) as { title?: string; author_name?: string };
    return {
      title: payload.title,
      channel: payload.author_name,
    };
  } catch {
    return null;
  }
}
