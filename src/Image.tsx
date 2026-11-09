export interface Image {
  name: string;
  url: string;
  date: string | null;
  /** A small preview for the timeline; falls back to a resized copy of `url`. */
  thumb?: string;
}
