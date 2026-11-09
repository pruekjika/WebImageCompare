import React, { useEffect, useMemo, useRef, useState } from "react";
import ImageObject from "./ImageObject";
import CompareZoomPanPinch from "./CompareZoomPanPinch";
import LoadStatus from "./LoadStatus";
import { Image } from "../Image";
import { LoadState } from "../api";
import "./ImageGallery.css";

const EXIF_DATE = /^(\d{4}):(\d{1,2}):(\d{1,2})/;

const formatExifDateTime = (dateTimeString: string): string => {
  const match = EXIF_DATE.exec(dateTimeString);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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
  if (!raw) return "";
  // Precompute alternate format (yy.mm.dd) for easy future switching.
  formatExifDateTime(raw); // format 12 may 2026 ถ้าอยากเปลี่ยนใช้ก็เอาอันนี้แทนด้านล่าง
  return formatExifDateTimeYYMMDD(raw);
};

const readExifDateOrBlank = (url: string): Promise<string> =>
  readExifDate(url).catch(() => "");

const default_Img0 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";
const default_Img1 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/71.webp";

const PLACEHOLDER_TILES = 30;

export interface ImageGalleryProps {
  images: Image[];
  load: LoadState;
  onRetry: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, load, onRetry }) => {
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);
  const compareStageRef = useRef<HTMLDivElement | null>(null);
  const fullscreenBtnRef = useRef<HTMLButtonElement | null>(null);
  const exitBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  // iPhone Safari has no Fullscreen API for elements: fill the viewport with CSS instead.
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const isFullscreen = isNativeFullscreen || isPseudoFullscreen;
  const [imageDateByUrl, setImageDateByUrl] = useState<Record<string, string>>(
    {},
  );

  const [imageDates, setImageDates] = useState<{
    date0: string;
    date1: string;
  }>({ date0: "", date1: "" });

  const indexDateByUrl = useMemo(() => {
    const dates: Record<string, string> = {};
    for (const img of images) {
      const date = img.date ? formatExifDateTimeYYMMDD(img.date) : "";
      if (date) dates[img.url] = date;
    }
    return dates;
  }, [images]);

  const dateOf = (url: string): string | undefined =>
    indexDateByUrl[url] ?? imageDateByUrl[url];

  useEffect(() => {
    if (images.length === 0) return;

    let cancelled = false;

    const run = async () => {
      const CONCURRENCY = 4;
      const queue = images
        .filter((img) => !img.date)
        .map((img) => img.url)
        .filter((url) => url && !imageDateByUrl[url]);
      if (queue.length === 0) return;

      let idx = 0;
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (idx < queue.length && !cancelled) {
          const url = queue[idx++];
          try {
            const date = await readExifDate(url);
            if (cancelled) return;
            if (!date) continue;
            setImageDateByUrl((prev) =>
              prev[url] ? prev : { ...prev, [url]: date },
            );
          } catch {
            // ignore images without EXIF / network failures
          }
        }
      });

      await Promise.all(workers);
    };

    void run();

    return () => {
      cancelled = true;
    };
    // Intentionally do not depend on imageDateByUrl to avoid re-creating the job repeatedly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useEffect(() => {
    // Wait for the image list, so dates already in index.json aren't re-read from EXIF.
    if (images.length === 0) return;

    let cancelled = false;
    const fetchData = async () => {
      const url0 = selectedImages[0]?.url || default_Img0;
      const url1 = selectedImages[1]?.url || default_Img1;

      const [date0Cached, date1Cached] = [dateOf(url0), dateOf(url1)];

      const [date0Loaded, date1Loaded] = await Promise.all([
        date0Cached ? Promise.resolve(date0Cached) : readExifDateOrBlank(url0),
        date1Cached ? Promise.resolve(date1Cached) : readExifDateOrBlank(url1),
      ]);
      if (cancelled) return;

      if (date0Loaded) {
        setImageDateByUrl((prev) =>
          prev[url0] ? prev : { ...prev, [url0]: date0Loaded },
        );
      }
      if (date1Loaded) {
        setImageDateByUrl((prev) =>
          prev[url1] ? prev : { ...prev, [url1]: date1Loaded },
        );
      }

      setImageDates({ date0: date0Loaded || "", date1: date1Loaded || "" });
    };
    void fetchData();
    return () => {
      cancelled = true;
    };
    // dateOf only reads indexDateByUrl and imageDateByUrl, which are listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, selectedImages, indexDateByUrl, imageDateByUrl]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
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
    const stage = compareStageRef.current;
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

  const handleImageClick = (image: Image) => {
    if (selectedImages.length < 2) {
      setSelectedImages((prevSelectedImages) => [...prevSelectedImages, image]);
    } else {
      setSelectedImages((prevSelectedImages) => {
        if (prevSelectedImages[0] === image) {
          return [prevSelectedImages[1]];
        } else {
          return [image, prevSelectedImages[0]];
        }
      });
    }
  };

  const isSelected = (image: Image): boolean => {
    return selectedImages.includes(image);
  };

  const name0 = selectedImages[0]?.name.replace(".webp", "") ?? "2";
  const name1 = selectedImages[1]?.name.replace(".webp", "") ?? "71";
  const isEmpty = images.length === 0;
  const showPlaceholders = load.status === "loading" && isEmpty;

  const caption = (
    <>
      <h1 className='no-margin text-compare-number'>
        {name0} - {name1}
      </h1>
      {imageDates.date0 || imageDates.date1 ? (
        <h3 className='no-margin text-compare-date'>
          {imageDates.date0 || "?"} - {imageDates.date1 || "?"}
        </h3>
      ) : null}
    </>
  );

  return (
    <div className='image-gallery-page'>
      <h1 className='center image-gallery-title'>Image compare</h1>
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
      <div className='image-gallery' aria-busy={load.status === "loading"}>
        {showPlaceholders
          ? Array.from({ length: PLACEHOLDER_TILES }, (_, i) => (
              <div key={i} className='image-container is-placeholder' aria-hidden='true' />
            ))
          : images.map((image) => (
              <ImageObject
                key={image.name}
                imgName={image.name}
                imgDate={dateOf(image.url)}
                onClick={() => handleImageClick(image)}
                selected={isSelected(image)}
              />
            ))}
      </div>

      {!isFullscreen && (
        <div className='current-select-footer' aria-live='polite'>
          {caption}
        </div>
      )}

      <div className='compare-toolbar'>
        <button
          ref={fullscreenBtnRef}
          type='button'
          className='btn fullscreen-btn'
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>

      <div
        ref={compareStageRef}
        className={`compare-stage${isPseudoFullscreen ? " is-pseudo-fullscreen" : ""}`}
        role={isPseudoFullscreen ? "dialog" : undefined}
        aria-modal={isPseudoFullscreen ? true : undefined}
        aria-label={isPseudoFullscreen ? `Compare photos ${name0} and ${name1}` : undefined}
      >
        {isFullscreen && (
          <>
            <button
              ref={exitBtnRef}
              type='button'
              className='btn stage-exit-btn'
              onClick={toggleFullscreen}
            >
              Exit fullscreen
            </button>
            <div className='current-select-footer current-select-footer--overlay'>
              {caption}
            </div>
          </>
        )}
        {/* Remount on a size change so the zoom layer re-centres in the new frame. */}
        <CompareZoomPanPinch
          key={isFullscreen ? "fullscreen" : "inline"}
          img1={selectedImages[0]?.url || default_Img0}
          img2={selectedImages[1]?.url || default_Img1}
          label1={name0}
          label2={name1}
        />
      </div>
    </div>
  );
};

export default ImageGallery;
