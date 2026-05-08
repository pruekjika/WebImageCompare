import React, { useEffect, useRef, useState } from "react";
import ImageObject from "./ImageObject";
import CompareZoomPanPinch from "./CompareZoomPanPinch";
import { Image } from "../Image";
import "./ImageGallery.css";
import ExifReader from "exifreader";

const formatExifDateTime = (dateTimeString: string): string => {
  const [datePart, timePart] = dateTimeString.split(" ");
  const [year, month, day] = datePart.split(":");
  const date = new Date(`${month}/${day}/${year} ${timePart}`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const readExifDate = async (url: string): Promise<string> => {
  const tags = await ExifReader.load(url);
  const raw = tags?.["DateTimeOriginal"]?.description || "";
  if (!raw) return "";
  return formatExifDateTime(raw);
};

const default_Img0 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";
const default_Img1 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/71.webp";

export interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);
  const compareStageRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDateByUrl, setImageDateByUrl] = useState<Record<string, string>>(
    {},
  );

  const [imageDates, setImageDates] = useState<{
    date0: string;
    date1: string;
  }>({ date0: "", date1: "" });

  useEffect(() => {
    if (images.length === 0) return;

    let cancelled = false;

    const run = async () => {
      const CONCURRENCY = 4;
      const queue = images
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
    const fetchData = async () => {
      const url0 = selectedImages[0]?.url || default_Img0;
      const url1 = selectedImages[1]?.url || default_Img1;

      const [date0Cached, date1Cached] = [
        imageDateByUrl[url0],
        imageDateByUrl[url1],
      ];

      const [date0Loaded, date1Loaded] = await Promise.all([
        date0Cached ? Promise.resolve(date0Cached) : readExifDate(url0),
        date1Cached ? Promise.resolve(date1Cached) : readExifDate(url1),
      ]);

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

      const date0 = date0Loaded || "";
      const date1 = date1Loaded || "";
      setImageDates({ date0, date1 });
    };
    fetchData();
  }, [selectedImages, imageDateByUrl]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await compareStageRef.current?.requestFullscreen();
    } catch {
      // Best-effort: fullscreen can fail due to browser/user settings.
    }
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

  return (
    <div className='image-gallery-page'>
      <h1 className='center image-gallery-title'>Image compare</h1>
      <div className='image-gallery'>
        {images.map((image) => (
          <ImageObject
            key={image.name}
            imgUrl={image.url}
            imgName={image.name}
            imgDate={imageDateByUrl[image.url]}
            onClick={() => handleImageClick(image)}
            style={isSelected(image) ? "is-selected" : "is-not-selected"}
          />
        ))}
      </div>

      <div className='current-select-footer'>
        <h1 className='no-margin text-compare-number'>
          {selectedImages[0]?.name.replace(".webp", "") ?? "2"} -{" "}
          {selectedImages[1]?.name.replace(".webp", "") ?? "71"}
        </h1>

        <h3 className='no-margin text-compare-date'>
          {imageDates.date0} - {imageDates.date1}
        </h3>
      </div>

      <div className='compare-toolbar'>
        <button
          type='button'
          className='fullscreen-btn'
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>

      <div ref={compareStageRef} className='compare-stage'>
        <CompareZoomPanPinch
          img1={selectedImages[0]?.url || default_Img0}
          img2={selectedImages[1]?.url || default_Img1}
        />
      </div>
    </div>
  );
};

export default ImageGallery;
