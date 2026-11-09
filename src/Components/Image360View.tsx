import React from "react";
import { Image } from "../Image";
import { LoadState } from "../api";
import "./Image360.css";
import ImageObject360 from "./ImageObject360";
import LoadStatus from "./LoadStatus";

export interface Image360ViewProps {
  images: Image[];
  load: LoadState;
  onRetry: () => void;
}

// e.g. https://renderstuff.com/tools/360-panorama-web-viewer-sharing/?image=https://raw.githubusercontent.com/pruekjika/GardenImg360/main/low-2.jpg
const viewerUrl = (image: Image) =>
  `https://renderstuff.com/tools/360-panorama-web-viewer-sharing/?image=${encodeURIComponent(image.url)}`;

const Image360View: React.FC<Image360ViewProps> = ({ images, load, onRetry }) => {
  const isEmpty = images.length === 0;
  return (
    <section className='panoramas' aria-labelledby='panoramas-title'>
      <div className='panoramas-head'>
        <h2 id='panoramas-title' className='panoramas-title'>
          360 panoramas
        </h2>
        <p className='panoramas-note'>From the ground. Each opens in a panorama viewer in a new tab.</p>
      </div>
      {load.status === "error" ? (
        <LoadStatus message={`Couldn't load the 360 photos. ${load.message}`} onRetry={onRetry} />
      ) : null}
      {load.status === "ready" && isEmpty ? (
        <LoadStatus message='No 360 photos in GardenImg360 yet.' />
      ) : null}
      {load.status === "loading" && isEmpty ? (
        <span className='sr-only' role='status'>
          Loading 360 photos…
        </span>
      ) : null}
      <div className='image-gallery-360' aria-busy={load.status === "loading"}>
        {load.status === "loading" && isEmpty
          ? Array.from({ length: 5 }, (_, i) => (
              <div key={i} className='image-container-360 is-placeholder' aria-hidden='true' />
            ))
          : images.map((image) => (
              <ImageObject360
                key={image.name}
                imgUrl={image.url}
                imgName={image.name}
                href={viewerUrl(image)}
              />
            ))}
      </div>
    </section>
  );
};

export default Image360View;
