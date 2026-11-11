import { Image } from "./Image";

// No access token: everything here is public and read without credentials.

const IMAGE_FILE = /\.(jpeg|jpg|png|gif|webp)$/i;

const byNumberInName = (a: Image, b: Image) =>
  Number(a.name.match(/\d+/)?.[0]) - Number(b.name.match(/\d+/)?.[0]);

interface IndexEntry {
  name: string;
  url?: string;
  date?: string | null;
  thumb?: string;
}

interface ContentsEntry {
  type: string;
  name: string;
  path: string;
  download_url: string;
}

/**
 * A ~5 KB square preview for the timeline. Uses the index's own `thumb` when GardenImgDB
 * provides one, else a public resize proxy (wsrv.nl) over the full photo: no key, no backend.
 */
export const thumbUrlOf = (image: Image): string =>
  image.thumb ??
  `https://wsrv.nl/?url=${encodeURIComponent(image.url)}&w=144&h=144&fit=cover&output=webp&q=60`;

/**
 * The photo sized for the screen (or the untouched original when `full`): 1920 px wide WebP through the same proxy. The originals are
 * 4096x3072 and ~1.3 MB; this is ~0.45 MB and still holds enough detail for zoom.
 */
export const displayUrlOf = (url: string, full = false): string =>
  full ? url : `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=1920&output=webp&q=75`;

export type LoadState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

/** A failed GitHub request, with what the visitor can do about it. */
export class LoadError extends Error {}

/** Turn any fetch failure into one sentence a visitor can act on. */
export function describeLoadError(error: unknown): string {
  if (error instanceof LoadError) return error.message;
  if (error instanceof TypeError || !navigator.onLine) {
    return "Can't reach GitHub. Check your connection and try again.";
  }
  return "Something went wrong reading it from GitHub. Try again.";
}

async function httpError(response: Response, what: string): Promise<LoadError> {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  if ((response.status === 403 || response.status === 429) && remaining === "0") {
    const minutes = reset
      ? Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60000))
      : 60;
    return new LoadError(
      `GitHub's hourly limit for this network is used up. Try again in about ${minutes} min.`,
    );
  }
  return new LoadError(`GitHub answered HTTP ${response.status} for the ${what}. Try again later.`);
}

/**
 * Read a gallery's index.json (an array of { name, url?, date? }).
 * `url` defaults to `name` and is resolved against the index's own URL;
 * `date` is the EXIF DateTimeOriginal string ("YYYY:MM:DD HH:MM:SS").
 * If the index can't be loaded, list the folder through the GitHub contents API instead.
 * Throws a LoadError when both fail.
 */
export async function fetchImageIndex(
  indexUrl: string,
  fallbackContentsUrl: string,
): Promise<Image[]> {
  try {
    const response = await fetch(indexUrl, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`index.json: HTTP ${response.status}`);
    }
    const entries: IndexEntry[] = await response.json();
    return entries
      .filter((entry) => typeof entry?.name === "string" && IMAGE_FILE.test(entry.name))
      .map((entry) => ({
        name: entry.name,
        url: new URL(entry.url ?? entry.name, indexUrl).href,
        date: entry.date ?? null,
        thumb: entry.thumb ? new URL(entry.thumb, indexUrl).href : undefined,
      }))
      .sort(byNumberInName);
  } catch (error) {
    console.warn("Falling back to the GitHub contents API:", error);
    return fetchImagesFromRepo(fallbackContentsUrl);
  }
}

/**
 * List image files in a public repo folder through the anonymous GitHub contents API.
 * Throws a LoadError (rate limit, HTTP error) or a TypeError (offline) on failure.
 */
export async function fetchImagesFromRepo(contentsUrl: string): Promise<Image[]> {
  const response = await fetch(contentsUrl);
  if (!response.ok) {
    throw await httpError(response, "photo list");
  }
  const entries: ContentsEntry[] = await response.json();
  if (!Array.isArray(entries)) {
    throw new LoadError("GitHub sent back something that isn't a photo list. Try again later.");
  }
  return entries
    .filter((entry) => entry.type === "file" && IMAGE_FILE.test(entry.path))
    .map((entry) => ({
      name: entry.name,
      url: entry.download_url,
      date: null,
    }))
    .sort(byNumberInName);
}
