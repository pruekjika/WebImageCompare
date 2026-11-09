import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageObject, { Slot } from "./ImageObject";
import CompareZoomPanPinch from "./CompareZoomPanPinch";
import LoadStatus from "./LoadStatus";
import { CollapseIcon, ExpandIcon, PauseIcon, PlayIcon, SwapIcon } from "./Icons";
import { Image } from "../Image";
import { LoadState, thumbUrlOf } from "../api";
import "./ImageGallery.css";

const EXIF_DATE = /^(\d{4}):(\d{1,2}):(\d{1,2})/;

// "YYYY:MM:DD HH:MM:SS" -> "yy.mm.dd"; anything malformed -> "" (shown as no date).
const formatExifDateTimeYYMMDD = (dateTimeString: string): string => {
  const match = EXIF_DATE.exec(dateTimeString);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${year.slice(-2)}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`;
};

// Only for images whose date isn't in index.json: ExifReader downloads the whole
// image, so it is loaded on demand and skipped entirely when the index has dates.
const readExifDate = async (url: string): Promise<string> => {
  const { default: ExifReader } = await import("exifreader");
  const tags = await ExifReader.load(url);
  const raw = tags?.["DateTimeOriginal"]?.description || "";
  return raw ? formatExifDateTimeYYMMDD(raw) : "";
};

const readExifDateOrBlank = (url: string): Promise<string> =>
  readExifDate(url).catch(() => "");

const IMAGE_DB = "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/";
const DEFAULT_A = "2";
const DEFAULT_B = "71";
const FRAME_MS = 650;
const PLACEHOLDER_FRAMES = 14;

const labelOf = (image: Image) => image.name.replace(/\.(webp|jpe?g|png|gif)$/i, "");
const yearOf = (yymmdd: string | undefined) => (yymmdd ? `20${yymmdd.slice(0, 2)}` : "");

const parseYYMMDD = (value: string): number | null => {
  const m = /^(\d{2})\.(\d{2})\.(\d{2})$/.exec(value);
  return m ? Date.UTC(2000 + Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

/** "4 months apart", from two yy.mm.dd dates. */
const describeGap = (a: string, b: string): string => {
  const ta = parseYYMMDD(a);
  const tb = parseYYMMDD(b);
  if (ta === null || tb === null) return "";
  const days = Math.round(Math.abs(tb - ta) / 86_400_000);
  if (days === 0) return "Same day";
  if (days < 60) return `${days} day${days === 1 ? "" : "s"} apart`;
  if (days < 730) return `${Math.round(days / 30.44)} months apart`;
  return `${(days / 365.25).toFixed(1)} years apart`;
};

const SAFE_LABEL = /^[\w.-]{1,40}$/;
const readPairFromUrl = (): { a: string; b: string } => {
  const params = new URLSearchParams(window.location.search);
  const a = params.get("a") ?? "";
  const b = params.get("b") ?? "";
  return {
    a: SAFE_LABEL.test(a) ? a : DEFAULT_A,
    b: SAFE_LABEL.test(b) ? b : DEFAULT_B,
  };
};

const preload = (url: string) =>
  new Promise<void>((resolve) => {
    const img = new window.Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    window.setTimeout(done, 8000);
    img.src = url;
  });

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export interface ImageGalleryProps {
  images: Image[];
  load: LoadState;
  onRetry: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, load, onRetry }) => {
  const [pair, setPair] = useState(readPairFromUrl);
  const [activeSlot, setActiveSlot] = useState<Slot>("a");
  const [playing, setPlaying] = useState(false);
  const lastMoved = useRef<Slot>("b");

  const stageRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const fullscreenBtnRef = useRef<HTMLButtonElement | null>(null);
  const exitBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  // iPhone Safari has no Fullscreen API for elements: fill the viewport with CSS instead.
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const isFullscreen = isNativeFullscreen || isPseudoFullscreen;
  const [exifDateByUrl, setExifDateByUrl] = useState<Record<string, string>>({});

  // ---- the photo list, by label ----
  const order = useMemo(() => images.map(labelOf), [images]);
  const imageByLabel = useMemo(() => {
    const map: Record<string, Image> = {};
    for (const image of images) map[labelOf(image)] = image;
    return map;
  }, [images]);
  const indexDateByUrl = useMemo(() => {
    const dates: Record<string, string> = {};
    for (const img of images) {
      const date = img.date ? formatExifDateTimeYYMMDD(img.date) : "";
      if (date) dates[img.url] = date;
    }
    return dates;
  }, [images]);

  const urlOf = useCallback(
    (label: string) => imageByLabel[label]?.url ?? `${IMAGE_DB}${label}.webp`,
    [imageByLabel],
  );
  const dateOf = (url: string): string => indexDateByUrl[url] ?? exifDateByUrl[url] ?? "";

  const urlA = urlOf(pair.a);
  const urlB = urlOf(pair.b);
  const dateA = dateOf(urlA);
  const dateB = dateOf(urlB);
  const gap = describeGap(dateA, dateB);

  // A pair from the URL that isn't in the archive falls back to the default pair.
  useEffect(() => {
    if (order.length === 0) return;
    setPair((p) => {
      const pick = (label: string, fallback: string) =>
        imageByLabel[label] ? label : imageByLabel[fallback] ? fallback : order[0];
      const a = pick(p.a, DEFAULT_A);
      const b = pick(p.b, DEFAULT_B);
      return a === p.a && b === p.b ? p : { a, b };
    });
  }, [order, imageByLabel]);

  // Keep the pair in the address so a comparison can be shared as a link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("a", pair.a);
    params.set("b", pair.b);
    const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, [pair]);

  // ---- dates for photos the index has no date for (contents-API fallback) ----
  useEffect(() => {
    if (images.length === 0) return;
    let cancelled = false;
    const queue = images.filter((img) => !img.date).map((img) => img.url);
    if (queue.length === 0) return;
    let idx = 0;
    const worker = async () => {
      while (idx < queue.length && !cancelled) {
        const url = queue[idx++];
        const date = await readExifDateOrBlank(url);
        if (cancelled || !date) continue;
        setExifDateByUrl((prev) => (prev[url] ? prev : { ...prev, [url]: date }));
      }
    };
    void Promise.all(Array.from({ length: 4 }, worker));
    return () => {
      cancelled = true;
    };
  }, [images]);

  // ---- choosing photos ----
  const setSlot = useCallback((slot: Slot, label: string) => {
    lastMoved.current = slot;
    setPair((p) => (p[slot] === label ? p : { ...p, [slot]: label }));
  }, []);

  const handleFrameClick = (label: string) => {
    setPlaying(false);
    setSlot(activeSlot, label);
    setActiveSlot((s) => (s === "a" ? "b" : "a"));
  };

  const swap = () => {
    setPlaying(false);
    setPair((p) => ({ a: p.b, b: p.a }));
  };

  const step = useCallback(
    (slot: Slot, delta: number) => {
      if (order.length === 0) return;
      setPlaying(false);
      setPair((p) => {
        const at = order.indexOf(p[slot]);
        const next = order[Math.min(order.length - 1, Math.max(0, (at < 0 ? 0 : at) + delta))];
        lastMoved.current = slot;
        return next === p[slot] ? p : { ...p, [slot]: next };
      });
    },
    [order],
  );

  // Left/Right step B through the timeline, with Shift step A. The slider handle keeps its own arrows.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") return;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable], [role='slider']")) return;
      event.preventDefault();
      step(event.shiftKey ? "a" : "b", event.code === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  // ---- timelapse: walk B forward, one loaded photo at a time ----
  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (order.length < 2) return;
    if (order.indexOf(pair.b) >= order.length - 1) {
      // At the end: start again from the photo after A.
      const after = order.indexOf(pair.a) + 1;
      setSlot("b", order[after > 0 && after < order.length ? after : 0]);
    }
    lastMoved.current = "b";
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const at = order.indexOf(pair.b);
    const next = order[at + 1];
    if (!next) {
      setPlaying(false);
      return;
    }
    let cancelled = false;
    let timer = 0;
    const started = performance.now();
    void preload(urlOf(next)).then(() => {
      if (cancelled) return;
      const wait = Math.max(0, FRAME_MS - (performance.now() - started));
      timer = window.setTimeout(() => {
        if (cancelled) return;
        lastMoved.current = "b";
        setPair((p) => ({ ...p, b: next }));
      }, wait);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [playing, pair.b, order, urlOf]);

  // Keep the photo that just moved in view on the timeline, without scrolling the page.
  useEffect(() => {
    const strip = timelineRef.current;
    if (!strip) return;
    const label = pair[lastMoved.current];
    const frame = strip.querySelector<HTMLElement>(`[data-label="${CSS.escape(label)}"]`);
    if (!frame) return;
    const left = frame.offsetLeft;
    const right = left + frame.offsetWidth;
    const inView = left >= strip.scrollLeft && right <= strip.scrollLeft + strip.clientWidth;
    if (inView && !playing) return;
    strip.scrollTo({
      left: left - strip.clientWidth / 2 + frame.offsetWidth / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [pair, playing, order.length]);

  // A vertical wheel scrolls the timeline sideways, until it reaches an end.
  useEffect(() => {
    const strip = timelineRef.current;
    if (!strip) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = strip.scrollWidth - strip.clientWidth;
      const atStart = strip.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = strip.scrollLeft >= max - 1 && event.deltaY > 0;
      if (max <= 0 || atStart || atEnd) return;
      event.preventDefault();
      strip.scrollLeft += event.deltaY;
    };
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, []);

  // ---- fullscreen ----
  useEffect(() => {
    const onFullscreenChange = () => setIsNativeFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isPseudoFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPseudoFullscreen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isPseudoFullscreen]);

  // Move focus into the stage on entering fullscreen and back to the button on leaving.
  const wasFullscreen = useRef(false);
  useEffect(() => {
    if (isFullscreen) exitBtnRef.current?.focus();
    else if (wasFullscreen.current) fullscreenBtnRef.current?.focus();
    wasFullscreen.current = isFullscreen;
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Best-effort: the browser may already be leaving fullscreen.
      }
      return;
    }
    const stage = stageRef.current;
    if (stage && document.fullscreenEnabled && stage.requestFullscreen) {
      try {
        await stage.requestFullscreen();
        return;
      } catch {
        // Refused by the browser or user settings: fall back to the CSS version.
      }
    }
    setIsPseudoFullscreen(true);
  };

  // ---- render ----
  const isEmpty = images.length === 0;
  const showPlaceholders = load.status === "loading" && isEmpty;
  const canPlay = order.length > 1;

  const slotButton = (slot: Slot, label: string, date: string) => (
    <button
      type='button'
      className='slot'
      data-slot={slot}
      aria-pressed={activeSlot === slot}
      onClick={() => setActiveSlot(slot)}
      title={`Next photo you tap goes to ${slot.toUpperCase()}`}
    >
      <span className='slot-tag'>{slot.toUpperCase()}</span>
      <span className='slot-num'>{label}</span>
      <span className='slot-date'>{date || "–"}</span>
    </button>
  );

  const playButton = (extraClass = "") => (
    <button
      type='button'
      className={`btn ${extraClass}`}
      onClick={togglePlay}
      disabled={!canPlay}
      aria-pressed={playing}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
      <span className='btn-text'>{playing ? "Pause" : "Play timelapse"}</span>
    </button>
  );

  let year = "";
  const frames = images.map((image) => {
    const label = labelOf(image);
    const date = dateOf(image.url);
    const frameYear = yearOf(date);
    const marker =
      frameYear && frameYear !== year ? (
        <span key={`y${frameYear}`} className='timeline-year'>
          {frameYear}
        </span>
      ) : null;
    if (frameYear) year = frameYear;
    const slot: Slot | null = pair.a === label ? "a" : pair.b === label ? "b" : null;
    return (
      <React.Fragment key={image.name}>
        {marker}
        <ImageObject
          label={label}
          date={date}
          thumb={thumbUrlOf(image)}
          slot={slot}
          onClick={() => handleFrameClick(label)}
        />
      </React.Fragment>
    );
  });

  return (
    <section className='compare' aria-labelledby='compare-title'>
      <header className='compare-bar'>
        <h1 id='compare-title' className='compare-title'>
          Image compare
        </h1>
        <div className='pair' aria-live='polite'>
          {slotButton("a", pair.a, dateA)}
          <button
            type='button'
            className='btn btn--icon pair-swap'
            onClick={swap}
            aria-label='Swap A and B'
            title='Swap A and B'
          >
            <SwapIcon />
          </button>
          {slotButton("b", pair.b, dateB)}
          {gap ? <span className='pair-gap'>{gap}</span> : null}
        </div>
        <div className='compare-actions'>
          {playButton()}
          <button
            ref={fullscreenBtnRef}
            type='button'
            className='btn'
            onClick={toggleFullscreen}
          >
            <ExpandIcon />
            <span className='btn-text'>Fullscreen</span>
          </button>
        </div>
      </header>

      <div
        ref={stageRef}
        className={`stage${isPseudoFullscreen ? " is-pseudo-fullscreen" : ""}`}
        role={isPseudoFullscreen ? "dialog" : undefined}
        aria-modal={isPseudoFullscreen ? true : undefined}
        aria-label={`Compare photo ${pair.a} with photo ${pair.b}`}
      >
        <div className='stage-frame'>
          {/* Remount on a size change so the zoom layer re-centres in the new frame. */}
          <CompareZoomPanPinch
            key={isFullscreen ? "fullscreen" : "inline"}
            img1={urlA}
            img2={urlB}
            label1={pair.a}
            label2={pair.b}
          />
          <span className='stage-label' data-slot='a' aria-hidden='true'>
            <b>A</b> {pair.a}
            {dateA ? <span>{dateA}</span> : null}
          </span>
          <span className='stage-label' data-slot='b' aria-hidden='true'>
            <b>B</b> {pair.b}
            {dateB ? <span>{dateB}</span> : null}
          </span>
          {isFullscreen ? (
            <div className='stage-controls'>
              {playButton("btn--on-photo")}
              <button
                ref={exitBtnRef}
                type='button'
                className='btn btn--on-photo'
                onClick={toggleFullscreen}
              >
                <CollapseIcon />
                Exit fullscreen
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className='timeline-wrap'>
        <div className='timeline-head'>
          <h2 className='timeline-title'>
            Timeline{" "}
            {order.length > 0 ? <span>{order.length} photos</span> : null}
          </h2>
          <p className='timeline-hint'>
            Tap a photo to set <b data-slot={activeSlot}>{activeSlot.toUpperCase()}</b>
            <span className='timeline-keys'>
              {" "}
              · <kbd>←</kbd> <kbd>→</kbd> step B, add <kbd>Shift</kbd> for A
            </span>
          </p>
        </div>
        {load.status === "error" ? (
          <LoadStatus
            message={
              isEmpty
                ? `Couldn't load the photo list. ${load.message}`
                : `Couldn't refresh the photo list. ${load.message}`
            }
            onRetry={onRetry}
          />
        ) : null}
        {load.status === "ready" && isEmpty ? (
          <LoadStatus message='No photos in GardenImgDB yet.' />
        ) : null}
        {showPlaceholders ? (
          <span className='sr-only' role='status'>
            Loading photos…
          </span>
        ) : null}
        <div
          ref={timelineRef}
          className='timeline'
          aria-busy={load.status === "loading"}
          aria-label='Photo timeline'
          role='group'
        >
          {showPlaceholders
            ? Array.from({ length: PLACEHOLDER_FRAMES }, (_, i) => (
                <span key={i} className='frame is-placeholder' aria-hidden='true'>
                  <span className='frame-image' />
                </span>
              ))
            : frames}
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;
