import "./App.css";
import { useCallback, useEffect, useState } from "react";
import ImageGallery from "./Components/ImageGallery";
import Image360View from "./Components/Image360View";
import ErrorBoundary from "./Components/ErrorBoundary";
import {
  LoadState,
  describeLoadError,
  fetchImageIndex,
  fetchImagesFromRepo,
} from "./api";
import { Image } from "./Image";

const loadGardenImages = () =>
  fetchImageIndex(
    "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/index.json",
    "https://api.github.com/repos/pruekjika/GardenImgDB/contents/ImageDB/",
  );

const load360Images = () =>
  fetchImagesFromRepo("https://api.github.com/repos/pruekjika/GardenImg360/contents/");

/** Load a gallery once, keep the last good list on a failed retry. */
function useGallery(loader: () => Promise<Image[]>) {
  const [images, setImages] = useState<Image[]>([]);
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
    loader()
      .then((loaded) => {
        if (cancelled) return;
        setImages(loaded);
        setLoad({ status: "ready" });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error:", error);
        setLoad({ status: "error", message: describeLoadError(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [loader, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { images, load, retry };
}

function App() {
  const garden = useGallery(loadGardenImages);
  const garden360 = useGallery(load360Images);

  return (
    <>
      <ErrorBoundary section='The 360 photos'>
        <Image360View
          images={garden360.images}
          load={garden360.load}
          onRetry={garden360.retry}
        />
      </ErrorBoundary>
      <ErrorBoundary section='Image compare'>
        <ImageGallery
          images={garden.images}
          load={garden.load}
          onRetry={garden.retry}
        />
      </ErrorBoundary>
    </>
  );
}

export default App;
