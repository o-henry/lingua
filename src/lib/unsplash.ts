interface ResolveUnsplashCoverInput {
  title?: string;
  channel?: string;
  seed?: string;
}

export interface UnsplashCoverMeta {
  imageUrl: string;
  query: string;
  photoId?: string;
  authorName?: string;
  authorLink?: string;
}

interface UnsplashPhotoResult {
  id: string;
  alt_description?: string | null;
  description?: string | null;
  slug?: string | null;
  urls?: {
    regular?: string;
    small?: string;
  };
  user?: {
    name?: string;
    links?: {
      html?: string;
    };
  };
}

interface UnsplashSearchResponse {
  results?: UnsplashPhotoResult[];
}

const UNSPLASH_ACCESS_KEY = (import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "").trim();

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "from",
  "by",
  "at",
  "is",
  "are",
  "was",
  "were",
  "this",
  "that",
  "these",
  "those",
  "how",
  "what",
  "when",
  "why",
  "where",
  "lesson",
  "learn",
  "learning",
  "study",
  "episode",
  "part",
  "clip",
  "video",
  "shorts",
  "reels",
  "intro",
  "beginner",
  "intermediate",
  "advanced",
  "입문",
  "초급",
  "중급",
  "고급",
  "학습",
  "강의",
  "레슨",
  "영상",
  "일본어",
  "영어",
  "日本語",
  "英語",
]);

const UNSAFE_KEYWORDS = [
  "sex",
  "sexy",
  "nude",
  "nudity",
  "porn",
  "xxx",
  "fetish",
  "adult",
  "violence",
  "violent",
  "gore",
  "bloody",
  "murder",
  "kill",
  "weapon",
  "gun",
  "knife",
  "rape",
  "suicide",
  "마약",
  "성인",
  "야동",
  "노출",
  "폭력",
  "살인",
  "잔인",
  "자해",
  "drug",
  "drugs",
  "naked",
  "nsfw",
  "erotic",
  "エロ",
  "ヌード",
  "暴力",
  "殺人",
  "麻薬",
];

const SAFE_FALLBACK_QUERY = "language learning workspace pastel minimal";
const SAFE_SUFFIX = "clean minimal pastel soft light";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#@][\w-]+/g, " ")
    .replace(/[()[\]{}|'"`~!$%^&*+=:;,.<>/?\\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsUnsafeKeyword(value: string): boolean {
  const text = normalizeText(value);
  if (!text) return false;
  return UNSAFE_KEYWORDS.some((keyword) => text.includes(keyword));
}

function buildQueryTokens(title?: string, channel?: string): string[] {
  const raw = normalizeText([title || "", channel || ""].join(" "));
  if (!raw) return [];

  return raw
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => !containsUnsafeKeyword(token));
}

function buildSafeUnsplashQuery(title?: string, channel?: string): string {
  const sourceText = `${title || ""} ${channel || ""}`;
  if (containsUnsafeKeyword(sourceText)) {
    return SAFE_FALLBACK_QUERY;
  }

  const tokens = buildQueryTokens(title, channel).slice(0, 6);
  if (tokens.length === 0) {
    return SAFE_FALLBACK_QUERY;
  }

  return `${tokens.join(" ")} ${SAFE_SUFFIX}`;
}

function buildUnsplashSourceUrl(query: string, seed: string): string {
  const sig = hashString(`${seed}:${query}`);
  const encodedQuery = encodeURIComponent(query);
  return `https://source.unsplash.com/random/1200x675/?${encodedQuery}&sig=${sig}`;
}

function isSafeResult(result: UnsplashPhotoResult): boolean {
  const combined = [result.alt_description || "", result.description || "", result.slug || ""].join(" ");
  return !containsUnsafeKeyword(combined);
}

async function fetchUnsplashCoverFromApi(query: string): Promise<UnsplashCoverMeta | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  const endpoint = new URL("https://api.unsplash.com/search/photos");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("page", "1");
  endpoint.searchParams.set("per_page", "18");
  endpoint.searchParams.set("orientation", "landscape");
  endpoint.searchParams.set("content_filter", "high");

  try {
    const response = await fetch(endpoint.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as UnsplashSearchResponse;
    const candidates = payload.results || [];
    const picked = candidates.find((item) => isSafeResult(item) && (item.urls?.regular || item.urls?.small));
    if (!picked) return null;

    const baseImageUrl = picked.urls?.regular || picked.urls?.small;
    if (!baseImageUrl) return null;

    return {
      imageUrl: `${baseImageUrl}&auto=format&fit=crop&w=1200&q=80`,
      query,
      photoId: picked.id,
      authorName: picked.user?.name || undefined,
      authorLink: picked.user?.links?.html
        ? `${picked.user.links.html}${picked.user.links.html.includes("?") ? "&" : "?"}utm_source=daily_lingual_boost&utm_medium=referral`
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function resolveUnsplashCover(input: ResolveUnsplashCoverInput): Promise<UnsplashCoverMeta> {
  const query = buildSafeUnsplashQuery(input.title, input.channel);
  const seed = input.seed || input.title || input.channel || "clip";

  const fromApi = await fetchUnsplashCoverFromApi(query);
  if (fromApi) return fromApi;

  return {
    imageUrl: buildUnsplashSourceUrl(query, seed),
    query,
  };
}
