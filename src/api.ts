import { Image } from "./Image";

// No access token: everything here is public and read without credentials.

const IMAGE_FILE = /\.(jpeg|jpg|png|gif|webp)$/i;

const byNumberInName = (a: Image, b: Image) =>
  Number(a.name.match(/\d+/)?.[0]) - Number(b.name.match(/\d+/)?.[0]);

interface IndexEntry {
  name: string;
  url?: string;
  date?: string | null;
}

interface ContentsEntry {
  type: string;
  name: string;
  path: string;
  download_url: string;
}

/**
 * Read a gallery's index.json (an array of { name, url?, date? }).
 * `url` defaults to `name` and is resolved against the index's own URL;
 * `date` is the EXIF DateTimeOriginal string ("YYYY:MM:DD HH:MM:SS").
 * If the index can't be loaded, list the folder through the GitHub contents API instead.
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
      .filter((entry) => IMAGE_FILE.test(entry.name))
      .map((entry) => ({
        name: entry.name,
        url: new URL(entry.url ?? entry.name, indexUrl).href,
        date: entry.date ?? null,
      }))
      .sort(byNumberInName);
  } catch (error) {
    console.warn("Falling back to the GitHub contents API:", error);
    return fetchImagesFromRepo(fallbackContentsUrl);
  }
}

/** List image files in a public repo folder through the anonymous GitHub contents API. */
export async function fetchImagesFromRepo(contentsUrl: string): Promise<Image[]> {
  try {
    const response = await fetch(contentsUrl);
    if (!response.ok) {
      throw new Error(`contents API: HTTP ${response.status}`);
    }
    const entries: ContentsEntry[] = await response.json();
    return entries
      .filter((entry) => entry.type === "file" && IMAGE_FILE.test(entry.path))
      .map((entry) => ({
        name: entry.name,
        url: entry.download_url,
        date: null,
      }))
      .sort(byNumberInName);
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
